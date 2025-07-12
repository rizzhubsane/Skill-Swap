import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/auth";
import { Camera, Upload, X } from "lucide-react";

interface ProfilePhotoUploadProps {
  currentPhoto?: string;
  userName: string;
  onPhotoUpdate: (photoUrl: string) => void;
}

export default function ProfilePhotoUpload({ 
  currentPhoto, 
  userName, 
  onPhotoUpdate 
}: ProfilePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      toast({
        title: "No file selected",
        description: "Please select an image to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', fileInputRef.current.files[0]);

      const response = await fetch("/api/users/profile-photo", {
        method: "POST",
        headers: auth.getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload photo");
      }

      const data = await response.json();
      onPhotoUpdate(data.user.profilePhoto);
      setPreviewUrl(null);
      
      toast({
        title: "Success",
        description: "Profile photo updated successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setIsUploading(true);
    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...auth.getAuthHeaders(),
        },
        body: JSON.stringify({ profilePhoto: null }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to remove photo");
      }

      const data = await response.json();
      onPhotoUpdate("");
      setPreviewUrl(null);
      
      toast({
        title: "Success",
        description: "Profile photo removed successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const displayPhoto = previewUrl || currentPhoto;

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Avatar className="w-24 h-24">
          <AvatarImage src={displayPhoto || ""} alt={userName} />
          <AvatarFallback className="text-2xl">
            {userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="space-y-3">
        {/* File Upload Area */}
        <div
          className="border-2 border-dashed border-skill-primary/30 rounded-lg p-6 text-center hover:border-skill-primary/50 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <Upload className="w-8 h-8 mx-auto mb-2 text-skill-primary/60" />
          <p className="text-sm text-skill-gray">
            Click to select or drag and drop an image
          </p>
          <p className="text-xs text-skill-gray/70 mt-1">
            Max size: 5MB • Supported: JPEG, PNG, GIF
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-center">
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!previewUrl || isUploading}
            className="bg-skill-primary hover:bg-skill-primary/90"
            size="sm"
          >
            <Camera className="w-4 h-4 mr-2" />
            {isUploading ? "Uploading..." : "Upload Photo"}
          </Button>
          
          {(currentPhoto || previewUrl) && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemovePhoto}
              disabled={isUploading}
              size="sm"
            >
              <X className="w-4 h-4 mr-2" />
              Remove
            </Button>
          )}
        </div>

        {/* Preview */}
        {previewUrl && (
          <div className="text-center">
            <p className="text-sm text-skill-gray mb-2">Preview:</p>
            <div className="inline-block">
              <Avatar className="w-16 h-16">
                <AvatarImage src={previewUrl} alt="Preview" />
                <AvatarFallback>P</AvatarFallback>
              </Avatar>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 