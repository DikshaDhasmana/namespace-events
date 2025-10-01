import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Phone, GraduationCap, Code, Award, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  date_of_birth: string | null;
  academic_info: string | null;
  tech_stack: string[] | null;
  skills: string[] | null;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showRedirectDialog, setShowRedirectDialog] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfile();

    // Check if there's a stored redirect URL from event detail
    const storedRedirectUrl = localStorage.getItem('profileRedirectUrl');
    if (storedRedirectUrl) {
      setRedirectUrl(storedRedirectUrl);
    }
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      // If profile doesn't exist, create a basic one
      if (error.code === 'PGRST116') {
        const newProfile = {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          phone_number: null,
          date_of_birth: null,
          academic_info: null,
          tech_stack: null,
          skills: null,
          profile_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProfile(newProfile);
      }
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !profile) return;

    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('fullName') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const academicInfo = formData.get('academicInfo') as string;
    const techStack = (formData.get('techStack') as string).split(',').map(s => s.trim()).filter(s => s);
    const skills = (formData.get('skills') as string).split(',').map(s => s.trim()).filter(s => s);

    // Check if profile is completed (all required fields filled)
    const isProfileCompleted = !!fullName && !!phoneNumber && !!dateOfBirth && !!academicInfo && techStack.length > 0 && skills.length > 0;

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: profile.email,
        full_name: fullName,
        avatar_url: profile.avatar_url,
        phone_number: phoneNumber || null,
        date_of_birth: dateOfBirth || null,
        academic_info: academicInfo || null,
        tech_stack: techStack.length > 0 ? techStack : null,
        skills: skills.length > 0 ? skills : null,
        profile_completed: isProfileCompleted,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile",
      });
    } else {
      toast({
        title: "Success",
        description: isProfileCompleted ? "Profile completed successfully!" : "Profile updated successfully",
      });
      setProfile(prev => prev ? {
        ...prev,
        full_name: fullName,
        phone_number: phoneNumber || null,
        date_of_birth: dateOfBirth || null,
        academic_info: academicInfo || null,
        tech_stack: techStack.length > 0 ? techStack : null,
        skills: skills.length > 0 ? skills : null,
        profile_completed: isProfileCompleted,
        updated_at: new Date().toISOString(),
      } : null);

      // Show redirect dialog if profile was just completed and there's a redirect URL
      if (isProfileCompleted && redirectUrl) {
        setShowRedirectDialog(true);
      }
    }

    setSaving(false);
  };

  const handleRedirectToEvent = () => {
    if (redirectUrl) {
      // Clear the stored URL
      localStorage.removeItem('profileRedirectUrl');
      // Navigate to the event
      window.location.href = redirectUrl;
    }
    setShowRedirectDialog(false);
  };

  const handleCloseDialog = () => {
    // Clear the stored URL when dialog is closed without redirecting
    localStorage.removeItem('profileRedirectUrl');
    setShowRedirectDialog(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading your profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Profile not found</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b">
          <div className="container mx-auto px-6 py-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Profile</h1>
              <p className="text-muted-foreground text-lg">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg">
              <CardHeader className="pb-6">
                <div className="flex items-center space-x-6">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
                      {profile.full_name?.charAt(0) || profile.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-1">{profile.full_name || 'User'}</CardTitle>
                    <CardDescription className="text-base mb-2">{profile.email}</CardDescription>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        Member since {new Date(profile.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                        })}
                      </div>
                      {profile.profile_completed && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          ✓ Profile Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSave} className="space-y-8">
                  {/* Personal Information Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="flex items-center space-x-3">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            value={profile.email}
                            disabled
                            className="bg-muted/50"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Email cannot be changed
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <div className="flex items-center space-x-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="fullName"
                            name="fullName"
                            type="text"
                            defaultValue={profile.full_name || ''}
                            placeholder="Enter your full name"
                            className="focus:ring-2"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <div className="flex items-center space-x-3">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phoneNumber"
                            name="phoneNumber"
                            type="tel"
                            defaultValue={profile.phone_number || ''}
                            placeholder="Enter your phone number"
                            className="focus:ring-2"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <div className="flex items-center space-x-3">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="dateOfBirth"
                            name="dateOfBirth"
                            type="date"
                            defaultValue={profile.date_of_birth || ''}
                            className="focus:ring-2"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Academic & Professional Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold border-b pb-2">Academic & Professional</h3>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="academicInfo">Academic Information</Label>
                        <div className="flex items-start space-x-3">
                          <GraduationCap className="h-4 w-4 text-muted-foreground mt-3" />
                          <Textarea
                            id="academicInfo"
                            name="academicInfo"
                            defaultValue={profile.academic_info || ''}
                            placeholder="Enter your academic background (degree, institution, etc.)"
                            rows={3}
                            className="focus:ring-2"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="techStack">Tech Stack (comma-separated)</Label>
                        <div className="flex items-center space-x-3">
                          <Code className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="techStack"
                            name="techStack"
                            type="text"
                            defaultValue={profile.tech_stack?.join(', ') || ''}
                            placeholder="e.g., React, Node.js, Python, JavaScript"
                            className="focus:ring-2"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="skills">Skills (comma-separated)</Label>
                        <div className="flex items-center space-x-3">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="skills"
                            name="skills"
                            type="text"
                            defaultValue={profile.skills?.join(', ') || ''}
                            placeholder="e.g., Leadership, Communication, Problem Solving"
                            className="focus:ring-2"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <Button type="submit" disabled={saving} size="lg" className="px-8">
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showRedirectDialog} onOpenChange={setShowRedirectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profile Completed</DialogTitle>
            <DialogDescription>
              Your profile has been completed successfully. Would you like to go back to the event page?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleRedirectToEvent}>Go to Event</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}