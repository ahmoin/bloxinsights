"use client";

import {
  ImagePlusIcon,
  Loader2Icon,
  PaintBucketIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import { type ChangeEvent, type FormEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatFileSize } from "@/lib/utils";

const ROBLOX_GAME_LINK_PATTERN =
  /^https:\/\/(www\.)?roblox\.com\/(games|share)\/\d+/;
const REFERENCE_IMAGE_PREVIEW_SIZE = 64;

interface ReferenceImage {
  file: File;
  previewUrl: string;
}

const gameLinkSchema = z
  .string()
  .min(1, "Paste a Roblox game link")
  .regex(
    ROBLOX_GAME_LINK_PATTERN,
    "Must be a Roblox game link like https://www.roblox.com/games/123456"
  );

const gameConceptSchema = z
  .string()
  .min(1, "Describe what your game is going to be about");

export function CreateThumbnailDialog() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("with-game");
  const [gameLink, setGameLink] = useState("");
  const [idea, setIdea] = useState("");
  const [gameConcept, setGameConcept] = useState("");
  const [gameLinkError, setGameLinkError] = useState<string | null>(null);
  const [gameConceptError, setGameConceptError] = useState<string | null>(null);
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearReferenceImages = () => {
    for (const image of referenceImages) {
      URL.revokeObjectURL(image.previewUrl);
    }
    setReferenceImages([]);
  };

  const handleReferenceImagesChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const files = [...(event.target.files ?? [])];
    if (files.length === 0) {
      return;
    }
    setReferenceImages((current) => [
      ...current,
      ...files.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
    event.target.value = "";
  };

  const removeReferenceImage = (previewUrl: string) => {
    URL.revokeObjectURL(previewUrl);
    setReferenceImages((current) =>
      current.filter((image) => image.previewUrl !== previewUrl)
    );
  };

  const resetForm = () => {
    setTab("with-game");
    setGameLink("");
    setIdea("");
    setGameConcept("");
    setGameLinkError(null);
    setGameConceptError(null);
    clearReferenceImages();
    setGeneratedImageUrl(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  };

  const validateActiveTab = (): boolean => {
    if (tab === "with-game") {
      const result = gameLinkSchema.safeParse(gameLink);
      if (!result.success) {
        setGameLinkError(result.error.issues[0]?.message ?? null);
        return false;
      }
      return true;
    }
    const result = gameConceptSchema.safeParse(gameConcept);
    if (!result.success) {
      setGameConceptError(result.error.issues[0]?.message ?? null);
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateActiveTab()) {
      return;
    }

    const formData = new FormData();
    if (tab === "with-game") {
      formData.set("gameLink", gameLink);
      formData.set("idea", idea);
    } else {
      formData.set("gameConcept", gameConcept);
    }
    for (const image of referenceImages) {
      formData.append("referenceImages", image.file);
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/thumbnails/generate", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        imageUrl?: string;
        error?: string;
      };
      if (!(response.ok && data.imageUrl)) {
        throw new Error(data.error ?? "Failed to generate thumbnail");
      }
      setGeneratedImageUrl(data.imageUrl);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate thumbnail"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger asChild>
        <Button>
          <PaintBucketIcon />
          Create Thumbnail
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {generatedImageUrl ? (
          <div className="flex min-w-0 flex-col gap-6">
            <DialogHeader>
              <DialogTitle>Thumbnail ready</DialogTitle>
              <DialogDescription>
                Here's what we generated. You can create another or close this
                dialog.
              </DialogDescription>
            </DialogHeader>
            <Image
              alt="Generated thumbnail"
              className="w-full rounded-md border"
              height={432}
              src={generatedImageUrl}
              unoptimized
              width={768}
            />
            <DialogFooter>
              <Button onClick={resetForm} type="button" variant="outline">
                Create Another
              </Button>
              <Button onClick={() => setOpen(false)} type="button">
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form
            className="flex min-w-0 flex-col gap-6"
            noValidate
            onSubmit={handleSubmit}
          >
            <DialogHeader>
              <DialogTitle>Create Thumbnail</DialogTitle>
              <DialogDescription>
                Use your game link, or tell us about the game you're making.
              </DialogDescription>
            </DialogHeader>
            <Tabs className="gap-4" onValueChange={setTab} value={tab}>
              <TabsList className="w-full">
                <TabsTrigger value="with-game">I have a game</TabsTrigger>
                <TabsTrigger value="no-game">No game yet</TabsTrigger>
              </TabsList>
              <TabsContent value="with-game">
                <FieldGroup>
                  <Field data-invalid={gameLinkError !== null}>
                    <FieldLabel htmlFor="thumbnail-game-link">
                      Game link
                    </FieldLabel>
                    <Input
                      aria-invalid={gameLinkError !== null}
                      id="thumbnail-game-link"
                      onChange={(event) => {
                        setGameLink(event.target.value);
                        setGameLinkError(null);
                      }}
                      placeholder="https://www.roblox.com/games/123456"
                      type="url"
                      value={gameLink}
                    />
                    {gameLinkError === null ? (
                      <FieldDescription>
                        We use the game link to pull the game's name, genre, and
                        style.
                      </FieldDescription>
                    ) : (
                      <FieldError>{gameLinkError}</FieldError>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="thumbnail-idea">
                      Thumbnail idea
                    </FieldLabel>
                    <Textarea
                      id="thumbnail-idea"
                      onChange={(event) => setIdea(event.target.value)}
                      placeholder="Describe the scene, characters, or vibe you want..."
                      rows={3}
                      value={idea}
                    />
                    <FieldDescription>
                      Optional — leave blank and we'll come up with some.
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </TabsContent>
              <TabsContent value="no-game">
                <FieldGroup>
                  <Field data-invalid={gameConceptError !== null}>
                    <FieldLabel htmlFor="thumbnail-game-concept">
                      What's your game about?
                    </FieldLabel>
                    <Textarea
                      aria-invalid={gameConceptError !== null}
                      id="thumbnail-game-concept"
                      onChange={(event) => {
                        setGameConcept(event.target.value);
                        setGameConceptError(null);
                      }}
                      placeholder="An obby where you escape a giant grandma's house..."
                      rows={4}
                      value={gameConcept}
                    />
                    {gameConceptError === null ? (
                      <FieldDescription>
                        Describe the genre, setting, or vibe and we'll come up
                        with some thumbnails.
                      </FieldDescription>
                    ) : (
                      <FieldError>{gameConceptError}</FieldError>
                    )}
                  </Field>
                </FieldGroup>
              </TabsContent>
            </Tabs>
            <Field className="min-w-0">
              <FieldLabel htmlFor="thumbnail-reference-images">
                Reference images
              </FieldLabel>
              <input
                accept="image/*"
                className="hidden"
                id="thumbnail-reference-images"
                multiple
                onChange={handleReferenceImagesChange}
                ref={fileInputRef}
                type="file"
              />
              {referenceImages.length > 0 && (
                <AttachmentGroup className="flex-wrap gap-2 overflow-x-visible">
                  {referenceImages.map((image) => (
                    <Attachment key={image.previewUrl} size="sm">
                      <AttachmentMedia variant="image">
                        <Image
                          alt={image.file.name}
                          height={REFERENCE_IMAGE_PREVIEW_SIZE}
                          src={image.previewUrl}
                          unoptimized
                          width={REFERENCE_IMAGE_PREVIEW_SIZE}
                        />
                      </AttachmentMedia>
                      <AttachmentContent>
                        <AttachmentTitle>{image.file.name}</AttachmentTitle>
                        <AttachmentDescription>
                          {formatFileSize(image.file.size)}
                        </AttachmentDescription>
                      </AttachmentContent>
                      <AttachmentActions>
                        <AttachmentAction
                          aria-label={`Remove ${image.file.name}`}
                          onClick={() => removeReferenceImage(image.previewUrl)}
                        >
                          <XIcon />
                        </AttachmentAction>
                      </AttachmentActions>
                    </Attachment>
                  ))}
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
                Add images
              </Button>
              <FieldDescription>
                Optional — screenshots, characters, or thumbnails whose style
                you like.
              </FieldDescription>
            </Field>
            <DialogFooter>
              <Button disabled={isGenerating} type="submit">
                {isGenerating && <Loader2Icon className="animate-spin" />}
                {isGenerating ? "Generating..." : "Create Thumbnail"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
