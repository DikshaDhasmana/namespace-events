import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Calendar, Mail, Phone, GraduationCap, Code, MailIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import EmailComposer from '@/components/EmailComposer';

interface Registration {
  id: string;
  registered_at: string;
  user_id: string;
  profiles: {
    email: string;
    full_name: string;
    phone_number: string;
    date_of_birth: string;
    academic_info: string;
    tech_stack: string[];
    skills: string[];
    profile_completed: boolean;
  };
}

interface Event {
  id: string;
  name: string;
  event_type: string;
  date: string;
  venue: string;
}

const EventRegistrations = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailComposerOpen, setIsEmailComposerOpen] = useState(false);
  const { eventId } = useParams<{ eventId: string }>();
  const { isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
      return;
    }
    if (eventId) {
      fetchEventAndRegistrations();
    }
  }, [isAdminAuthenticated, navigate, eventId]);

  const fetchEventAndRegistrations = async () => {
    try {
      const [eventResponse, registrationsResponse] = await Promise.all([
        supabase.from('events').select('*').eq('id', eventId).single(),
        supabase
          .from('registrations')
          .select('id, registered_at, user_id')
          .eq('event_id', eventId)
          .order('registered_at', { ascending: false })
      ]);

      if (eventResponse.error) throw eventResponse.error;
      if (registrationsResponse.error) throw registrationsResponse.error;

      // Fetch profiles separately
      const userIds = registrationsResponse.data?.map(r => r.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name, phone_number, date_of_birth, academic_info, tech_stack, skills, profile_completed')
        .in('id', userIds);

      // Merge registrations with profiles
      const registrationsWithProfiles = registrationsResponse.data?.map(reg => ({
        ...reg,
        profiles: profiles?.find(p => p.id === reg.user_id) || {
          email: '', full_name: '', phone_number: '', date_of_birth: '',
          academic_info: '', tech_stack: [], skills: [], profile_completed: false
        }
      })) || [];

      setEvent(eventResponse.data);
      setRegistrations(registrationsWithProfiles);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch registrations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdminAuthenticated) {
    return null;
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
          <div>
            <h1 className="text-2xl font-bold">Event Registrations</h1>
            {event && (
              <p className="text-muted-foreground">{event.name}</p>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="secondary">
              {registrations.length} registrations
            </Badge>
            {registrations.length > 0 && (
              <Button 
                onClick={() => setIsEmailComposerOpen(true)}
                className="ml-2"
              >
                <MailIcon className="h-4 w-4 mr-2" />
                Email Applicants
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {event && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(event.date), 'PPP')}</span>
                </div>
                <div>
                  <Badge variant="secondary">{event.event_type}</Badge>
                </div>
                <div>{event.venue}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-8">Loading registrations...</div>
        ) : registrations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No registrations yet</h3>
              <p className="text-muted-foreground">Registrations will appear here as users sign up</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {registrations.map((registration) => (
              <Card key={registration.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {registration.profiles.full_name || 'No name provided'}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {registration.profiles.email}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={registration.profiles.profile_completed ? "default" : "destructive"}>
                        {registration.profiles.profile_completed ? "Complete Profile" : "Incomplete"}
                      </Badge>
                      <Badge variant="outline">
                        Registered {format(new Date(registration.registered_at), 'MMM d, yyyy')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <User className="h-4 w-4" />
                        Contact Info
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {registration.profiles.phone_number && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            {registration.profiles.phone_number}
                          </div>
                        )}
                        {registration.profiles.date_of_birth && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            Born: {format(new Date(registration.profiles.date_of_birth), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <GraduationCap className="h-4 w-4" />
                        Academic Background
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {registration.profiles.academic_info || 'Not provided'}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Code className="h-4 w-4" />
                        Technical Profile
                      </div>
                      <div className="space-y-2">
                        {registration.profiles.tech_stack && registration.profiles.tech_stack.length > 0 && (
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Tech Stack:</div>
                            <div className="flex flex-wrap gap-1">
                              {registration.profiles.tech_stack.map((tech, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {registration.profiles.skills && registration.profiles.skills.length > 0 && (
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Skills:</div>
                            <div className="flex flex-wrap gap-1">
                              {registration.profiles.skills.map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <EmailComposer 
        isOpen={isEmailComposerOpen} 
        onClose={() => setIsEmailComposerOpen(false)} 
        recipients={registrations.map(reg => ({ 
          email: reg.profiles.email, 
          name: reg.profiles.full_name || 'Applicant'
        }))}
        eventName={event?.name}
      />
    </div>
  );
};

export default EventRegistrations;