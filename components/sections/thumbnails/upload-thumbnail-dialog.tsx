"use client";

import {
  DownloadIcon,
  ExternalLinkIcon,
  ImagePlusIcon,
  Loader2Icon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { formatFileSize, formatThumbnailFileName } from "@/lib/utils";

const THUMBNAIL_PREVIEW_SIZE = 64;

interface SelectedFile {
  file: File;
  previewUrl: string;
}

export function UploadThumbnailDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SelectedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearSelected = () => {
    if (selected) {
      URL.revokeObjectURL(selected.previewUrl);
    }
    setSelected(null);
  };

  const resetForm = () => {
    clearSelected();
    setUploadedImageUrl(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    clearSelected();
    setSelected({ file, previewUrl: URL.createObjectURL(file) });
  };

  const handleDownload = async () => {
    if (!uploadedImageUrl) {
      return;
    }
    try {
      const response = await fetch(uploadedImageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = formatThumbnailFileName(new Date());
      link.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error("Failed to download thumbnail");
    }
  };

  const handleUpload = async () => {
    if (!selected) {
      return;
    }
    const formData = new FormData();
    formData.set("thumbnail", selected.file);

    setIsUploading(true);
    try {
      const response = await fetch("/api/thumbnails/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        imageUrl?: string;
        error?: string;
      };
      if (!(response.ok && data.imageUrl)) {
        throw new Error(data.error ?? "Failed to upload thumbnail");
      }
      setUploadedImageUrl(data.imageUrl);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload thumbnail"
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UploadIcon />
          Upload Thumbnail
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {uploadedImageUrl ? (
          <div className="flex min-w-0 flex-col gap-6">
            <DialogHeader>
              <DialogTitle>Thumbnail uploaded</DialogTitle>
              <DialogDescription>
                Your thumbnail is saved to your library. You can upload another
                or close this dialog.
              </DialogDescription>
            </DialogHeader>
            <Image
              alt="Uploaded thumbnail"
              className="w-full rounded-md border"
              height={432}
              src={uploadedImageUrl}
              unoptimized
              width={768}
            />
            <DialogFooter className="sm:justify-between">
              <div className="flex gap-2">
                <Button asChild size="icon" variant="outline">
                  <a
                    aria-label="Open in new tab"
                    href={uploadedImageUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <ExternalLinkIcon />
                  </a>
                </Button>
                <Button
                  aria-label="Download thumbnail"
                  onClick={handleDownload}
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  <DownloadIcon />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button onClick={resetForm} type="button" variant="outline">
                  Upload Another
                </Button>
                <Button onClick={() => setOpen(false)} type="button">
                  Done
                </Button>
              </div>
            </DialogFooter>
          </div>
        ) : (
          <div className="flex min-w-0 flex-col gap-6">
            <DialogHeader>
              <DialogTitle>Upload Thumbnail</DialogTitle>
              <DialogDescription>
                Already have a thumbnail? Upload it to your library and preview
                it on the Roblox games page.
              </DialogDescription>
            </DialogHeader>
            <Field className="min-w-0">
              <FieldLabel htmlFor="upload-thumbnail-file">
                Thumbnail image
              </FieldLabel>
              <input
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                id="upload-thumbnail-file"
                onChange={handleFileChange}
                ref={fileInputRef}
                type="file"
              />
              {selected && (
                <AttachmentGroup className="overflow-x-visible">
                  <Attachment size="sm">
                    <AttachmentMedia variant="image">
                      <Image
                        alt={selected.file.name}
                        height={THUMBNAIL_PREVIEW_SIZE}
                        src={selected.previewUrl}
                        unoptimized
                        width={THUMBNAIL_PREVIEW_SIZE}
                      />
                    </AttachmentMedia>
                    <AttachmentContent>
                      <AttachmentTitle>{selected.file.name}</AttachmentTitle>
                      <AttachmentDescription>
                        {formatFileSize(selected.file.size)}
                      </AttachmentDescription>
                    </AttachmentContent>
                    <AttachmentActions>
                      <AttachmentAction
                        aria-label={`Remove ${selected.file.name}`}
                        onClick={clearSelected}
                      >
                        <XIcon />
                      </AttachmentAction>
                    </AttachmentActions>
                  </Attachment>
                </AttachmentGroup>
              )}
              <Button
                className="w-fit"
                onClick={() => fileInputRef.current?.click()}
                size="sm"
                type="button"
                variant="outline"
              >
                <ImagePlusIcon />
                {selected ? "Choose different image" : "Choose image"}
              </Button>
              <FieldDescription>PNG, JPEG, or WebP.</FieldDescription>
            </Field>
            <DialogFooter>
              <Button
                disabled={!selected || isUploading}
                onClick={handleUpload}
                type="button"
              >
                {isUploading && <Loader2Icon className="animate-spin" />}
                {isUploading ? "Uploading..." : "Upload Thumbnail"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
