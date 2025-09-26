import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface WebinarFormProps {
  formData: any;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  bannerFile: File | null;
  bannerPreview: string;
  displayImageFile: File | null;
  displayImagePreview: string;
  fileInputRef: React.RefObject<HTMLInputElement>;
  displayImageInputRef: React.RefObject<HTMLInputElement>;
  onBannerSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDisplayImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveBanner: () => void;
  onRemoveDisplayImage: () => void;
}

const WebinarForm: React.FC<WebinarFormProps> = ({ 
  formData, 
  onInputChange,
  bannerFile,
  bannerPreview,
  displayImageFile,
  displayImagePreview,
  fileInputRef,
  displayImageInputRef,
  onBannerSelect,
  onDisplayImageSelect,
  onRemoveBanner,
  onRemoveDisplayImage
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Webinar Title</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={onInputChange}
          placeholder="Enter webinar title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <ReactQuill
          theme="snow"
          value={formData.description}
          onChange={(value) => onInputChange({ target: { name: 'description', value } } as any)}
          placeholder="Describe what participants will learn"
          className="bg-background"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date & Time</Label>
        <Input
          id="date"
          name="date"
          type="datetime-local"
          value={formData.date}
          onChange={onInputChange}
          required
        />
      </div>

      {/* Banner Image Upload - Desktop: 1200x400, Mobile: 600x200 */}
      <div className="space-y-2">
        <Label>Webinar Banner Image</Label>
        <p className="text-sm text-muted-foreground">Recommended: 1200×400px (Desktop), automatically optimized for mobile</p>
        <div className="space-y-4">
          {bannerPreview ? (
            <div className="relative">
              <img
                src={bannerPreview}
                alt="Banner preview"
                className="w-full aspect-[3/1] object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={onRemoveBanner}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors aspect-[3/1] flex flex-col items-center justify-center"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Click to upload banner image</p>
              <p className="text-sm text-muted-foreground mt-1">1200×400px recommended, PNG/JPG up to 10MB</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onBannerSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Display Image Upload - Square format for event cards */}
      <div className="space-y-2">
        <Label>Event Display Image</Label>
        <p className="text-sm text-muted-foreground">Recommended: 400×400px (Square format for event listings)</p>
        <div className="space-y-4">
          {displayImagePreview ? (
            <div className="relative max-w-sm">
              <img
                src={displayImagePreview}
                alt="Display image preview"
                className="w-full aspect-square object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={onRemoveDisplayImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors aspect-square max-w-sm flex flex-col items-center justify-center"
              onClick={() => displayImageInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Click to upload display image</p>
              <p className="text-sm text-muted-foreground mt-1">400×400px recommended, PNG/JPG up to 10MB</p>
            </div>
          )}
          <input
            ref={displayImageInputRef}
            type="file"
            accept="image/*"
            onChange={onDisplayImageSelect}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default WebinarForm;
