"use client";

import {
  DownloadIcon,
  FileArchiveIcon,
  FileJsonIcon,
  Loader2Icon,
  RotateCcwIcon,
  UploadIcon,
} from "lucide-react";
import { type ChangeEvent, useMemo, useRef, useState } from "react";
import type { BundledLanguage } from "shiki";
import { toast } from "sonner";
import {
  CodeBlock,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockHeader,
} from "@/components/ai-elements/code-block";
import {
  FileTree,
  FileTreeFile,
  FileTreeFolder,
  FileTreeIcon,
} from "@/components/ai-elements/file-tree";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const ALLOWED_EXTENSIONS = ["rbxlx", "rbxmx", "rbxl", "rbxm"] as const;
type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number];

interface ConvertedFile {
  contents: string;
  path: string;
}

interface ConvertOutput {
  files: ConvertedFile[];
  zip: Uint8Array;
}

interface RbxlxToRojoWasmModule {
  convert: (
    bytes: Uint8Array,
    extension: string,
    projectName: string,
    excludeInitMeta: boolean
  ) => ConvertOutput;
  default: () => Promise<unknown>;
}

interface ConversionResult {
  files: ConvertedFile[];
  projectName: string;
  zip: Uint8Array;
}

type TreeNode =
  | { type: "folder"; name: string; path: string; children: TreeNode[] }
  | { type: "file"; name: string; path: string; contents: string };

const WASM_MODULE_URL = "/wasm/rbxlx-to-rojo/rbxlx_to_rojo_wasm.js";

let wasmModulePromise: Promise<RbxlxToRojoWasmModule> | null = null;

function loadWasmModule(): Promise<RbxlxToRojoWasmModule> {
  if (!wasmModulePromise) {
    wasmModulePromise = (async () => {
      const wasmModule = (await import(
        /* webpackIgnore: true */ WASM_MODULE_URL
      )) as RbxlxToRojoWasmModule;
      await wasmModule.default();
      return wasmModule;
    })();
  }
  return wasmModulePromise;
}

function getExtension(fileName: string): AllowedExtension | null {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return ALLOWED_EXTENSIONS.find((allowed) => allowed === extension) ?? null;
}

function buildTree(files: ConvertedFile[]): TreeNode[] {
  const root: TreeNode[] = [];
  const folders = new Map<string, TreeNode[]>();
  folders.set("", root);

  const ensureFolder = (path: string, name: string, parentPath: string) => {
    const existing = folders.get(path);
    if (existing) {
      return existing;
    }
    const children: TreeNode[] = [];
    const parent = ensureFolder(
      parentPath,
      parentPath.split("/").pop() ?? "",
      parentPath.slice(0, parentPath.lastIndexOf("/"))
    );
    parent.push({ type: "folder", name, path, children });
    folders.set(path, children);
    return children;
  };

  const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path));

  for (const file of sortedFiles) {
    const segments = file.path.split("/");
    const name = segments.at(-1) ?? file.path;
    const parentPath = segments.slice(0, -1).join("/");
    const parent = ensureFolder(
      parentPath,
      segments.at(-2) ?? "",
      segments.slice(0, -2).join("/")
    );
    parent.push({
      type: "file",
      name,
      path: file.path,
      contents: file.contents,
    });
  }

  return root;
}

function collectFolderPaths(nodes: TreeNode[]): string[] {
  const paths: string[] = [];
  for (const node of nodes) {
    if (node.type === "folder") {
      paths.push(node.path, ...collectFolderPaths(node.children));
    }
  }
  return paths;
}

function languageForPath(path: string): BundledLanguage {
  if (path.endsWith(".lua")) {
    return "lua";
  }
  return "json";
}

function downloadZip(zip: Uint8Array, projectName: string) {
  const blobUrl = URL.createObjectURL(
    new Blob([zip as unknown as BlobPart], { type: "application/zip" })
  );
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = `${projectName}-rojo.zip`;
  link.click();
  URL.revokeObjectURL(blobUrl);
}

function TreeNodes({ nodes }: { nodes: TreeNode[] }) {
  return (
    <>
      {nodes.map((node) =>
        node.type === "folder" ? (
          <FileTreeFolder key={node.path} name={node.name} path={node.path}>
            <TreeNodes nodes={node.children} />
          </FileTreeFolder>
        ) : (
          <FileTreeFile
            icon={
              node.name.endsWith(".json") ? (
                <FileTreeIcon>
                  <FileJsonIcon className="size-4 text-muted-foreground" />
                </FileTreeIcon>
              ) : undefined
            }
            key={node.path}
            name={node.name}
            path={node.path}
          />
        )
      )}
    </>
  );
}

function FileExplorer({
  result,
  onReset,
}: {
  result: ConversionResult;
  onReset: () => void;
}) {
  const tree = useMemo(() => buildTree(result.files), [result.files]);
  const defaultExpanded = useMemo(
    () => new Set(collectFolderPaths(tree)),
    [tree]
  );
  const [selectedPath, setSelectedPath] = useState<string | undefined>(
    () => result.files.find((file) => file.path.endsWith(".lua"))?.path
  );

  const selectedFile = result.files.find((file) => file.path === selectedPath);

  return (
    <div className="flex h-full flex-1 flex-col gap-4 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-lg tracking-tight">
            {result.projectName}
          </h2>
          <p className="text-muted-foreground text-sm">
            {result.files.length} files ready. Browse the project before
            downloading it as a Rojo project.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button onClick={onReset} variant="outline">
            <RotateCcwIcon />
            Convert another
          </Button>
          <Button onClick={() => downloadZip(result.zip, result.projectName)}>
            <DownloadIcon />
            Download zip
          </Button>
        </div>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-[280px_1fr] gap-4">
        <FileTree
          className="max-h-[600px] overflow-auto"
          defaultExpanded={defaultExpanded}
          onSelect={setSelectedPath}
          selectedPath={selectedPath}
        >
          <TreeNodes nodes={tree} />
        </FileTree>
        {selectedFile ? (
          <CodeBlock
            className="max-h-[600px]"
            code={selectedFile.contents}
            language={languageForPath(selectedFile.path)}
            showLineNumbers
          >
            <CodeBlockHeader>
              <CodeBlockFilename>{selectedFile.path}</CodeBlockFilename>
              <CodeBlockCopyButton />
            </CodeBlockHeader>
          </CodeBlock>
        ) : (
          <div className="flex items-center justify-center rounded-md border text-muted-foreground text-sm">
            Select a file to preview it
          </div>
        )}
      </div>
    </div>
  );
}

export function RbxlxToRojoUploader() {
  const [isConverting, setIsConverting] = useState(false);
  const [excludeInitMeta, setExcludeInitMeta] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    const extension = getExtension(file.name);
    if (!extension) {
      toast.error("File must be a .rbxlx, .rbxmx, .rbxl, or .rbxm file");
      return;
    }

    setIsConverting(true);
    try {
      const wasmModule = await loadWasmModule();
      const bytes = new Uint8Array(await file.arrayBuffer());
      const projectName = file.name.slice(0, -(extension.length + 1));
      const output = wasmModule.convert(
        bytes,
        extension,
        projectName,
        excludeInitMeta
      );

      setResult({ projectName, zip: output.zip, files: output.files });
      toast.success("Converted! Browse the files or download the zip.");
    } catch (error) {
      console.warn("Failed to convert file", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to convert file"
      );
    } finally {
      setIsConverting(false);
    }
  };

  if (result) {
    return (
      <div className={cn("flex flex-1 flex-col")}>
        <FileExplorer onReset={() => setResult(null)} result={result} />
      </div>
    );
  }

  return (
    <Empty className="flex-1 gap-8 p-10">
      <EmptyHeader className="max-w-lg gap-4">
        <EmptyMedia variant="icon">
          <FileArchiveIcon />
        </EmptyMedia>
        <EmptyTitle className="font-semibold text-3xl tracking-tight">
          Convert a place file to a Rojo project
        </EmptyTitle>
        <EmptyDescription className="text-base">
          Upload a .rbxlx, .rbxmx, .rbxl, or .rbxm file. Conversion runs
          entirely in your browser. You'll be able to browse the generated
          scripts before downloading a Rojo project as a zip.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={excludeInitMeta}
            id="exclude-init-meta"
            onCheckedChange={(checked) => setExcludeInitMeta(checked === true)}
          />
          <Label className="font-normal text-sm" htmlFor="exclude-init-meta">
            Exclude init.meta.json files
          </Label>
        </div>
        <input
          accept=".rbxlx,.rbxmx,.rbxl,.rbxm"
          className="hidden"
          disabled={isConverting}
          onChange={handleFileChange}
          ref={fileInputRef}
          type="file"
        />
        <Button
          disabled={isConverting}
          onClick={() => fileInputRef.current?.click()}
        >
          {isConverting ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <UploadIcon />
          )}
          {isConverting ? "Converting..." : "Upload a file"}
        </Button>
      </EmptyContent>
    </Empty>
  );
}
