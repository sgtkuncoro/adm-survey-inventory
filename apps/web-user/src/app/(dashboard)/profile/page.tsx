"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/utils/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  User, 
  MapPin, 
  Mail, 
  Calendar, 
  CreditCard, 
  Shield, 
  Bell, 
  LogOut,
  Camera,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { logout } from "@/app/(auth)/login/actions";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "male",
    country: "US",
    zipCode: "",
    bio: "",
    location: "",
    email: "",
    avatar: ""
  });
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
  });

  const supabase = createBrowserClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) {
          console.error("Auth error:", authError);
          // Redirect or handle unauthenticated
          return;
        }

        const { data: dbUser, error: dbError } = await supabase
          .from("users")
          .select("*, country, zip_code")
          .eq("id", authUser.id)
          .single();

        if (dbError && dbError.code !== 'PGRST116') {
             console.error("DB error:", dbError);
             toast.error("Failed to load profile data");
        }

        const fullName = dbUser?.full_name || authUser.user_metadata?.full_name || "";
        const [firstName, ...lastNameParts] = fullName.split(" ");
        const lastName = lastNameParts.join(" ");

        setUser({
           name: fullName || authUser.email?.split('@')[0] || "User",
           email: authUser.email,
           avatar: dbUser?.avatar_url || authUser.user_metadata?.avatar_url || "",
           joinDate: new Date(authUser.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
           location: dbUser?.location || "Unknown Location",
           plan: "Free Member" // Placeholder
        });

        setProfile({
          firstName: firstName || "",
          lastName: lastName || "",
          dateOfBirth: dbUser?.date_of_birth ? (() => {
             const [y, m, d] = dbUser.date_of_birth.split('-');
             return `${m}/${d}/${y}`;
          })() : "",
          gender: dbUser?.gender || "male",
          country: dbUser?.country || "US", 
          zipCode: dbUser?.zip_code || "",
          bio: dbUser?.bio || "",
          location: dbUser?.location || "",
          email: authUser.email || "",
          avatar: dbUser?.avatar_url || authUser.user_metadata?.avatar_url || ""
        });
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, [supabase]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error("No user found");

      const fullName = `${profile.firstName} ${profile.lastName}`.trim();

      const updates = {
        full_name: fullName,
        bio: profile.bio,
        location: profile.location, // Assuming this maps to something or we just use it
        date_of_birth: profile.dateOfBirth ? (() => {
           const [m, d, y] = profile.dateOfBirth.split('/');
           return `${y}-${m}-${d}`;
        })() : null,
        gender: profile.gender,
        country: profile.country,
        zip_code: profile.zipCode,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("users")
        .upsert({
          id: authUser.id,
          email: authUser.email,
          ...updates
        });

      if (error) throw error;

      // Also update auth metadata for better sync if needed
      // await supabase.auth.updateUser({ data: { full_name: fullName } });

      setUser((prev:any) => ({ ...prev, name: fullName, location: profile.location }));
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.new) {
        toast.error("Please enter a new password");
        return;
    }
    
    setIsSaving(true);
    try {
        const { error } = await supabase.auth.updateUser({ password: passwords.new });
        if (error) throw error;
        toast.success("Password updated successfully");
        setPasswords({ current: "", new: "" });
    } catch (error: any) {
        toast.error(error.message || "Failed to update password");
    } finally {
        setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
      await logout();
  };

  if (isLoading) {
      return (
          <div className="flex h-full w-full items-center justify-center min-h-[50vh]">
              <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          </div>
      );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Profile Header / Banner */}
      <div className="relative rounded-xl overflow-hidden bg-background border border-border p-6 sm:p-10">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="text-xl font-bold bg-muted text-muted-foreground">{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:opacity-90 transition-all border-2 border-background">
              <Camera className="h-4 w-4" />
            </div>
          </div>
          
          <div className="text-center sm:text-left space-y-2 flex-1">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground pb-1">{user?.name}</h1>
                <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2 mt-1 font-medium">
                  <Mail className="h-4 w-4 text-pink-500" /> {user?.email}
                </p>
              </div>
              <div className="flex gap-2">
                 <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 px-3 py-1 font-medium">
                   <Shield className="h-3 w-3 mr-1" /> Verified
                 </Badge>
                 <Badge variant="outline" className="border-indigo-200 text-indigo-700 dark:border-indigo-800 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 font-medium">
                   {user?.plan}
                 </Badge>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 text-sm text-muted-foreground pt-2 font-medium">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" /> {user?.location}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" /> Joined {user?.joinDate}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <div className="flex items-center justify-between pb-4">
          <TabsList className="bg-transparent w-full justify-start p-0 border-b border-border h-auto rounded-none">
            <TabsTrigger 
              value="general" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none px-0 py-3 font-medium text-muted-foreground transition-all hover:text-foreground hover:border-border/50"
            >
              <span className="px-4">
              General Info
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="preferences" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none px-0 py-3 font-medium text-muted-foreground transition-all hover:text-foreground hover:border-border/50"
            >
              <span className="px-4">
              Preferences
              </span>
            </TabsTrigger>
             <TabsTrigger 
              value="security" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none px-0 py-3 font-medium text-muted-foreground transition-all hover:text-foreground hover:border-border/50"
            >
              <span className="px-4">
              Security
              </span> 
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-6">
          {/* Main Content Column */}
          <div>
            <TabsContent value="general" className="mt-0 space-y-6">
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <Card className="bg-card border-border shadow-none">
                    <CardHeader>
                      <CardTitle className="text-base font-semibold text-foreground">Personal Information</CardTitle>
                      <CardDescription>Update your personal details and public profile.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" value={profile.firstName} onChange={(e) => setProfile({...profile, firstName: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" value={profile.lastName} onChange={(e) => setProfile({...profile, lastName: e.target.value})} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input 
                          type="text" 
                          id="dob" 
                          placeholder="MM/DD/YYYY"
                          value={profile.dateOfBirth} 
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '');
                            if (value.length > 8) value = value.slice(0, 8);
                            
                            // Clamp month to 12
                            if (value.length >= 2) {
                                const month = parseInt(value.slice(0, 2));
                                if (month === 0) value = '01' + value.slice(2);
                                else if (month > 12) value = '12' + value.slice(2);
                            }

                            // Clamp day to 31
                            if (value.length >= 4) {
                                const day = parseInt(value.slice(2, 4));
                                if (day === 0) value = value.slice(0, 2) + '01' + value.slice(4);
                                else if (day > 31) value = value.slice(0, 2) + '31' + value.slice(4);
                            }

                            // Clamp year to current year
                            if (value.length === 8) {
                                const year = parseInt(value.slice(4, 8));
                                const currentYear = new Date().getFullYear();
                                if (year > currentYear) {
                                    value = value.slice(0, 4) + currentYear.toString();
                                }
                            }
                            
                            if (value.length > 4) {
                              value = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
                            } else if (value.length > 2) {
                              value = `${value.slice(0, 2)}/${value.slice(2)}`;
                            }
                            
                            setProfile({...profile, dateOfBirth: value});
                          }} 
                        />
                        <p className="text-[0.8rem] text-muted-foreground">Format: MM/DD/YYYY</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                          value={profile.gender}
                          onValueChange={(value) =>
                            setProfile({ ...profile, gender: value })
                          }
                        >
                          <SelectTrigger id="gender">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" value={profile.location} onChange={(e) => setProfile({...profile, location: e.target.value})} placeholder="City, Country" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Input id="bio" value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} />
                    </div>

                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border shadow-none">
                    <CardHeader>
                      <CardTitle className="text-base font-semibold text-foreground">Address</CardTitle>
                      <CardDescription>Manage your billing and shipping address.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Select
                              value={profile.country}
                              onValueChange={(value) =>
                                setProfile({ ...profile, country: value })
                              }
                            >
                              <SelectTrigger id="country">
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="US">United States</SelectItem>
                                <SelectItem value="CA">Canada</SelectItem>
                                <SelectItem value="GB">United Kingdom</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="zipCode">Zip Code</Label>
                            <Input id="zipCode" value={profile.zipCode} onChange={(e) => setProfile({...profile, zipCode: e.target.value})} />
                          </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                          <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                          </Button>
                        </div>
                    </CardContent>
                  </Card>
                </form>
            </TabsContent>

            <TabsContent value="preferences" className="mt-0">
               <Card className="bg-card border-border shadow-none">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-foreground">Notification Preferences</CardTitle>
                  <CardDescription>Choose what updates you want to receive.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { title: "Survey Invitations", desc: "Receive emails when new surveys match your profile.", checked: true },
                    { title: "Marketing Emails", desc: "Receive emails about new features and special offers.", checked: false },
                    { title: "Security Alerts", desc: "Get notified about suspicious activity.", checked: true },
                  ].map((item, i) => (
                      <div key={i} className="flex items-start space-x-4 p-4 rounded-lg border border-border bg-background">
                        <div className="flex-1 space-y-1">
                          <p className="font-medium leading-none">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                        <Checkbox defaultChecked={item.checked} />
                      </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            
             <TabsContent value="security" className="mt-0">
               <Card className="bg-card border-border rounded-lg shadow-none">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-foreground">Security Settings</CardTitle>
                  <CardDescription>Manage your password and account security.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                      id="new-password" 
                      type="password" 
                      value={passwords.new}
                      onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    />
                  </div>
                   <Button 
                    variant="outline" 
                    className="w-full mt-2 bg-transparent border-input hover:bg-muted text-foreground transition-all shadow-none"
                    onClick={handleChangePassword}
                    disabled={isSaving}
                   >
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Change Password
                   </Button>
                </CardContent>
                <CardFooter className="bg-destructive/10 border-t border-destructive/20 flex justify-between items-center p-4 rounded-b-lg mt-4">
                  <div>
                    <h4 className="font-medium text-destructive">Delete Account</h4>
                    <p className="text-xs text-destructive/80">Permanently remove your account and all data.</p>
                  </div>
                  <Button variant="destructive" size="sm" className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all shadow-none">Delete</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
