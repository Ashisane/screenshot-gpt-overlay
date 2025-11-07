import { useEffect, useState, useCallback, useRef } from "react";
import { Upload } from "lucide-react";
import { ImageCanvas } from "@/components/ImageCanvas";
import { SelectionBox } from "@/components/SelectionBox";
import { ChatInterface } from "@/components/ChatInterface";
import { toast } from "sonner";

const Index = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.indexOf("image") !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              setImage(event.target?.result as string);
              toast.success("Image pasted successfully");
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // S - Start selection
      if (e.key.toLowerCase() === "s" && !e.ctrlKey && !e.metaKey) {
        if (image && !showChat) {
          setIsSelecting(true);
          toast.info("Drag to select a region");
        }
      }

      // C - Show chat
      if (e.key.toLowerCase() === "c" && !e.ctrlKey && !e.metaKey) {
        if (selection && !showChat) {
          setShowChat(true);
          toast.success("Chat interface activated");
        }
      }

      // Ctrl/Cmd + Plus - Increase font size
      if ((e.ctrlKey || e.metaKey) && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        setFontSize((prev) => Math.min(prev + 2, 32));
      }

      // Ctrl/Cmd + Minus - Decrease font size
      if ((e.ctrlKey || e.metaKey) && (e.key === "-" || e.key === "_")) {
        e.preventDefault();
        setFontSize((prev) => Math.max(prev - 2, 10));
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [image, selection, showChat]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        toast.success("Image uploaded successfully");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectionComplete = useCallback((rect: { x: number; y: number; width: number; height: number }) => {
    setSelection(rect);
    setIsSelecting(false);
    toast.success("Region selected - Press C to show chat");
  }, []);

  const handleImageLoad = useCallback(() => {
    // Image loaded successfully
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      {!image && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
          <h1 className="text-2xl font-medium text-foreground/80">
            Paste or upload a screenshot to begin
          </h1>
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">Press Ctrl+V to paste an image</p>
            <p className="text-sm text-muted-foreground">or</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
          <div className="mt-8 text-xs text-muted-foreground space-y-1 text-center">
            <p>Keyboard shortcuts:</p>
            <p><kbd className="px-2 py-1 bg-secondary rounded">S</kbd> - Select region</p>
            <p><kbd className="px-2 py-1 bg-secondary rounded">C</kbd> - Show chat</p>
            <p><kbd className="px-2 py-1 bg-secondary rounded">Ctrl +/-</kbd> - Adjust text size</p>
          </div>
        </div>
      )}

      {image && <ImageCanvas image={image} onImageLoad={handleImageLoad} />}
      
      {image && isSelecting && (
        <SelectionBox isSelecting={isSelecting} onSelectionComplete={handleSelectionComplete} />
      )}
      
      {image && showChat && selection && (
        <ChatInterface rect={selection} fontSize={fontSize} />
      )}
    </div>
  );
};

export default Index;
