import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar, UserCheck, LogOut, Plus, RefreshCw, AlertCircle, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EmailService } from '@/services/emailService';

interface Stats {
  totalUsers: number;
  totalEvents: number;
  totalRegistrations: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalEvents: 0, totalRegistrations: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [uploadingAssets, setUploadingAssets] = useState(false);
  const { isAdminAuthenticated, adminLogout } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
      return;
    }
    fetchStats();
  }, [isAdminAuthenticated, navigate]);

  const fetchStats = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const [usersResponse, eventsResponse, registrationsResponse] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('registrations').select('*', { count: 'exact', head: true })
      ]);

      // Check for errors in each response
      const errors = [
        usersResponse.error,
        eventsResponse.error,
        registrationsResponse.error
      ].filter(error => error !== null);

      if (errors.length > 0) {
        throw new Error(`Database access error: ${errors[0]?.message}`);
      }

      setStats({
        totalUsers: usersResponse.count || 0,
        totalEvents: eventsResponse.count || 0,
        totalRegistrations: registrationsResponse.count || 0
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch dashboard statistics');
      
      toast({
        title: "Error",
        description: "Failed to fetch dashboard stats. Please check your database permissions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchStats();
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const handleUploadEmailAssets = async () => {
    setUploadingAssets(true);
    try {
      // Fetch the logo from the public folder
      const response = await fetch('/logos/email-logo-white.png');
      if (!response.ok) throw new Error('Logo file not found');
      
      const blob = await response.blob();
      const file = new File([blob], 'email-logo-white.png', { type: 'image/png' });

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('public-assets')
        .upload('email-logo-white.png', file, {
          upsert: true,
          contentType: 'image/png'
        });

      if (uploadError) throw uploadError;

      toast({
        title: "Success",
        description: "Email assets uploaded successfully! Logo is now ready for use.",
      });
    } catch (error) {
      console.error('Error uploading email assets:', error);
      toast({
        title: "Error",
        description: "Failed to upload email assets. Make sure the public-assets bucket exists.",
        variant: "destructive",
      });
    } finally {
      setUploadingAssets(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setSendingEmail(true);
      
      const emailHtml = EmailService.generateEventEmailTemplate({
        eventName: "Sample Event - Email Template Preview",
        applicantName: "Admin",
        message: "This is a preview of the email template that will be sent to users when they register for events. The template includes the event details, registration information, and links to NAMESPACE social media channels.",
        eventDate: new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        eventVenue: "Sample Venue Location",
        subject: "Email Template Preview"
      });

      await EmailService.sendEmail({
        to: testEmail,
        subject: "NAMESPACE - Email Template Preview",
        html: emailHtml,
      });

      toast({
        title: "Success",
        description: `Test email sent to ${testEmail}`,
      });
      
      setTestEmail('');
    } catch (error) {
      console.error('Failed to send test email:', error);
      toast({
        title: "Error",
        description: "Failed to send test email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  if (!isAdminAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative">
      <header className="border-b bg-card relative z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalEvents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalRegistrations}</div>
            </CardContent>
          </Card>
        </div>

        {/* Test Email Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Email Template Preview</CardTitle>
            <CardDescription>Setup email assets and send test emails to preview the registration template</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={handleUploadEmailAssets}
                disabled={uploadingAssets}
                variant="outline"
              >
                {uploadingAssets ? 'Uploading...' : 'Setup Email Assets'}
              </Button>
              <p className="text-sm text-muted-foreground flex items-center">
                Click to automatically upload the logo to Supabase Storage
              </p>
            </div>
            <div className="flex gap-4">
              <Input
                type="email"
                placeholder="Enter email address"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleSendTestEmail}
                disabled={sendingEmail || !testEmail}
              >
                <Mail className="h-4 w-4 mr-2" />
                {sendingEmail ? 'Sending...' : 'Send Test Email'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your events platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                onClick={() => navigate('/admin/events/create')}
                className="h-auto py-4 flex flex-col gap-2"
              >
                <Plus className="h-6 w-6" />
                Create Event
              </Button>
              <Button 
                onClick={() => navigate('/admin/events')}
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
              >
                <Calendar className="h-6 w-6" />
                Manage Events
              </Button>
              <Button 
                onClick={() => navigate('/admin/users')}
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
              >
                <Users className="h-6 w-6" />
                View Users
              </Button>
              <Button 
                onClick={() => navigate('/admin/forms')}
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
              >
                <UserCheck className="h-6 w-6" />
                Create Form
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;