import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface BootcampFormProps {
  formData: any;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const BootcampForm: React.FC<BootcampFormProps> = ({ formData, onInputChange }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Bootcamp Title</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={onInputChange}
          placeholder="Enter bootcamp title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <ReactQuill
          theme="snow"
          value={formData.description}
          onChange={(value) => onInputChange({ target: { name: 'description', value } } as any)}
          placeholder="Describe the bootcamp curriculum and learning objectives"
          className="bg-background"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Start Date & Time</Label>
        <Input
          id="date"
          name="date"
          type="datetime-local"
          value={formData.date}
          onChange={onInputChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="end_date">End Date & Time</Label>
        <Input
          id="end_date"
          name="end_date"
          type="datetime-local"
          value={formData.end_date}
          onChange={onInputChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="venue">Venue</Label>
        <Input
          id="venue"
          name="venue"
          value={formData.venue}
          onChange={onInputChange}
          placeholder="Training location address"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="max_participants">Total Slots</Label>
        <Input
          id="max_participants"
          name="max_participants"
          type="number"
          value={formData.max_participants}
          onChange={onInputChange}
          placeholder="e.g., 30"
        />
      </div>
    </div>
  );
};

export default BootcampForm;
