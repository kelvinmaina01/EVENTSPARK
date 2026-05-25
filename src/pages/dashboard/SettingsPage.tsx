import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  Loader2, Send, UserPlus, Plus, Trash2, Sun, Moon, Monitor, Copy, 
  ExternalLink, Eye, Settings, Shield, Tag, Globe, Lock, Sparkles, Check, X,
  Key, Webhook
} from "lucide-react";
import { useTheme } from "next-themes";

const SOCIAL_PLATFORMS = [
  "Twitter / X", "LinkedIn", "Instagram", "Facebook", "YouTube", "TikTok", "GitHub",
];

type SocialLink = { platform: string; url: string };

function generateCompanySlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Math.random().toString(36).substring(2, 6);
}

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [companySlug, setCompanySlug] = useState("");
  const [initialized, setInitialized] = useState(false);
  
  // Invite States
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSending, setInviteSending] = useState(false);

  // Calendar Defaults States
  const [eventVisibility, setEventVisibility] = useState("public");
  const [publicGuestList, setPublicGuestList] = useState(true);
  const [collectFeedback, setCollectFeedback] = useState(true);
  const [activeStatus, setActiveStatus] = useState("active");

  // Admin Access & Tags States
  const [admins, setAdmins] = useState([
    {
      name: "Kelvin Gichinga",
      email: "kelvin.reallife8@gmail.com",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    },
  ]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [eventTags, setEventTags] = useState<string[]>([]);
  const [newEventTag, setNewEventTag] = useState("");
  const [showAddEventTag, setShowAddEventTag] = useState(false);

  const [memberTags, setMemberTags] = useState<string[]>([]);
  const [newMemberTag, setNewMemberTag] = useState("");
  const [showAddMemberTag, setShowAddMemberTag] = useState(false);

  // Embed States
  const [embedTheme, setEmbedTheme] = useState<"light" | "dark" | "contrast">("light");
  const [embedLayout, setEmbedLayout] = useState<"cards" | "list">("cards");
  const [copiedCode, setCopiedCode] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  if (profile && !initialized) {
    setFullName(profile.full_name || "");
    setCompany(profile.company || "");
    setWebsite((profile as any).website || "");
    setCompanyDescription((profile as any).company_description || "");
    const links = (profile as any).social_links;
    setSocialLinks(Array.isArray(links) ? links : []);
    setCompanySlug((profile as any).company_slug || "");
    setAvatarUrl(profile.avatar_url || "");
    setInitialized(true);
  }

  const handleSave = async () => {
    try {
      const slug = companySlug || (company ? generateCompanySlug(company) : undefined);
      await updateProfile.mutateAsync({
        full_name: fullName,
        company,
        website,
        company_description: companyDescription,
        social_links: socialLinks,
        avatar_url: avatarUrl,
        ...(slug ? { company_slug: slug } : {}),
      } as any);
      if (slug) setCompanySlug(slug);
      
      // Update local storage mock profile so it renders instantly
      const mockProfile = {
        full_name: fullName,
        company_slug: slug || companySlug,
        company_description: companyDescription,
        avatar_url: avatarUrl,
        joined_date: "Joined April 2025"
      };
      localStorage.setItem("mock_profile", JSON.stringify(mockProfile));
      
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviteSending(true);
    try {
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send invitation");
    } finally {
      setInviteSending(false);
    }
  };

  const handleAddAdmin = () => {
    if (!newAdminEmail.trim() || !newAdminEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    const namePart = newAdminEmail.split("@")[0];
    const capitalizedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    setAdmins([
      ...admins,
      {
        name: capitalizedName,
        email: newAdminEmail.trim(),
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${namePart}`,
      },
    ]);
    setNewAdminEmail("");
    toast.success(`${newAdminEmail} has been added as an admin.`);
  };

  const handleRemoveAdmin = (email: string) => {
    if (email === "kelvin.reallife8@gmail.com") {
      toast.error("Cannot remove primary owner admin.");
      return;
    }
    setAdmins(admins.filter(admin => admin.email !== email));
    toast.success("Admin access revoked.");
  };

  const handleAddEventTag = () => {
    if (!newEventTag.trim()) return;
    const cleanTag = newEventTag.trim();
    if (eventTags.includes(cleanTag)) {
      toast.error("Tag already exists.");
      return;
    }
    setEventTags([...eventTags, cleanTag]);
    setNewEventTag("");
    setShowAddEventTag(false);
    toast.success(`Category tag "${cleanTag}" created successfully.`);
  };

  const handleAddMemberTag = () => {
    if (!newMemberTag.trim()) return;
    const cleanTag = newMemberTag.trim();
    if (memberTags.includes(cleanTag)) {
      toast.error("Tag already exists.");
      return;
    }
    setMemberTags([...memberTags, cleanTag]);
    setNewMemberTag("");
    setShowAddMemberTag(false);
    toast.success(`Member tag "${cleanTag}" created successfully.`);
  };

  const handleDeleteEventTag = (tag: string) => {
    setEventTags(eventTags.filter(t => t !== tag));
    toast.success(`Category tag "${tag}" removed.`);
  };

  const handleDeleteMemberTag = (tag: string) => {
    setMemberTags(memberTags.filter(t => t !== tag));
    toast.success(`Member tag "${tag}" removed.`);
  };

  const handleChangeStatus = () => {
    const nextStatus = activeStatus === "active" ? "archived" : "active";
    setActiveStatus(nextStatus);
    toast.success(`Calendar status changed to ${nextStatus === "active" ? "Active" : "Archived"}`);
  };

  const handleDeleteCalendar = () => {
    toast.error("Permanently deleting the calendar requires confirmation.");
  };

  const addSocialLink = () => setSocialLinks([...socialLinks, { platform: "", url: "" }]);
  const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    const updated = [...socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setSocialLinks(updated);
  };
  const removeSocialLink = (index: number) => setSocialLinks(socialLinks.filter((_, i) => i !== index));

  const embedCodeString = `<iframe
  src="${window.location.origin}/embed/calendar/${companySlug || "kelvinmaina"}/events?theme=${embedTheme}&layout=${embedLayout}"
  width="600"
  height="450"
  frameborder="0"
  style="border: 1px solid ${embedTheme === "dark" ? "#2a2b2f" : "#ebf0f5"}; border-radius: 12px;"
  allowfullscreen=""
  aria-hidden="false"
  tabindex="0"
></iframe>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCodeString);
    setCopiedCode(true);
    toast.success("Embed iframe code copied to clipboard!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-16">
      <div>
        <h1 className="text-3xl font-display font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your event circles, pages, defaults, and teams.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted rounded-full p-1 flex flex-wrap h-auto gap-1">
          <TabsTrigger value="profile" className="rounded-full px-4 py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs sm:text-sm font-semibold">Profile</TabsTrigger>
          <TabsTrigger value="calendar" className="rounded-full px-4 py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs sm:text-sm font-semibold">Event Defaults</TabsTrigger>
          <TabsTrigger value="access" className="rounded-full px-4 py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs sm:text-sm font-semibold">Admins & Tags</TabsTrigger>
          <TabsTrigger value="embed" className="rounded-full px-4 py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs sm:text-sm font-semibold">Embed Widget</TabsTrigger>
          <TabsTrigger value="developer" className="rounded-full px-4 py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs sm:text-sm font-semibold">API & Webhooks</TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-full px-4 py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs sm:text-sm font-semibold">Appearance</TabsTrigger>
          <TabsTrigger value="team" className="rounded-full px-4 py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm text-xs sm:text-sm font-semibold">Co-Hosts</TabsTrigger>
        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile" className="mt-0">
          <div className="bg-card border border-border/40 rounded-2xl p-6 space-y-5 shadow-sm">
            <h3 className="text-lg font-display font-bold">User Information</h3>

            {/* Premium Avatar Selection Interface */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 border border-border/40 rounded-2xl bg-muted/10">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-pink-500/30 bg-muted shrink-0 flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <img src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${companySlug || "kelvinmaina"}`} alt="Fallback Avatar" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="space-y-2 flex-1 w-full text-center sm:text-left">
                <Label className="font-bold text-sm">Profile Avatar Photo</Label>
                <p className="text-xs text-muted-foreground">Upload a file or enter an avatar URL. If omitted, we'll auto-generate a cute emoji avatar for you!</p>
                <div className="flex flex-col sm:flex-row gap-2 pt-1 items-stretch">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const base64String = reader.result as string;
                          setAvatarUrl(base64String);
                          toast.success("Avatar image uploaded successfully!");
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                    className="text-xs rounded-full h-9 cursor-pointer flex-1 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-pink-500/10 file:text-pink-500 hover:file:bg-pink-500/20" 
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">or URL:</span>
                    <Input 
                      placeholder="https://image-url.com/avatar.png"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="text-xs rounded-full h-9 max-w-[200px]"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} className="rounded-full" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ""} disabled className="rounded-full bg-muted/30" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Company or Organization Name</Label>
              <Input value={company} onChange={e => setCompany(e.target.value)} className="rounded-full" />
            </div>
            <div className="space-y-2">
              <Label>Website Link</Label>
              <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourcompany.com" className="rounded-full" />
            </div>
            <div className="space-y-2">
              <Label>Bio or Short Description</Label>
              <Textarea
                value={companyDescription}
                onChange={e => setCompanyDescription(e.target.value)}
                placeholder="A short description of your company or organization…"
                rows={3}
                className="rounded-xl resize-none"
              />
            </div>

            {companySlug && (
              <div className="space-y-2">
                <Label>Public Custom Namespace Page</Label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Input
                    value={`${window.location.origin}/company/${companySlug}`}
                    readOnly
                    className="flex-1 text-sm rounded-full bg-muted/20"
                  />
                  <div className="flex gap-2 self-end sm:self-auto">
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0 rounded-full"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/company/${companySlug}`);
                        toast.success("Link copied!");
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <a href={`/company/${companySlug}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="icon" className="shrink-0 rounded-full">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label>Social media links</Label>
              {socialLinks.map((link, i) => (
                <div key={i} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Select value={link.platform} onValueChange={v => updateSocialLink(i, "platform", v)}>
                    <SelectTrigger className="w-full sm:w-40 shrink-0 rounded-full">
                      <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOCIAL_PLATFORMS.map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={link.url}
                    onChange={e => updateSocialLink(i, "url", e.target.value)}
                    placeholder="https://…"
                    className="flex-1 rounded-full"
                  />
                  <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive self-end sm:self-auto" onClick={() => removeSocialLink(i)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addSocialLink} className="rounded-full">
                <Plus className="w-4 h-4 mr-1.5" /> Add social profile
              </Button>
            </div>

            <Button onClick={handleSave} disabled={updateProfile.isPending} className="rounded-full bg-pink-500 hover:bg-pink-600 text-white font-semibold">
              {updateProfile.isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </TabsContent>

        {/* CALENDAR DEFAULTS TAB */}
        <TabsContent value="calendar" className="mt-0 space-y-6">
          {/* Event Defaults Card */}
          <div className="bg-card border border-border/40 rounded-2xl p-6 space-y-5 shadow-sm">
            <div>
              <h3 className="text-lg font-display font-bold">Event Defaults</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Default settings for new events created on this calendar circle.</p>
            </div>

            <div className="border border-border/40 rounded-2xl divide-y divide-border/40 bg-muted/10 overflow-hidden">
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5 max-w-md">
                  <h4 className="text-sm font-semibold text-foreground">Event Visibility</h4>
                  <p className="text-xs text-muted-foreground">Whether events are shown publicly or hidden from search engine indexing by default.</p>
                </div>
                <Select value={eventVisibility} onValueChange={setEventVisibility}>
                  <SelectTrigger className="w-full sm:w-36 rounded-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="space-y-0.5 max-w-md">
                  <h4 className="text-sm font-semibold text-foreground">Public Guest List</h4>
                  <p className="text-xs text-muted-foreground">Whether to show active attendees registered lists on your public pages.</p>
                </div>
                <Switch checked={publicGuestList} onCheckedChange={setPublicGuestList} />
              </div>

              <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="space-y-0.5 max-w-md">
                  <h4 className="text-sm font-semibold text-foreground">Collect Feedback</h4>
                  <p className="text-xs text-muted-foreground">Automatically trigger an email asking guests for ratings after the event ends.</p>
                </div>
                <Switch checked={collectFeedback} onCheckedChange={setCollectFeedback} />
              </div>
            </div>

            <p className="text-xs text-muted-foreground italic">
              Changing these default configurations does not affect live active events. You can always override settings for each individual event.
            </p>
          </div>

          {/* Tracking Card */}
          <div className="bg-card border border-border/40 rounded-2xl p-6 space-y-4 shadow-sm">
            <div>
              <h3 className="text-lg font-display font-bold">Tracking</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Track event registrations and conversions from Google or Meta ads pixels.</p>
            </div>
            <div className="p-5 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 border border-pink-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-pink-500 animate-pulse" /> Upgrade to Hostquill Plus</h4>
                <p className="text-xs text-muted-foreground max-w-md">Integrate full tracking script payloads with Google, Twitter/X, and Meta analytics.</p>
              </div>
              <Button size="sm" className="rounded-full bg-pink-500 hover:bg-pink-600 text-white font-semibold text-xs shrink-0 self-end sm:self-auto">Learn More</Button>
            </div>
          </div>

          {/* Status Settings Card */}
          <div className="bg-card border border-border/40 rounded-2xl p-6 space-y-6 shadow-sm">
            <div>
              <h3 className="text-lg font-display font-bold">Calendar Status</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Mark the calendar circle as coming soon or archive it if it is no longer active.</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h4 className="text-sm font-bold text-emerald-600 capitalize">{activeStatus}</h4>
                </div>
                <p className="text-xs text-muted-foreground">The calendar circle is fully active and accepting registrations, event submissions, and co-hostings.</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-full text-xs font-semibold shrink-0" onClick={handleChangeStatus}>
                Change Status
              </Button>
            </div>

            <hr className="border-border/60" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold text-destructive">Danger Zone</h4>
                <p className="text-xs text-muted-foreground">Permanently delete this event circle. All calendar data and stats will be lost.</p>
              </div>
              <Button variant="destructive" size="sm" className="rounded-full text-xs font-bold shrink-0" onClick={handleDeleteCalendar}>
                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Permanently Delete Calendar
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ACCESS & TAGS TAB */}
        <TabsContent value="access" className="mt-0 space-y-6">
          {/* Admins Card */}
          <div className="bg-card border border-border/40 rounded-2xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-display font-bold">Admins</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Admins have full access to co-hosts calendars and can approve public event submissions.</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Input
                  placeholder="cohost@email.com"
                  type="email"
                  value={newAdminEmail}
                  onChange={e => setNewAdminEmail(e.target.value)}
                  className="rounded-full text-xs h-9 max-w-[200px]"
                />
                <Button size="sm" className="rounded-full bg-pink-500 hover:bg-pink-600 text-white font-semibold text-xs shrink-0" onClick={handleAddAdmin}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Admin
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {admins.map((admin) => (
                <div key={admin.email} className="flex items-center justify-between p-3 border border-border/40 rounded-xl bg-muted/10 hover:border-border transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-border shrink-0 bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-xs font-bold text-white">
                      {admin.avatar ? (
                        <img src={admin.avatar} className="w-full h-full object-cover" alt="" />
                      ) : (
                        admin.name.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate leading-snug">{admin.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 rounded-full" onClick={() => handleRemoveAdmin(admin.email)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Tags Grid Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Tags Column */}
            <div className="bg-card border border-border/40 rounded-2xl p-6 space-y-5 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-display font-bold">Event Tags</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Let visitors filter events by category.</p>
                  </div>
                  {!showAddEventTag ? (
                    <Button size="sm" variant="outline" className="rounded-full text-xs font-semibold h-8" onClick={() => setShowAddEventTag(true)}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Create Tag
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" className="rounded-full text-xs font-semibold h-8 text-muted-foreground" onClick={() => setShowAddEventTag(false)}>
                      Cancel
                    </Button>
                  )}
                </div>

                {showAddEventTag && (
                  <div className="flex items-center gap-1.5 p-2 bg-muted/30 border border-border/40 rounded-xl">
                    <Input
                      placeholder="e.g. Workshop"
                      value={newEventTag}
                      onChange={e => setNewEventTag(e.target.value)}
                      className="rounded-full text-xs h-8"
                      onKeyDown={e => e.key === "Enter" && handleAddEventTag()}
                    />
                    <Button size="sm" className="rounded-full h-8 text-xs bg-pink-500 hover:bg-pink-600 text-white" onClick={handleAddEventTag}>
                      Add
                    </Button>
                  </div>
                )}

                {eventTags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {eventTags.map(tag => (
                      <Badge key={tag} variant="secondary" className="rounded-full px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5">
                        <Tag className="w-3 h-3 text-pink-500" />
                        {tag}
                        <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive cursor-pointer" onClick={() => handleDeleteEventTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center border border-dashed border-border/40 rounded-xl bg-muted/5">
                    <Tag className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground font-semibold">No Event Tags Created</p>
                    <p className="text-[11px] text-muted-foreground/80 mt-0.5">Created category tags appear here.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Member Tags Column */}
            <div className="bg-card border border-border/40 rounded-2xl p-6 space-y-5 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-display font-bold">Member Tags</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Organize your audience with admin-only tags.</p>
                  </div>
                  {!showAddMemberTag ? (
                    <Button size="sm" variant="outline" className="rounded-full text-xs font-semibold h-8" onClick={() => setShowAddMemberTag(true)}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Create Tag
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" className="rounded-full text-xs font-semibold h-8 text-muted-foreground" onClick={() => setShowAddMemberTag(false)}>
                      Cancel
                    </Button>
                  )}
                </div>

                {showAddMemberTag && (
                  <div className="flex items-center gap-1.5 p-2 bg-muted/30 border border-border/40 rounded-xl">
                    <Input
                      placeholder="e.g. VIP Member"
                      value={newMemberTag}
                      onChange={e => setNewMemberTag(e.target.value)}
                      className="rounded-full text-xs h-8"
                      onKeyDown={e => e.key === "Enter" && handleAddMemberTag()}
                    />
                    <Button size="sm" className="rounded-full h-8 text-xs bg-pink-500 hover:bg-pink-600 text-white" onClick={handleAddMemberTag}>
                      Add
                    </Button>
                  </div>
                )}

                {memberTags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {memberTags.map(tag => (
                      <Badge key={tag} variant="secondary" className="rounded-full px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5">
                        <Tag className="w-3 h-3 text-pink-500" />
                        {tag}
                        <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive cursor-pointer" onClick={() => handleDeleteMemberTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center border border-dashed border-border/40 rounded-xl bg-muted/5">
                    <Tag className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground font-semibold">No Member Tags Created</p>
                    <p className="text-[11px] text-muted-foreground/80 mt-0.5">Segmentation tags show up here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* EMBED CALENDAR WIDGET TAB */}
        <TabsContent value="embed" className="mt-0 space-y-6">
          <div className="bg-card border border-border/40 rounded-2xl p-6 space-y-6 shadow-sm">
            <div>
              <h3 className="text-lg font-display font-bold">Embed Events</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Embed your calendar widget to easily display live circles of upcoming events on your own website.</p>
            </div>

            {/* Premium Embed Customizer and Preview Container */}
            <div className="border border-border/40 rounded-2xl overflow-hidden bg-muted/10">
              {/* Toolbar */}
              <div className="p-3 border-b border-border/40 bg-card flex items-center justify-between flex-wrap gap-3">
                {/* Theme selectors */}
                <div className="flex items-center gap-1 bg-muted p-1 rounded-full text-xs">
                  <button
                    onClick={() => setEmbedTheme("light")}
                    className={`px-3 py-1.5 rounded-full font-bold transition-all ${embedTheme === "light" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => setEmbedTheme("dark")}
                    className={`px-3 py-1.5 rounded-full font-bold transition-all ${embedTheme === "dark" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => setEmbedTheme("contrast")}
                    className={`px-3 py-1.5 rounded-full font-bold transition-all ${embedTheme === "contrast" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Contrast
                  </button>
                </div>

                {/* Layout selectors */}
                <div className="flex items-center gap-1 bg-muted p-1 rounded-full text-xs">
                  <button
                    onClick={() => setEmbedLayout("cards")}
                    className={`px-3 py-1.5 rounded-full font-bold transition-all ${embedLayout === "cards" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Cards
                  </button>
                  <button
                    onClick={() => setEmbedLayout("list")}
                    className={`px-3 py-1.5 rounded-full font-bold transition-all ${embedLayout === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    List
                  </button>
                </div>
              </div>

              {/* Preview Arena */}
              <div className={`p-10 flex items-center justify-center transition-colors min-h-[300px] ${
                embedTheme === "dark" ? "bg-slate-950 border-slate-800 text-white" : embedTheme === "contrast" ? "bg-white border-2 border-black text-black" : "bg-white border-0 text-slate-900"
              }`}>
                <div className={`w-full max-w-md p-8 border rounded-2xl text-center space-y-4 shadow-sm bg-card/60 backdrop-blur-md transition-colors ${
                  embedTheme === "dark" ? "border-slate-800/80 bg-slate-900/60" : embedTheme === "contrast" ? "border-black border-2" : "border-border/40"
                }`}>
                  <div className="w-16 h-16 rounded-3xl bg-muted/40 border border-border/30 flex items-center justify-center text-4xl mx-auto shadow-sm">
                    📭
                  </div>
                  <h4 className="font-display font-bold text-lg">No Upcoming Events</h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">All hosted meets are currently complete. Check back soon for fresh community calendar circles!</p>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="rounded-full text-xs font-semibold px-4">
                      Browse Discover
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Output Segment */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <Label className="font-bold text-sm">Code to Copy</Label>
                <Button size="sm" variant="ghost" className="rounded-full text-xs text-pink-500 font-bold shrink-0" onClick={copyEmbedCode}>
                  {copiedCode ? <><Check className="w-3.5 h-3.5 mr-1" /> Copied!</> : <><Copy className="w-3.5 h-3.5 mr-1" /> Copy Code</>}
                </Button>
              </div>
              <div className="p-4 bg-muted/40 border border-border/40 rounded-2xl overflow-x-auto text-[11px] font-mono text-foreground leading-relaxed whitespace-pre select-all">
                {embedCodeString}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* DEVELOPER API & WEBHOOKS TAB */}
        <TabsContent value="developer" className="mt-0 space-y-6">
          {/* API Keys Card */}
          <div className="bg-card border border-border/40 rounded-2xl p-6 space-y-5 shadow-sm">
            <div>
              <h3 className="text-lg font-display font-bold">API Keys</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Use the Hostquill API or integrate with Zapier.</p>
            </div>

            <div className="py-8 text-center border border-dashed border-border/40 rounded-2xl bg-muted/5 space-y-3">
              <Key className="w-8 h-8 text-muted-foreground/30 mx-auto" />
              <div>
                <p className="text-sm font-bold">No API Keys</p>
                <p className="text-xs text-muted-foreground mt-0.5">Upgrade to Hostquill Plus to create API keys.</p>
              </div>
              <Button size="sm" className="rounded-full bg-pink-500 hover:bg-pink-600 text-white font-semibold text-xs">
                Upgrade to Hostquill Plus
              </Button>
            </div>
          </div>

          {/* Webhooks Card */}
          <div className="bg-card border border-border/40 rounded-2xl p-6 space-y-5 shadow-sm">
            <div>
              <h3 className="text-lg font-display font-bold">Webhooks</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Get notified in real-time about activities on your calendar circle.</p>
            </div>

            <div className="py-8 text-center border border-dashed border-border/40 rounded-2xl bg-muted/5 space-y-3">
              <Webhook className="w-8 h-8 text-muted-foreground/30 mx-auto animate-pulse" />
              <div>
                <p className="text-sm font-bold">No Webhooks</p>
                <p className="text-xs text-muted-foreground mt-0.5">Upgrade to Hostquill Plus to create webhooks.</p>
              </div>
              <Button size="sm" className="rounded-full bg-pink-500 hover:bg-pink-600 text-white font-semibold text-xs">
                Upgrade to Hostquill Plus
              </Button>
            </div>
          </div>

          {/* Calendar ID Card */}
          <div className="bg-card border border-border/40 rounded-2xl p-6 space-y-4 shadow-sm">
            <div>
              <h3 className="text-lg font-display font-bold">Calendar ID</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Programmatic circle identifier for integrations and query APIs.</p>
            </div>
            <div className="flex items-center gap-2 p-3 border border-border/40 bg-muted/10 rounded-2xl">
              <code className="text-xs font-mono font-bold text-pink-500 select-all flex-1">
                cal-vU8qMhMJPoDBJQq
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-full text-xs text-pink-500 font-bold shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText("cal-vU8qMhMJPoDBJQq");
                  toast.success("Calendar ID copied to clipboard!");
                }}
              >
                <Copy className="w-3.5 h-3.5 mr-1" /> Copy ID
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* APPEARANCE TAB */}
        <TabsContent value="appearance" className="mt-0">
          <div className="bg-card border border-border/40 rounded-2xl p-6 space-y-6 shadow-sm">
            <div>
              <h3 className="font-display font-semibold text-lg mb-1">Theme Preferences</h3>
              <p className="text-sm text-muted-foreground">Customize your visual interface mode preferences.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {([
                { value: "light", label: "Light", icon: Sun, desc: "Clean and bright interface" },
                { value: "dark", label: "Dark", icon: Moon, desc: "Easy on the eyes" },
                { value: "system", label: "System", icon: Monitor, desc: "Match your device settings" },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setTheme(opt.value); toast.success(`Theme set to ${opt.label}`); }}
                  className={`relative flex flex-col items-center gap-3 rounded-xl p-6 transition-all cursor-pointer text-left border ${
                    theme === opt.value
                      ? "bg-muted ring-2 ring-pink-500 border-transparent shadow-sm"
                      : "bg-muted/50 border-border/40 hover:bg-muted"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    theme === opt.value ? "bg-pink-500 text-white" : "bg-background text-muted-foreground"
                  }`}>
                    <opt.icon className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* CO-HOSTS TEAM TAB */}
        <TabsContent value="team" className="mt-0">
          <div className="bg-card border border-border/40 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <UserPlus className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-display font-semibold text-lg">Invite co-hosts</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Invite others to co-host and collaborate on events with you.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="colleague@email.com"
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleInvite()}
                className="flex-1 rounded-full"
              />
              <Button
                className="shrink-0 w-full sm:w-auto rounded-full bg-pink-500 hover:bg-pink-600 text-white font-semibold"
                onClick={handleInvite}
                disabled={inviteSending || !inviteEmail.trim()}
              >
                {inviteSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-1" /> Send Invite</>}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
