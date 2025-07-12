import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Navigation from "@/components/navigation";
import SkillTag from "@/components/skill-tag";
import ProfilePhotoUpload from "@/components/profile-photo-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/auth";
import { Plus, X, Star } from "lucide-react";

export default function Profile() {
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    availability: "",
    isPublic: true,
  });

  const [skillsOffered, setSkillsOffered] = useState<string[]>([]);
  const [skillsWanted, setSkillsWanted] = useState<string[]>([]);
  const [newOfferedSkill, setNewOfferedSkill] = useState("");
  const [newWantedSkill, setNewWantedSkill] = useState("");

  const { data: feedback = [] } = useQuery({
    queryKey: ["/api/feedback/user", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/feedback/user/${user.id}`, {
        headers: auth.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch feedback");
      }
      
      return response.json();
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    } else if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        location: user.location || "",
        availability: user.availability || "",
        isPublic: user.isPublic ?? true,
      });
      setSkillsOffered(user.skillsOffered || []);
      setSkillsWanted(user.skillsWanted || []);
    }
  }, [user, authLoading, setLocation]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...auth.getAuthHeaders(),
        },
        body: JSON.stringify({
          ...data,
          skillsOffered,
          skillsWanted,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ["/api/users/profile"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const addOfferedSkill = () => {
    if (newOfferedSkill.trim() && !skillsOffered.includes(newOfferedSkill.trim())) {
      setSkillsOffered([...skillsOffered, newOfferedSkill.trim()]);
      setNewOfferedSkill("");
    }
  };

  const addWantedSkill = () => {
    if (newWantedSkill.trim() && !skillsWanted.includes(newWantedSkill.trim())) {
      setSkillsWanted([...skillsWanted, newWantedSkill.trim()]);
      setNewWantedSkill("");
    }
  };

  const removeOfferedSkill = (skill: string) => {
    setSkillsOffered(skillsOffered.filter(s => s !== skill));
  };

  const removeWantedSkill = (skill: string) => {
    setSkillsWanted(skillsWanted.filter(s => s !== skill));
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-skill-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-skill-secondary to-skill-accent rounded-xl flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-skill-gray">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-skill-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-skill-primary">Edit Profile</h1>
          <p className="text-skill-gray mt-2">
            Update your information and manage your skills
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProfilePhotoUpload
                  currentPhoto={user.profilePhoto || undefined}
                  userName={user.name}
                  onPhotoUpdate={(photoUrl) => {
                    // Update the user object with the new photo
                    refreshUser();
                  }}
                />

                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, State/Country"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Select
                    value={formData.availability}
                    onValueChange={(value) => setFormData({ ...formData, availability: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekdays">Weekdays</SelectItem>
                      <SelectItem value="evenings">Evenings</SelectItem>
                      <SelectItem value="weekends">Weekends</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="public-profile">Public Profile</Label>
                  <Switch
                    id="public-profile"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Skills Management */}
            <Card>
              <CardHeader>
                <CardTitle>Skills Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Skills I Offer</Label>
                  <div className="flex flex-wrap gap-2 mt-2 mb-3">
                    {skillsOffered.map((skill, index) => (
                      <SkillTag
                        key={index}
                        skill={skill}
                        variant="offered"
                        removable
                        onRemove={() => removeOfferedSkill(skill)}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newOfferedSkill}
                      onChange={(e) => setNewOfferedSkill(e.target.value)}
                      placeholder="Add a skill..."
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addOfferedSkill())}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addOfferedSkill}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Skills I Want</Label>
                  <div className="flex flex-wrap gap-2 mt-2 mb-3">
                    {skillsWanted.map((skill, index) => (
                      <SkillTag
                        key={index}
                        skill={skill}
                        variant="wanted"
                        removable
                        onRemove={() => removeWantedSkill(skill)}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newWantedSkill}
                      onChange={(e) => setNewWantedSkill(e.target.value)}
                      placeholder="Add a skill..."
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addWantedSkill())}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addWantedSkill}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feedback Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span>My Reviews & Ratings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl font-bold">{user.rating?.toFixed(1) || "0.0"}</span>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(user.rating || 0)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-skill-gray">({feedback.length} reviews)</span>
                </div>
              </div>

              {feedback.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 mx-auto mb-4 text-skill-gray opacity-50" />
                  <h3 className="font-medium mb-2">No reviews yet</h3>
                  <p className="text-skill-gray text-sm">
                    Complete skill swaps to receive reviews from other users!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedback.map((review: any) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {review.reviewer.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{review.reviewer.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {review.comment && (
                        <p className="text-sm text-skill-gray mb-2">{review.comment}</p>
                      )}
                      
                      <div className="text-xs text-skill-gray">
                        <span>Swap: </span>
                        <span className="text-skill-secondary">{review.swapRequest.offeredSkill}</span>
                        <span className="mx-1">↔</span>
                        <span className="text-skill-accent">{review.swapRequest.requestedSkill}</span>
                        <span className="ml-2">
                          • {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-skill-primary hover:bg-skill-primary/90"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
