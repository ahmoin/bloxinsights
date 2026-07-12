"use client";

import { FileArchiveIcon, Loader2Icon, UploadIcon } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

const ALLOWED_EXTENSIONS = ["rbxlx", "rbxmx", "rbxl", "rbxm"] as const;
type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number];

interface RbxlxToRojoWasmModule {
  convert: (
    bytes: Uint8Array,
    extension: string,
    projectName: string
  ) => Uint8Array;
  default: () => Promise<unknown>;
}

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

export function RbxlxToRojoUploader() {
  const [isConverting, setIsConverting] = useState(false);
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
      const zipBytes = wasmModule.convert(bytes, extension, projectName);

      const blobUrl = URL.createObjectURL(
        new Blob([zipBytes as unknown as BlobPart], {
          type: "application/zip",
        })
      );
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${projectName}-rojo.zip`;
      link.click();
      URL.revokeObjectURL(blobUrl);
      toast.success("Converted! Your Rojo project has downloaded as a zip.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to convert file"
      );
    } finally {
      setIsConverting(false);
    }
  };

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
          entirely in your browser and downloads a Rojo project as a zip.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
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
