import { useEffect, useRef, useState } from "react";

interface ImageCanvasProps {
  image: string | null;
  onImageLoad: (dimensions: { width: number; height: number }) => void;
}

export const ImageCanvas = ({ image, onImageLoad }: ImageCanvasProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (image) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setImageDimensions({ width, height });
      onImageLoad({ width, height });
    }
  }, [image, onImageLoad]);

  if (!image) return null;

  return (
    <div className="fixed inset-0">
      <img
        ref={imgRef}
        src={image}
        alt="Uploaded screenshot"
        className="pointer-events-none select-none w-full h-full object-cover"
      />
    </div>
  );
};
