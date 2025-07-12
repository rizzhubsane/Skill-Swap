import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { ArrowRightLeft } from "lucide-react";
import RegistrationPhotoUpload from "@/components/registration-photo-upload";

export default function Register() {
  const [, setLocation] = useLocation();
  const { register: registerUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      location: "",
      availability: "",
      skillsOffered: [],
      skillsWanted: [],
      isPublic: true,
    },
  });

  const onSubmit = async (data: InsertUser) => {
    setIsLoading(true);
    try {
      const userData = {
        ...data,
        profilePhoto: profilePhoto || undefined,
      };
      await registerUser(userData);
      toast({
        title: "Success",
        description: "Account created successfully!",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Registration failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-skill-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-skill-secondary to-skill-accent rounded-xl flex items-center justify-center">
              <ArrowRightLeft className="text-white w-6 h-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-skill-primary">
            Join SkillSwap
          </CardTitle>
          <p className="text-skill-gray">Create your account to start swapping skills</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter your full name"
                className="mt-1"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="Enter your email"
                className="mt-1"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...form.register("password")}
                placeholder="Create a password (min 6 characters)"
                className="mt-1"
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...form.register("location")}
                placeholder="City, State/Country"
                className="mt-1"
              />
            </div>

            <RegistrationPhotoUpload onPhotoChange={setProfilePhoto} />

            <Button
              type="submit"
              className="w-full bg-skill-primary hover:bg-skill-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-skill-gray">
              Already have an account?{" "}
              <Link href="/login">
                <span className="text-skill-primary hover:underline font-medium">
                  Sign in
                </span>
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
