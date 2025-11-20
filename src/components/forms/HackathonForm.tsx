import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Plus, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TimelineEntry {
  id: string;
  label: string;
  datetime: string;
}

interface PrizeTrack {
  id: string;
  title: string;
  description: string;
}

interface JudgeMentor {
  id: string;
  name: string;
  role: string;
  bio: string;
}

interface HackathonFormProps {
  formData: any;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onDataChange?: (field: string, data: any) => void;
}

const HackathonForm: React.FC<HackathonFormProps> = ({ formData, onInputChange, onSelectChange, onDataChange }) => {
  const [timeline, setTimeline] = useState<TimelineEntry[]>([
    { id: '1', label: 'Start Date & Time', datetime: formData.date || '' },
    { id: '2', label: 'End Date & Time', datetime: formData.end_date || '' }
  ]);
  
  const [prizesAndTracks, setPrizesAndTracks] = useState<PrizeTrack[]>([
    { id: '1', title: '', description: '' }
  ]);
  
  const [judgesAndMentors, setJudgesAndMentors] = useState<JudgeMentor[]>([
    { id: '1', name: '', role: '', bio: '' }
  ]);

  // Load data from formData on mount
  useEffect(() => {
    if (formData.timeline && Array.isArray(formData.timeline) && formData.timeline.length > 0) {
      setTimeline(formData.timeline);
    }
    if (formData.prizes_and_tracks && Array.isArray(formData.prizes_and_tracks) && formData.prizes_and_tracks.length > 0) {
      setPrizesAndTracks(formData.prizes_and_tracks);
    }
    if (formData.judges_and_mentors && Array.isArray(formData.judges_and_mentors) && formData.judges_and_mentors.length > 0) {
      setJudgesAndMentors(formData.judges_and_mentors);
    }
  }, []);

  // Sync timeline changes back to parent
  useEffect(() => {
    if (onDataChange) {
      onDataChange('timeline', timeline);
    }
  }, [timeline]);

  // Sync prizes and tracks changes back to parent
  useEffect(() => {
    if (onDataChange) {
      onDataChange('prizes_and_tracks', prizesAndTracks);
    }
  }, [prizesAndTracks]);

  // Sync judges and mentors changes back to parent
  useEffect(() => {
    if (onDataChange) {
      onDataChange('judges_and_mentors', judgesAndMentors);
    }
  }, [judgesAndMentors]);

  const addTimelineEntry = () => {
    setTimeline([...timeline, { id: Date.now().toString(), label: '', datetime: '' }]);
  };

  const removeTimelineEntry = (id: string) => {
    if (timeline.length > 2) {
      setTimeline(timeline.filter(entry => entry.id !== id));
    }
  };

  const updateTimelineEntry = (id: string, field: string, value: string) => {
    setTimeline(timeline.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
    
    // Update formData for first two entries
    if (id === '1') {
      onInputChange({ target: { name: 'date', value } } as any);
    } else if (id === '2') {
      onInputChange({ target: { name: 'end_date', value } } as any);
    }
  };

  const addPrizeTrack = () => {
    setPrizesAndTracks([...prizesAndTracks, { id: Date.now().toString(), title: '', description: '' }]);
  };

  const removePrizeTrack = (id: string) => {
    if (prizesAndTracks.length > 1) {
      setPrizesAndTracks(prizesAndTracks.filter(prize => prize.id !== id));
    }
  };

  const updatePrizeTrack = (id: string, field: string, value: string) => {
    setPrizesAndTracks(prizesAndTracks.map(prize => 
      prize.id === id ? { ...prize, [field]: value } : prize
    ));
  };

  const addJudgeMentor = () => {
    setJudgesAndMentors([...judgesAndMentors, { id: Date.now().toString(), name: '', role: '', bio: '' }]);
  };

  const removeJudgeMentor = (id: string) => {
    if (judgesAndMentors.length > 1) {
      setJudgesAndMentors(judgesAndMentors.filter(jm => jm.id !== id));
    }
  };

  const updateJudgeMentor = (id: string, field: string, value: string) => {
    setJudgesAndMentors(judgesAndMentors.map(jm => 
      jm.id === id ? { ...jm, [field]: value } : jm
    ));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Title</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={onInputChange}
          placeholder="Enter hackathon title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <ReactQuill
          theme="snow"
          value={formData.description}
          onChange={(value) => onInputChange({ target: { name: 'description', value } } as any)}
          placeholder="Describe the hackathon theme, challenges, and objectives"
          className="bg-background"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Timeline</Label>
          <Button type="button" variant="outline" size="sm" onClick={addTimelineEntry}>
            <Plus className="h-4 w-4 mr-1" />
            Add Entry
          </Button>
        </div>
        {timeline.map((entry, index) => (
          <div key={entry.id} className="space-y-2 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                {index === 0 ? 'Start Date & Time' : index === 1 ? 'End Date & Time' : 'Timeline Entry'}
              </Label>
              {timeline.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTimelineEntry(entry.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {index > 1 && (
              <Input
                placeholder="Label (e.g., Registration Deadline)"
                value={entry.label}
                onChange={(e) => updateTimelineEntry(entry.id, 'label', e.target.value)}
              />
            )}
            <Input
              type="datetime-local"
              value={entry.datetime}
              onChange={(e) => updateTimelineEntry(entry.id, 'datetime', e.target.value)}
              required={index < 2}
            />
          </div>
        ))}
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="mode">Mode</Label>
        <Select value={formData.mode || ''} onValueChange={(value) => onSelectChange('mode', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(formData.mode === 'offline' || formData.mode === 'hybrid') && (
        <div className="space-y-2">
          <Label htmlFor="venue">Venue</Label>
          <Input
            id="venue"
            name="venue"
            value={formData.venue}
            onChange={onInputChange}
            placeholder="Physical location"
            required
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="team_size">Maximum Team Size</Label>
        <Input
          id="team_size"
          name="team_size"
          type="number"
          min="1"
          value={formData.team_size}
          onChange={onInputChange}
          placeholder="Enter maximum team size"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="submission_start">Project Submission Start *</Label>
          <Input
            id="submission_start"
            name="submission_start"
            type="datetime-local"
            value={formData.submission_start}
            onChange={onInputChange}
            required
          />
          <p className="text-xs text-muted-foreground">When project submission opens</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="submission_end">Project Submission End *</Label>
          <Input
            id="submission_end"
            name="submission_end"
            type="datetime-local"
            value={formData.submission_end}
            onChange={onInputChange}
            required
          />
          <p className="text-xs text-muted-foreground">When project submission closes</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Prizes and Tracks</Label>
          <Button type="button" variant="outline" size="sm" onClick={addPrizeTrack}>
            <Plus className="h-4 w-4 mr-1" />
            Add Prize/Track
          </Button>
        </div>
        {prizesAndTracks.map((prize, index) => (
          <div key={prize.id} className="space-y-2 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Prize/Track {index + 1}</Label>
              {prizesAndTracks.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removePrizeTrack(prize.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Input
              placeholder="Title (e.g., First Prize, Best AI Solution)"
              value={prize.title}
              onChange={(e) => updatePrizeTrack(prize.id, 'title', e.target.value)}
            />
            <Textarea
              placeholder="Description and prize details"
              value={prize.description}
              onChange={(e) => updatePrizeTrack(prize.id, 'description', e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Judges and Mentors</Label>
          <Button type="button" variant="outline" size="sm" onClick={addJudgeMentor}>
            <Plus className="h-4 w-4 mr-1" />
            Add Person
          </Button>
        </div>
        {judgesAndMentors.map((jm, index) => (
          <div key={jm.id} className="space-y-2 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Person {index + 1}</Label>
              {judgesAndMentors.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeJudgeMentor(jm.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Input
              placeholder="Name"
              value={jm.name}
              onChange={(e) => updateJudgeMentor(jm.id, 'name', e.target.value)}
            />
            <Input
              placeholder="Role (e.g., Judge, Mentor, Industry Expert)"
              value={jm.role}
              onChange={(e) => updateJudgeMentor(jm.id, 'role', e.target.value)}
            />
            <Textarea
              placeholder="Bio and credentials"
              value={jm.bio}
              onChange={(e) => updateJudgeMentor(jm.id, 'bio', e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HackathonForm;
