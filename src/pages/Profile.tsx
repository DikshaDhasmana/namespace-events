import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Phone, GraduationCap, Code, Award, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfile();
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
    }

    setSaving(false);
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
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-lg">
                {profile.full_name?.charAt(0) || profile.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{profile.full_name || 'User'}</CardTitle>
              <CardDescription>{profile.email}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-muted"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  defaultValue={profile.full_name || ''}
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  defaultValue={profile.phone_number || ''}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  defaultValue={profile.date_of_birth || ''}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="academicInfo">Academic Information</Label>
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="academicInfo"
                  name="academicInfo"
                  defaultValue={profile.academic_info || ''}
                  placeholder="Enter your academic background (degree, institution, etc.)"
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="techStack">Tech Stack (comma-separated)</Label>
              <div className="flex items-center space-x-2">
                <Code className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="techStack"
                  name="techStack"
                  type="text"
                  defaultValue={profile.tech_stack?.join(', ') || ''}
                  placeholder="e.g., React, Node.js, Python, JavaScript"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="skills"
                  name="skills"
                  type="text"
                  defaultValue={profile.skills?.join(', ') || ''}
                  placeholder="e.g., Leadership, Communication, Problem Solving"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Member Since</Label>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(profile.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {profile.profile_completed && (
              <Badge variant="secondary" className="w-full justify-center">
                ✓ Profile Completed
              </Badge>
            )}

            <Button type="submit" disabled={saving} className="w-full">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}