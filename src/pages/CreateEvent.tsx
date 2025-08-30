import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import WebinarForm from '@/components/forms/WebinarForm';
import HackathonForm from '@/components/forms/HackathonForm';
import MeetupForm from '@/components/forms/MeetupForm';
import ContestForm from '@/components/forms/ContestForm';

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    event_type: '' as 'webinar' | 'hackathon' | 'meetup' | 'contest' | '',
    date: '',
    venue: '',
    max_participants: '',
    mode: '',
    team_size: '',
    // Additional fields for different event types
    end_date: '',
    speaker: '',
    prerequisites: '',
    prizes: '',
    tech_stack: '',
    judging_criteria: '',
    duration: '',
    networking: '',
    speakers: '',
    topics: '',
    refreshments: '',
    contest_type: '',
    rules: '',
    eligibility: '',
    submission_format: ''
  });
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!isAdminAuthenticated) {
    navigate('/admin/login');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const previewUrl = URL.createObjectURL(file);
      setBannerPreview(previewUrl);
    }
  };

  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadBanner = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-banners')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-banners')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading banner:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let banner_url = '';
      
      if (bannerFile) {
        const uploadedUrl = await uploadBanner(bannerFile);
        if (uploadedUrl) {
          banner_url = uploadedUrl;
        }
      }

      // Create additional data object for event-specific fields
      const additionalData = {
        ...(formData.end_date && { end_date: formData.end_date }),
        ...(formData.speaker && { speaker: formData.speaker }),
        ...(formData.prerequisites && { prerequisites: formData.prerequisites }),
        ...(formData.team_size && { team_size: parseInt(formData.team_size) }),
        ...(formData.prizes && { prizes: formData.prizes }),
        ...(formData.tech_stack && { tech_stack: formData.tech_stack }),
        ...(formData.judging_criteria && { judging_criteria: formData.judging_criteria }),
        ...(formData.duration && { duration: parseFloat(formData.duration) }),
        ...(formData.networking && { networking: formData.networking }),
        ...(formData.speakers && { speakers: formData.speakers }),
        ...(formData.topics && { topics: formData.topics }),
        ...(formData.refreshments && { refreshments: formData.refreshments }),
        ...(formData.contest_type && { contest_type: formData.contest_type }),
        ...(formData.rules && { rules: formData.rules }),
        ...(formData.eligibility && { eligibility: formData.eligibility }),
        ...(formData.submission_format && { submission_format: formData.submission_format })
      };

      const eventData = {
        name: formData.name,
        description: formData.description + (Object.keys(additionalData).length > 0 ? '\n\n' + JSON.stringify(additionalData, null, 2) : ''),
        event_type: formData.event_type as 'webinar' | 'hackathon' | 'meetup' | 'contest',
        date: formData.date,
        venue: formData.venue,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        mode: formData.mode || null,
        team_size: formData.team_size ? parseInt(formData.team_size) : null,
        banner_url: banner_url || null
      };

      const { error } = await supabase
        .from('events')
        .insert([eventData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event created successfully",
      });
      
      navigate('/admin/events');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <header className="border-b bg-card relative z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/events')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
          <h1 className="text-2xl font-bold">Create New Event</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl relative z-10">
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="event_type">Event Type</Label>
                <Select value={formData.event_type} onValueChange={(value: 'webinar' | 'hackathon' | 'meetup' | 'contest') => setFormData(prev => ({ ...prev, event_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type first" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="webinar">Webinar</SelectItem>
                    <SelectItem value="hackathon">Hackathon</SelectItem>
                    <SelectItem value="meetup">Meetup</SelectItem>
                    <SelectItem value="contest">Contest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.event_type && (
                <>
                  {formData.event_type === 'webinar' && (
                    <WebinarForm formData={formData} onInputChange={handleInputChange} />
                  )}
                  {formData.event_type === 'hackathon' && (
                    <HackathonForm formData={formData} onInputChange={handleInputChange} onSelectChange={handleSelectChange} />
                  )}
                  {formData.event_type === 'meetup' && (
                    <MeetupForm formData={formData} onInputChange={handleInputChange} />
                  )}
                  {formData.event_type === 'contest' && (
                    <ContestForm formData={formData} onInputChange={handleInputChange} />
                  )}
                </>
              )}

              <div className="space-y-2">
                <Label>Event Banner</Label>
                <div className="space-y-4">
                  {bannerPreview ? (
                    <div className="relative">
                      <img
                        src={bannerPreview}
                        alt="Banner preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeBanner}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Click to upload event banner</p>
                      <p className="text-sm text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/events')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Creating...' : 'Create Event'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateEvent;