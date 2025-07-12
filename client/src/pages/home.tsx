import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Navigation from "@/components/navigation";
import UserCard from "@/components/user-card";
import SwapRequestModal from "@/components/swap-request-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Code, Palette, Languages, Music } from "lucide-react";
import { auth } from "@/lib/auth";
import type { User } from "@shared/schema";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useState({
    skill: "",
    location: "",
    availability: "",
    page: 1,
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/users/search", searchParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchParams.skill) params.append("skill", searchParams.skill);
      if (searchParams.location) params.append("location", searchParams.location);
      if (searchParams.availability) params.append("availability", searchParams.availability);
      params.append("page", searchParams.page.toString());

      const response = await fetch(`/api/users/search?${params}`, {
        headers: auth.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to search users");
      }

      return response.json();
    },
    enabled: !!user,
  });

  const handleRequestSwap = (targetUser: User) => {
    setSelectedUser(targetUser);
    setShowSwapModal(true);
  };

  const skillCategories = [
    { icon: Code, name: "Programming", skills: ["React", "Python", "JavaScript", "Node.js"] },
    { icon: Palette, name: "Design", skills: ["UI/UX Design", "Graphic Design", "Figma", "Adobe Suite"] },
    { icon: Languages, name: "Languages", skills: ["Spanish", "French", "German", "Japanese"] },
    { icon: Music, name: "Music", skills: ["Guitar", "Piano", "Music Theory", "Singing"] },
  ];

  if (authLoading) {
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-skill-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-skill-primary to-skill-accent rounded-2xl p-8 md:p-12 mb-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-black">Share Skills, Build Community</h1>
              <p className="text-lg mb-6 text-black">
                Connect with like-minded individuals to exchange knowledge, learn new skills, and grow together in a supportive community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* <Button className="bg-skill-secondary hover:bg-skill-secondary/90 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your Skills
                </Button> */}
                <Button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white">
                  <Search className="w-4 h-4 mr-2" />
                  Find Skills
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="grid grid-cols-2 gap-4">
                {skillCategories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <div key={index} className="bg-white bg-opacity-20 rounded-xl p-4 text-center">
                      <Icon className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">{category.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Filters */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Find Skills & People</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Skill Category</Label>
                    <Select
                      value={searchParams.skill}
                      onValueChange={(value) =>
                        setSearchParams({ ...searchParams, skill: value === "all" ? "" : value, page: 1 })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {skillCategories.flatMap(cat =>
                          cat.skills.map(skill => (
                            <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input
                      value={searchParams.location}
                      onChange={(e) =>
                        setSearchParams({ ...searchParams, location: e.target.value, page: 1 })
                      }
                      placeholder="Search location..."
                    />
                  </div>
                  <div>
                    <Label>Availability</Label>
                    <Select
                      value={searchParams.availability}
                      onValueChange={(value) =>
                        setSearchParams({ ...searchParams, availability: value === "any" ? "" : value, page: 1 })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any Time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Time</SelectItem>
                        <SelectItem value="weekdays">Weekdays</SelectItem>
                        <SelectItem value="evenings">Evenings</SelectItem>
                        <SelectItem value="weekends">Weekends</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Grid */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Available Members</h2>
                <div className="text-sm text-skill-gray">
                  {users.length} members found
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Skeleton className="w-16 h-16 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-3 w-1/6" />
                            <Skeleton className="h-3 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : users.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="text-skill-gray">
                      <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <h3 className="font-medium mb-2">No members found</h3>
                      <p className="text-sm">Try adjusting your search filters to find more people.</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {users
                    .filter((u: User) => u.id !== user.id)
                    .map((u: User) => (
                      <UserCard
                        key={u.id}
                        user={u}
                        onRequestSwap={handleRequestSwap}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Your Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-skill-gray">Active Swaps</span>
                    <Badge className="bg-skill-secondary">0</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-skill-gray">Pending Requests</span>
                    <Badge className="bg-skill-accent">0</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-skill-gray">Completed Swaps</span>
                    <Badge className="bg-skill-primary">0</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-skill-gray">Your Rating</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400">★</span>
                      <span className="font-semibold">{user.rating?.toFixed(1) || "0.0"}</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-skill-secondary hover:bg-skill-secondary/90">
                  View All Swaps
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Trending Skills</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">React Development</span>
                    <span className="text-xs text-skill-gray">+24%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">UI/UX Design</span>
                    <span className="text-xs text-skill-gray">+18%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Science</span>
                    <span className="text-xs text-skill-gray">+15%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Digital Marketing</span>
                    <span className="text-xs text-skill-gray">+12%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <SwapRequestModal
        isOpen={showSwapModal}
        onClose={() => setShowSwapModal(false)}
        targetUser={selectedUser}
        currentUserSkills={user.skillsOffered || []}
      />
    </div>
  );
}
