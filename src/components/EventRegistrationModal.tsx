import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { EmailService } from '@/services/emailService';

interface FormField {
  id: string;
  field_type: 'text' | 'email' | 'number' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'date' | 'time' | 'file';
  label: string;
  description: string;
  placeholder: string;
  required: boolean;
  options: string[];
  order_index: number;
}

interface EventRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
  approvalEnabled: boolean;
  utmSource?: string | null;
  onRegistrationSuccess: () => void;
}

const EventRegistrationModal = ({
  isOpen,
  onClose,
  eventId,
  eventName,
  approvalEnabled,
  utmSource,
  onRegistrationSuccess
}: EventRegistrationModalProps) => {
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Helper to validate UUID format
  const isValidUUID = (str: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  // Fetch form fields when modal opens
  useEffect(() => {
    if (isOpen && eventId) {
      fetchFormFields();
    }
  }, [isOpen, eventId]);

  const fetchFormFields = async () => {
    setFetchLoading(true);
    try {
      // First get the event to find the registration form
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('registration_form_id')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      if (!event?.registration_form_id) {
        toast({
          title: "Error",
          description: "No registration form found for this event",
          variant: "destructive",
        });
        onClose();
        return;
      }

      // Fetch form fields
      const { data: fields, error: fieldsError } = await supabase
        .from('form_fields')
        .select('*')
        .eq('form_id', event.registration_form_id)
        .order('order_index');

      if (fieldsError) throw fieldsError;

      const formattedFields: FormField[] = fields.map(f => ({
        id: f.id,
        field_type: f.field_type as FormField['field_type'],
        label: f.label,
        description: f.description || '',
        placeholder: f.placeholder || '',
        required: f.required,
        options: Array.isArray(f.options) ? f.options.map(String) : [],
        order_index: f.order_index
      }));

      setFormFields(formattedFields);

      // Initialize form data
      const initialData: Record<string, any> = {};
      formattedFields.forEach(field => {
        if (field.field_type === 'checkbox') {
          initialData[field.id] = [];
        } else {
          initialData[field.id] = '';
        }
      });
      setFormData(initialData);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      onClose();
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
    setFormData(prev => {
      const currentValues = prev[fieldId] || [];
      if (checked) {
        return {
          ...prev,
          [fieldId]: [...currentValues, option]
        };
      } else {
        return {
          ...prev,
          [fieldId]: currentValues.filter((v: string) => v !== option)
        };
      }
    });
  };

  const validateForm = (): boolean => {
    for (const field of formFields) {
      if (field.required) {
        const value = formData[field.id];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          toast({
            title: "Validation Error",
            description: `Please fill in the ${field.label} field`,
            variant: "destructive",
          });
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to register",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    try {
      // First get the event to find the registration form
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('registration_form_id, date, venue')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      // Create form submission
      const { data: submission, error: submissionError } = await supabase
        .from('form_submissions')
        .insert([{
          form_id: event.registration_form_id,
          submission_data: formData
        }])
        .select()
        .single();

      if (submissionError) throw submissionError;

      // Create registration record
      const registrationData: any = {
        user_id: user.id,
        event_id: eventId,
        form_submission_id: submission.id
      };

      // Include utm_source if present, valid UUID, and it's not the same user (prevent self-referrals)
      if (utmSource && isValidUUID(utmSource) && utmSource !== user.id) {
        registrationData.utm_source = utmSource;
      }

      const { error: registrationError } = await supabase
        .from('registrations')
        .insert([registrationData]);

      if (registrationError) throw registrationError;

      const newStatus = approvalEnabled ? 'pending' : 'approved';

      toast({
        title: "Success!",
        description: approvalEnabled
          ? "Your registration request has been submitted. You will receive an email once reviewed."
          : "You have been registered for the event",
      });

      // Send appropriate email
      if (approvalEnabled) {
        await sendPendingEmail(event.date, event.venue);
      } else {
        await sendConfirmationEmail(event.date, event.venue);
      }

      onRegistrationSuccess();
      onClose();

    } catch (error: any) {
      if (error.code === '23505') {
        toast({
          variant: "destructive",
          title: "Already registered",
          description: "You are already registered for this event",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: error.message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const sendPendingEmail = async (eventDate: string, eventVenue: string) => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const emailTemplate = EmailService.generateEventEmailTemplate({
        eventName,
        applicantName: profile?.full_name || 'Participant',
        message: `Thank you for your interest in ${eventName}. We have received your registration request and will review your profile. You will hear back from us shortly.`,
        eventDate: formatDate(eventDate),
        eventVenue,
        subject: `Registration Request Received: ${eventName}`
      });

      await EmailService.sendEmail({
        to: user.email || '',
        subject: `Registration Request Received: ${eventName}`,
        html: emailTemplate
      });
    } catch (error) {
      console.error('Failed to send pending email:', error);
    }
  };

  const sendConfirmationEmail = async (eventDate: string, eventVenue: string) => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const emailTemplate = EmailService.generateEventEmailTemplate({
        eventName,
        applicantName: profile?.full_name || 'Participant',
        message: `Thank you for registering for ${eventName}! We're excited to have you join us.`,
        eventDate: formatDate(eventDate),
        eventVenue,
        subject: `Registration Confirmed: ${eventName}`
      });

      await EmailService.sendEmail({
        to: user.email || '',
        subject: `Registration Confirmed: ${eventName}`,
        html: emailTemplate
      });
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id];

    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <Input
            type={field.field_type}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            rows={3}
          />
        );

      case 'select':
        return (
          <Select value={value || ''} onValueChange={(value) => handleInputChange(field.id, value)}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${field.id}-${index}`}
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.required}
                />
                <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${index}`}
                  checked={(value || []).includes(option)}
                  onCheckedChange={(checked) => handleCheckboxChange(field.id, option, checked as boolean)}
                />
                <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
          />
        );

      case 'time':
        return (
          <Input
            type="time"
            value={value || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register for {eventName}</DialogTitle>
        </DialogHeader>

        {fetchLoading ? (
          <div className="text-center py-8">Loading registration form...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {formFields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {field.description && (
                  <p className="text-sm text-muted-foreground">{field.description}</p>
                )}
                {renderField(field)}
              </div>
            ))}

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventRegistrationModal;
