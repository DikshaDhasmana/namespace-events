import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, FolderKanban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: string;
  name: string;
  description: string;
  event_type: string;
  date: string;
  end_date: string | null;
  venue: string;
  banner_url: string | null;
  team_size: number | null;
}

export default function HackathonDashboard() {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (eventId) {
      fetchEventAndVerifyRegistration();
    }
  }, [eventId, user]);

  const fetchEventAndVerifyRegistration = async () => {
    if (!user) return;

    // Fetch event details
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !eventData) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch event details",
      });
      navigate('/events');
      return;
    }

    // Verify event is a hackathon
    if (eventData.event_type !== 'hackathon') {
      toast({
        variant: "destructive",
        title: "Invalid Event Type",
        description: "This dashboard is only available for hackathon events",
      });
      navigate(`/events/${eventId}`);
      return;
    }

    setEvent(eventData);

    // Verify user is registered
    const { data: registrationData } = await supabase
      .from('registrations')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('event_id', eventId)
      .eq('status', 'approved')
      .single();

    if (!registrationData) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You must be registered and approved for this hackathon",
      });
      navigate(`/events/${eventId}`);
      return;
    }

    setIsRegistered(true);
    setLoading(false);
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

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  if (!event || !isRegistered) {
    return null;
  }

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 sm:px-6">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/events/${eventId}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Event Details
        </Button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200">
            Hackathon
          </Badge>
        </div>
        <h1 className="text-3xl font-bold mb-2 font-heading">{event.name}</h1>
        <p className="text-muted-foreground">
          {formatDate(event.date)} {event.end_date && `- ${formatDate(event.end_date)}`}
        </p>
      </div>

      {/* Dashboard Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Team Management Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Team Management</CardTitle>
            </div>
            <CardDescription>
              Create a new team or join an existing team for this hackathon
              {event.team_size && ` (${event.team_size} members per team)`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full"
              disabled
            >
              Create New Team
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              disabled
            >
              Join Existing Team
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Team formation feature coming soon
            </p>
          </CardContent>
        </Card>

        {/* Project Management Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FolderKanban className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Project Management</CardTitle>
            </div>
            <CardDescription>
              Create and manage your hackathon project submission
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full"
              disabled
            >
              Create New Project
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              disabled
            >
              View My Project
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Project management feature coming soon
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info Banner */}
      <Card className="mt-6 bg-muted/50">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground text-center">
            Welcome to your hackathon dashboard! Team formation and project management features are currently under development and will be available soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
