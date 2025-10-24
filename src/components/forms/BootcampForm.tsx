import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface BootcampFormProps {
  formData: any;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
}

const BootcampForm: React.FC<BootcampFormProps> = ({ formData, onInputChange, onSelectChange }) => {
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
        <p className="text-xs text-muted-foreground">Enter date & time in the timezone selected below</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone">Time Zone</Label>
        <Select value={formData.timezone} onValueChange={(value) => onSelectChange('timezone', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Asia/Kolkata">India (IST - UTC+5:30)</SelectItem>
            <SelectItem value="America/New_York">Eastern Time (ET - UTC-5/-4)</SelectItem>
            <SelectItem value="America/Chicago">Central Time (CT - UTC-6/-5)</SelectItem>
            <SelectItem value="America/Denver">Mountain Time (MT - UTC-7/-6)</SelectItem>
            <SelectItem value="America/Los_Angeles">Pacific Time (PT - UTC-8/-7)</SelectItem>
            <SelectItem value="Europe/London">London (GMT - UTC+0/+1)</SelectItem>
            <SelectItem value="Europe/Paris">Paris (CET - UTC+1/+2)</SelectItem>
            <SelectItem value="Europe/Berlin">Berlin (CET - UTC+1/+2)</SelectItem>
            <SelectItem value="Asia/Dubai">Dubai (GST - UTC+4)</SelectItem>
            <SelectItem value="Asia/Singapore">Singapore (SGT - UTC+8)</SelectItem>
            <SelectItem value="Asia/Tokyo">Tokyo (JST - UTC+9)</SelectItem>
            <SelectItem value="Australia/Sydney">Sydney (AEDT - UTC+11/+10)</SelectItem>
            <SelectItem value="Pacific/Auckland">Auckland (NZDT - UTC+13/+12)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Timezone for the event - times will be displayed in this timezone</p>
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
        <p className="text-xs text-muted-foreground">Enter date & time in the timezone selected above (can be same day)</p>
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
