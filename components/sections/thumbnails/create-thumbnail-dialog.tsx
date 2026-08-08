"use client";

import {
  DownloadIcon,
  ExternalLinkIcon,
  ImagePlusIcon,
  ImagesIcon,
  Loader2Icon,
  PaintBucketIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { z } from "zod";
import { BuyCreditsDialog } from "@/components/sections/credits/buy-credits-dialog";
import { useCredits } from "@/components/sections/credits/credits-provider";
import { LibraryAssetPicker } from "@/components/sections/library/library-asset-picker";
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
import type { LibraryAsset } from "@/lib/assets-shared";
import { THUMBNAIL_CREDIT_COSTS } from "@/lib/credits-shared";
import type { ThumbnailKind } from "@/lib/thumbnails";
import { formatFileSize, formatThumbnailFileName } from "@/lib/utils";

const ROBLOX_GAME_LINK_PATTERN =
  /^https:\/\/(www\.)?roblox\.com\/(games|share)\/\d+/;
const REFERENCE_IMAGE_PREVIEW_SIZE = 64;
const GENERATION_TIMER_INTERVAL_MS = 1000;
const MAX_REFERENCE_IMAGES = 4;
const RECENT_ASSETS_LIMIT = 5;

function formatElapsedTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

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

type ThumbnailModel = "fast" | "quality";

function GeneratedResult({
  generatedImageUrl,
  kind,
  kindLabel,
  onDone,
  onDownload,
  onReset,
}: {
  generatedImageUrl: string;
  kind: ThumbnailKind;
  kindLabel: string;
  onDone: () => void;
  onDownload: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <DialogHeader>
        <DialogTitle>{kindLabel} ready</DialogTitle>
        <DialogDescription>
          Here's what we generated. You can create another or close this dialog.
        </DialogDescription>
      </DialogHeader>
      <Image
        alt={`Generated ${kind}`}
        className={
          kind === "icon"
            ? "mx-auto aspect-square w-1/2 rounded-md border"
            : "w-full rounded-md border"
        }
        height={kind === "icon" ? 384 : 432}
        src={generatedImageUrl}
        unoptimized
        width={kind === "icon" ? 384 : 768}
      />
      <DialogFooter className="sm:justify-between">
        <div className="flex gap-2">
          <Button asChild size="icon" variant="outline">
            <a
              aria-label="Open in new tab"
              href={generatedImageUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <ExternalLinkIcon />
            </a>
          </Button>
          <Button
            aria-label={`Download ${kind}`}
            onClick={onDownload}
            size="icon"
            type="button"
            variant="outline"
          >
            <DownloadIcon />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={onReset} type="button" variant="outline">
            Create Another
          </Button>
          <Button onClick={onDone} type="button">
            Done
          </Button>
        </div>
      </DialogFooter>
    </div>
  );
}

function KindToggle({
  kind,
  onChange,
}: {
  kind: ThumbnailKind;
  onChange: (kind: ThumbnailKind) => void;
}) {
  return (
    <div className="flex gap-2">
      <Button
        aria-pressed={kind === "thumbnail"}
        className="flex-1"
        onClick={() => onChange("thumbnail")}
        size="sm"
        type="button"
        variant={kind === "thumbnail" ? "default" : "outline"}
      >
        Thumbnail
      </Button>
      <Button
        aria-pressed={kind === "icon"}
        className="flex-1"
        onClick={() => onChange("icon")}
        size="sm"
        type="button"
        variant={kind === "icon" ? "default" : "outline"}
      >
        Icon
      </Button>
    </div>
  );
}

export function CreateThumbnailDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<ThumbnailKind>("thumbnail");
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
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [model, setModel] = useState<ThumbnailModel>("fast");
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [recentAssets, setRecentAssets] = useState<LibraryAsset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<LibraryAsset[]>([]);
  const [showLibraryPicker, setShowLibraryPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { balance, refreshBalance } = useCredits();
  const creditCost = THUMBNAIL_CREDIT_COSTS[model];
  const hasInsufficientCredits = balance < creditCost;
  const usedReferenceSlots = referenceImages.length + selectedAssets.length;
  const remainingReferenceSlots = MAX_REFERENCE_IMAGES - usedReferenceSlots;
  const kindLabel = kind === "icon" ? "Icon" : "Thumbnail";

  useEffect(() => {
    if (!open) {
      return;
    }
    fetch(`/api/assets?limit=${RECENT_ASSETS_LIMIT}`)
      .then((response) => response.json())
      .then((data: { assets: LibraryAsset[] }) => setRecentAssets(data.assets))
      .catch(() => null);
  }, [open]);

  useEffect(() => {
    if (!isGenerating) {
      return;
    }
    setElapsedSeconds(0);
    const intervalId = setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, GENERATION_TIMER_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [isGenerating]);

  const handleDownload = async () => {
    if (!generatedImageUrl) {
      return;
    }
    try {
      const response = await fetch(generatedImageUrl);
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

  const clearReferenceImages = () => {
    for (const image of referenceImages) {
      URL.revokeObjectURL(image.previewUrl);
    }
    setReferenceImages([]);
  };

  const handleReferenceImagesChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const files = [...(event.target.files ?? [])].slice(
      0,
      remainingReferenceSlots
    );
    event.target.value = "";
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
  };

  const removeReferenceImage = (previewUrl: string) => {
    URL.revokeObjectURL(previewUrl);
    setReferenceImages((current) =>
      current.filter((image) => image.previewUrl !== previewUrl)
    );
  };

  const toggleRecentAsset = (asset: LibraryAsset) => {
    setSelectedAssets((current) => {
      const isSelected = current.some((item) => item.id === asset.id);
      if (isSelected) {
        return current.filter((item) => item.id !== asset.id);
      }
      if (remainingReferenceSlots <= 0) {
        toast.error(`You can only use up to ${MAX_REFERENCE_IMAGES} images`);
        return current;
      }
      return [...current, asset];
    });
  };

  const removeSelectedAsset = (id: string) => {
    setSelectedAssets((current) => current.filter((asset) => asset.id !== id));
  };

  const resetForm = () => {
    setKind("thumbnail");
    setTab("with-game");
    setGameLink("");
    setIdea("");
    setGameConcept("");
    setGameLinkError(null);
    setGameConceptError(null);
    clearReferenceImages();
    setSelectedAssets([]);
    setGeneratedImageUrl(null);
    setModel("fast");
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
    formData.set("model", model);
    formData.set("kind", kind);
    for (const image of referenceImages) {
      formData.append("referenceImages", image.file);
    }
    if (selectedAssets.length > 0) {
      formData.set(
        "referenceAssetPaths",
        JSON.stringify(selectedAssets.map((asset) => asset.path))
      );
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
        if (response.status === 402) {
          setShowBuyCredits(true);
        }
        throw new Error(data.error ?? "Failed to generate thumbnail");
      }
      setGeneratedImageUrl(data.imageUrl);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Failed to generate ${kind}`
      );
    } finally {
      setIsGenerating(false);
      await refreshBalance();
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
          <GeneratedResult
            generatedImageUrl={generatedImageUrl}
            kind={kind}
            kindLabel={kindLabel}
            onDone={() => setOpen(false)}
            onDownload={handleDownload}
            onReset={resetForm}
          />
        ) : (
          <form
            className="flex min-w-0 flex-col gap-6"
            noValidate
            onSubmit={handleSubmit}
          >
            <DialogHeader>
              <DialogTitle>Create {kindLabel}</DialogTitle>
              <DialogDescription>
                Use your game link, or tell us about the game you're making.
              </DialogDescription>
            </DialogHeader>
            <KindToggle kind={kind} onChange={setKind} />
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
                      Optional, leave blank and we'll come up with some.
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
              {selectedAssets.length > 0 && (
                <AttachmentGroup className="flex-wrap gap-2 overflow-x-visible">
                  {selectedAssets.map((asset) => (
                    <Attachment key={asset.id} size="sm">
                      <AttachmentMedia variant="image">
                        <Image
                          alt={asset.name}
                          height={REFERENCE_IMAGE_PREVIEW_SIZE}
                          src={asset.imageUrl}
                          unoptimized
                          width={REFERENCE_IMAGE_PREVIEW_SIZE}
                        />
                      </AttachmentMedia>
                      <AttachmentContent>
                        <AttachmentTitle>{asset.name}</AttachmentTitle>
                        <AttachmentDescription>
                          From your library
                        </AttachmentDescription>
                      </AttachmentContent>
                      <AttachmentActions>
                        <AttachmentAction
                          aria-label={`Remove ${asset.name}`}
                          onClick={() => removeSelectedAsset(asset.id)}
                        >
                          <XIcon />
                        </AttachmentAction>
                      </AttachmentActions>
                    </Attachment>
                  ))}
                </AttachmentGroup>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  className="w-fit"
                  disabled={remainingReferenceSlots <= 0}
                  onClick={() => fileInputRef.current?.click()}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <ImagePlusIcon />
                  Add images
                </Button>
                <Button
                  className="w-fit"
                  disabled={remainingReferenceSlots <= 0}
                  onClick={() => setShowLibraryPicker(true)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <ImagesIcon />
                  From library
                </Button>
              </div>
              {recentAssets.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {recentAssets.map((asset) => {
                    const isSelected = selectedAssets.some(
                      (item) => item.id === asset.id
                    );
                    return (
                      <button
                        className={`overflow-hidden rounded-md border-2 ${
                          isSelected ? "border-primary" : "border-transparent"
                        }`}
                        key={asset.id}
                        onClick={() => toggleRecentAsset(asset)}
                        type="button"
                      >
                        <Image
                          alt={asset.name}
                          height={REFERENCE_IMAGE_PREVIEW_SIZE}
                          src={asset.imageUrl}
                          unoptimized
                          width={REFERENCE_IMAGE_PREVIEW_SIZE}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
              <FieldDescription>
                Optional, screenshots, characters, or thumbnails whose style you
                like. Up to {MAX_REFERENCE_IMAGES} images.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="thumbnail-model">Quality</FieldLabel>
              <div className="flex gap-2" id="thumbnail-model">
                <Button
                  aria-pressed={model === "fast"}
                  className="flex-1"
                  onClick={() => setModel("fast")}
                  size="sm"
                  type="button"
                  variant={model === "fast" ? "default" : "outline"}
                >
                  Fast · {THUMBNAIL_CREDIT_COSTS.fast} credits
                </Button>
                <Button
                  aria-pressed={model === "quality"}
                  className="flex-1"
                  onClick={() => setModel("quality")}
                  size="sm"
                  type="button"
                  variant={model === "quality" ? "default" : "outline"}
                >
                  High Quality · {THUMBNAIL_CREDIT_COSTS.quality} credits
                </Button>
              </div>
              <FieldDescription>
                You have {balance} credits.{" "}
                {hasInsufficientCredits && (
                  <button
                    className="underline underline-offset-3 hover:text-foreground"
                    onClick={() => setShowBuyCredits(true)}
                    type="button"
                  >
                    Buy more
                  </button>
                )}
              </FieldDescription>
            </Field>
            <DialogFooter>
              <Button
                disabled={isGenerating || hasInsufficientCredits}
                type="submit"
              >
                {isGenerating && <Loader2Icon className="animate-spin" />}
                {isGenerating
                  ? `Generating... ${formatElapsedTime(elapsedSeconds)}`
                  : `Create ${kindLabel} · ${creditCost} credits`}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
      <BuyCreditsDialog
        onOpenChange={setShowBuyCredits}
        open={showBuyCredits}
      />
      <LibraryAssetPicker
        disabledPaths={selectedAssets.map((asset) => asset.path)}
        maxSelectable={remainingReferenceSlots}
        onConfirm={(assets) =>
          setSelectedAssets((current) => [...current, ...assets])
        }
        onOpenChange={setShowLibraryPicker}
        open={showLibraryPicker}
      />
    </Dialog>
  );
}
