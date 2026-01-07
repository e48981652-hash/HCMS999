import { useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Download, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
} from "./dialog";

export interface ImageGalleryItem {
  id: string;
  url: string;
  thumbnail?: string;
  alt?: string;
  title?: string;
}

interface ImageGalleryProps {
  images: ImageGalleryItem[];
  className?: string;
  columns?: 2 | 3 | 4;
  showDownload?: boolean;
  onDownload?: (image: ImageGalleryItem) => void;
}

export function ImageGallery({
  images,
  className,
  columns = 3,
  showDownload = true,
  onDownload,
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openLightbox = useCallback((index: number) => {
    setSelectedIndex(index);
    setIsOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setSelectedIndex(null), 200);
  }, []);

  const navigateImage = useCallback(
    (direction: "prev" | "next") => {
      if (selectedIndex === null) return;

      if (direction === "prev") {
        setSelectedIndex((prev) => (prev === null ? 0 : (prev - 1 + images.length) % images.length));
      } else {
        setSelectedIndex((prev) => (prev === null ? 0 : (prev + 1) % images.length));
      }
    },
    [selectedIndex, images.length]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowLeft") {
        navigateImage("prev");
      } else if (e.key === "ArrowRight") {
        navigateImage("next");
      } else if (e.key === "Escape") {
        closeLightbox();
      }
    },
    [isOpen, navigateImage, closeLightbox]
  );

  if (images.length === 0) return null;

  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };

  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;

  return (
    <>
      <div
        className={cn("grid gap-2", gridCols[columns], className)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-muted"
            onClick={() => openLightbox(index)}
          >
            <img
              src={image.thumbnail || image.url}
              alt={image.alt || image.title || `Image ${index + 1}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
              <ZoomIn className="h-8 w-8 text-white drop-shadow-lg" />
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-7xl p-0" onKeyDown={handleKeyDown}>
          {selectedImage && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 z-10 bg-black/50 text-white hover:bg-black/70"
                onClick={closeLightbox}
              >
                <X className="h-4 w-4" />
              </Button>

              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 z-10 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                    onClick={() => navigateImage("prev")}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 z-10 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                    onClick={() => navigateImage("next")}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              <div className="relative aspect-video bg-black">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.alt || selectedImage.title || "Gallery image"}
                  className="h-full w-full object-contain"
                />
              </div>

              {(selectedImage.title || showDownload) && (
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-black/70 p-4 text-white">
                  <div>
                    {selectedImage.title && (
                      <h3 className="text-lg font-semibold">{selectedImage.title}</h3>
                    )}
                    {selectedImage.alt && (
                      <p className="text-sm text-white/80">{selectedImage.alt}</p>
                    )}
                  </div>
                  {showDownload && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                      onClick={() => {
                        if (onDownload) {
                          onDownload(selectedImage);
                        } else {
                          const link = document.createElement("a");
                          link.href = selectedImage.url;
                          link.download = selectedImage.title || "image";
                          link.click();
                        }
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}

              {images.length > 1 && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                  {selectedIndex !== null ? selectedIndex + 1 : 0} / {images.length}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
