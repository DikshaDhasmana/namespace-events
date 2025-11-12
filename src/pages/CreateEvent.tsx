import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, X, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import WebinarForm from '@/components/forms/WebinarForm';
import HackathonForm from '@/components/forms/HackathonForm';
import MeetupForm from '@/components/forms/MeetupForm';
import ContestForm from '@/components/forms/ContestForm';
import BootcampForm from '@/components/forms/BootcampForm';
import EventFormBuilder, { FormField } from '@/components/EventFormBuilder';

const CreateEvent = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const isEditMode = !!eventId;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    event_type: '' as 'webinar' | 'hackathon' | 'meetup' | 'contest' | 'bootcamp' | 'seminar' | 'workshop' | 'conference' | 'fellowship' | 'cohort' | 'hiring_challenge' | 'ideathon' | 'learnathon' | '',
    date: '',
    venue: '',
    max_participants: '',
    mode: '',
    team_size: '',
    approval_enabled: false,
    timezone: 'Asia/Kolkata',
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
    submission_format: '',
    // Hackathon-specific dynamic fields
    timeline: [] as any[],
    prizes_and_tracks: [] as any[],
    judges_and_mentors: [] as any[]
  });

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [displayImageFile, setDisplayImageFile] = useState<File | null>(null);
  const [displayImagePreview, setDisplayImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [registrationFormFields, setRegistrationFormFields] = useState<FormField[]>([
    {
      id: 'default-name',
      field_type: 'profile_field',
      label: 'Full Name',
      description: '',
      placeholder: 'Enter your full name',
      required: true,
      options: [],
      order_index: 0,
      is_default: true,
      profile_field: 'full_name'
    },
    {
      id: 'default-email',
      field_type: 'profile_field',
      label: 'Email Address',
      description: '',
      placeholder: 'Enter your email',
      required: true,
      options: [],
      order_index: 1,
      is_default: true,
      profile_field: 'email'
    }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const displayImageInputRef = useRef<HTMLInputElement>(null);
  const { isAdminAuthenticated } = useAdminAuth();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch event data if in edit mode
  useEffect(() => {
    if (isEditMode && eventId) {
      fetchEventData(eventId);
    }
  }, [eventId, isEditMode]);

  // Helper functions for timezone conversion
  const convertUTCToLocal = (utcDateString: string, timezone: string): string => {
    const date = new Date(utcDateString);
    const timezoneOffsets: Record<string, number> = {
      'Asia/Kolkata': 5.5,
      'America/New_York': -5,
      'America/Chicago': -6,
      'America/Denver': -7,
      'America/Los_Angeles': -8,
      'Europe/London': 0,
      'Europe/Paris': 1,
      'Europe/Berlin': 1,
      'Asia/Dubai': 4,
      'Asia/Singapore': 8,
      'Asia/Tokyo': 9,
      'Australia/Sydney': 10,
      'Pacific/Auckland': 12,
    };
    const offsetHours = timezoneOffsets[timezone] || 0;
    const localTime = new Date(date.getTime() + offsetHours * 3600000);
    return localTime.toISOString().slice(0, 16);
  };

  const convertLocalToUTC = (localDateString: string, timezone: string): string => {
    const timezoneOffsets: Record<string, number> = {
      'Asia/Kolkata': 5.5,
      'America/New_York': -5,
      'America/Chicago': -6,
      'America/Denver': -7,
      'America/Los_Angeles': -8,
      'Europe/London': 0,
      'Europe/Paris': 1,
      'Europe/Berlin': 1,
      'Asia/Dubai': 4,
      'Asia/Singapore': 8,
      'Asia/Tokyo': 9,
      'Australia/Sydney': 10,
      'Pacific/Auckland': 12,
    };

    const offsetHours = timezoneOffsets[timezone] || 0;
    const offsetMs = offsetHours * 60 * 60 * 1000;

    const [datePart, timePart] = localDateString.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);

    const localAsUTC = Date.UTC(year, (month - 1), day, hour, minute);
    const utcMs = localAsUTC - offsetMs;

    return new Date(utcMs).toISOString();
  };

  const fetchEventData = async (id: string) => {
    setFetchLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        const eventTimezone = data.timezone || 'Asia/Kolkata';
        setFormData({
          name: data.name || '',
          description: data.description || '',
          event_type: data.event_type || '',
          date: data.date ? convertUTCToLocal(data.date, eventTimezone) : '',
          venue: data.venue || '',
          max_participants: data.max_participants?.toString() || '',
          mode: data.mode || '',
          team_size: data.team_size?.toString() || '',
          approval_enabled: data.approval_enabled || false,
          timezone: eventTimezone,
          end_date: data.end_date ? convertUTCToLocal(data.end_date, eventTimezone) : '',
          speaker: data.speaker || '',
          prerequisites: data.prerequisites || '',
          prizes: data.prizes || '',
          tech_stack: Array.isArray(data.tech_stack) ? data.tech_stack.join(', ') : '',
          judging_criteria: data.judging_criteria || '',
          duration: data.duration?.toString() || '',
          networking: data.networking || '',
          speakers: Array.isArray(data.speakers) ? data.speakers.join(', ') : '',
          topics: Array.isArray(data.topics) ? data.topics.join(', ') : '',
          refreshments: data.refreshments || '',
          contest_type: data.contest_type || '',
          rules: data.rules || '',
          eligibility: data.eligibility || '',
          submission_format: data.submission_format || '',
          timeline: Array.isArray(data.timeline) ? data.timeline : [],
          prizes_and_tracks: Array.isArray(data.prizes_and_tracks) ? data.prizes_and_tracks : [],
          judges_and_mentors: Array.isArray(data.judges_and_mentors) ? data.judges_and_mentors : []
        });

        if (data.banner_url) {
          setBannerPreview(data.banner_url);
        }

        if (data.display_image_url) {
          setDisplayImagePreview(data.display_image_url);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch event data",
        variant: "destructive",
      });
      navigate('/admin/events');
    } finally {
      setFetchLoading(false);
    }
  };

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

  const handleDataChange = (field: string, data: any) => {
    setFormData(prev => ({ ...prev, [field]: data }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const previewUrl = URL.createObjectURL(file);
      setBannerPreview(previewUrl);
    }
  };

  const handleDisplayImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDisplayImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setDisplayImagePreview(previewUrl);
    }
  };

  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeDisplayImage = () => {
    setDisplayImageFile(null);
    setDisplayImagePreview('');
    if (displayImageInputRef.current) {
      displayImageInputRef.current.value = '';
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

  const handleNext = () => {
    if (currentStep === 1) {
      // Validate step 1
      if (!formData.name.trim() || !formData.event_type) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First create the registration form
      const formDataToInsert = {
        title: `${formData.name} Registration Form`,
        description: `Registration form for ${formData.name}`,
        is_published: true,
        require_signin: false
      };

      const { data: newForm, error: formError } = await supabase
        .from('forms')
        .insert([formDataToInsert])
        .select()
        .single();

      if (formError) throw formError;

      // Insert form fields
      const fieldsToInsert = registrationFormFields.map(field => ({
        form_id: newForm.id,
        field_type: field.field_type,
        label: field.label,
        description: field.description,
        placeholder: field.placeholder,
        required: field.required,
        options: field.options.length > 0 ? field.options : null,
        order_index: field.order_index,
        profile_field: field.profile_field || null
      }));

      const { error: fieldsError } = await supabase
        .from('form_fields')
        .insert(fieldsToInsert);

      if (fieldsError) throw fieldsError;

      // Now create the event with the form reference
      let banner_url = bannerPreview;
      let display_image_url = displayImagePreview;

      if (bannerFile) {
        const uploadedUrl = await uploadBanner(bannerFile);
        if (uploadedUrl) {
          banner_url = uploadedUrl;
        }
      }

      if (displayImageFile) {
        const uploadedDisplayImageUrl = await uploadBanner(displayImageFile);
        if (uploadedDisplayImageUrl) {
          display_image_url = uploadedDisplayImageUrl;
        }
      }

      const eventData = {
        name: formData.name,
        description: formData.description,
        event_type: formData.event_type as any,
        date: formData.date ? convertLocalToUTC(formData.date, formData.timezone) : null,
        venue: formData.venue || (formData.mode === 'online' ? 'Online' : ''),
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        mode: formData.mode || null,
        team_size: formData.team_size ? parseInt(formData.team_size) : null,
        approval_enabled: formData.approval_enabled,
        timezone: formData.timezone,
        banner_url: banner_url || null,
        display_image_url: display_image_url || null,
        registration_form_id: newForm.id,
        short_id: Math.random().toString(36).substring(2, 8).toUpperCase(),
        end_date: formData.end_date ? convertLocalToUTC(formData.end_date, formData.timezone) : null,
        speaker: formData.speaker || null,
        prerequisites: formData.prerequisites || null,
        prizes: formData.prizes || null,
        tech_stack: formData.tech_stack ? formData.tech_stack.split(',').map(s => s.trim()) : null,
        judging_criteria: formData.judging_criteria || null,
        duration: formData.duration ? parseFloat(formData.duration) : null,
        networking: formData.networking || null,
        speakers: formData.speakers ? formData.speakers.split(',').map(s => s.trim()) : null,
        topics: formData.topics ? formData.topics.split(',').map(s => s.trim()) : null,
        refreshments: formData.refreshments || null,
        contest_type: formData.contest_type || null,
        rules: formData.rules || null,
        eligibility: formData.eligibility || null,
        submission_format: formData.submission_format || null,
        timeline: formData.timeline || [],
        prizes_and_tracks: formData.prizes_and_tracks || [],
        judges_and_mentors: formData.judges_and_mentors || []
      };

      let error;
      if (isEditMode && eventId) {
        const { error: updateError } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', eventId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('events')
          .insert([eventData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: isEditMode ? "Event updated successfully" : "Event created successfully",
      });

      navigate('/admin/events');
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? 'update' : 'create'} event`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-background relative flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'Edit Event' : 'Create New Event'}
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              1
            </div>
            <div className={`flex-1 h-1 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              2
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Event Details</span>
            <span>Registration Form</span>
          </div>
        </div>

        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Event Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="event_type">Event Type *</Label>
                  <Select value={formData.event_type} onValueChange={(value: 'webinar' | 'hackathon' | 'meetup' | 'contest' | 'bootcamp' | 'seminar' | 'workshop' | 'conference' | 'fellowship' | 'cohort' | 'hiring_challenge' | 'ideathon' | 'learnathon') => setFormData(prev => ({ ...prev, event_type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type first" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hackathon">Hackathon</SelectItem>
                      <SelectItem value="webinar">Webinar</SelectItem>
                      <SelectItem value="seminar">Seminar</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="conference">Conference</SelectItem>
                      <SelectItem value="fellowship">Fellowship</SelectItem>
                      <SelectItem value="cohort">Cohort</SelectItem>
                      <SelectItem value="hiring_challenge">Hiring Challenge</SelectItem>
                      <SelectItem value="ideathon">Ideathon</SelectItem>
                      <SelectItem value="meetup">Meetup</SelectItem>
                      <SelectItem value="contest">Contest</SelectItem>
                      <SelectItem value="bootcamp">Bootcamp</SelectItem>
                      <SelectItem value="learnathon">Learnathon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Event Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter event name"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="approval_enabled"
                    checked={formData.approval_enabled}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, approval_enabled: checked as boolean }))}
                  />
                  <Label htmlFor="approval_enabled" className="cursor-pointer">
                    Require approval for registrations
                  </Label>
                </div>

                {formData.event_type && (
                  <>
                    {formData.event_type === 'hackathon' && (
                      <HackathonForm formData={formData} onInputChange={handleInputChange} onSelectChange={handleSelectChange} onDataChange={handleDataChange} />
                    )}
                    {(formData.event_type === 'webinar' ||
                      formData.event_type === 'contest' ||
                      formData.event_type === 'meetup' ||
                      formData.event_type === 'bootcamp' ||
                      formData.event_type === 'seminar' ||
                      formData.event_type === 'workshop' ||
                      formData.event_type === 'conference' ||
                      formData.event_type === 'fellowship' ||
                      formData.event_type === 'cohort' ||
                      formData.event_type === 'hiring_challenge' ||
                      formData.event_type === 'ideathon' ||
                      formData.event_type === 'learnathon') && (
                      <BootcampForm formData={formData} onInputChange={handleInputChange} onSelectChange={handleSelectChange} />
                    )}
                  </>
                )}

                {formData.event_type && (
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
                )}

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/admin/events')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="ml-auto"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Registration Form</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure the registration form for your event. Name and Email fields are required and cannot be removed.
                </p>
              </CardHeader>
              <CardContent>
                <EventFormBuilder
                  fields={registrationFormFields}
                  onFieldsChange={setRegistrationFormFields}
                />
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="ml-auto"
              >
                {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Event' : 'Create Event')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateEvent;
