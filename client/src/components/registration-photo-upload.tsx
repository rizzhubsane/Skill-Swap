import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";

interface RegistrationPhotoUploadProps {
  onPhotoChange: (photoData: string | null) => void;
}

export default function RegistrationPhotoUpload({ onPhotoChange }: RegistrationPhotoUploadProps) {
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

    // Create preview and base64 data
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
      onPhotoChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    onPhotoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Profile Photo (Optional)</Label>
      
      <div className="flex items-center space-x-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={previewUrl || ""} alt="Profile" />
          <AvatarFallback className="text-lg">?</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Photo
            </Button>
            
            {previewUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemovePhoto}
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
          
          <p className="text-xs text-skill-gray/70 mt-1">
            Max size: 5MB • Supported: JPEG, PNG, GIF
          </p>
        </div>
      </div>
    </div>
  );
} 