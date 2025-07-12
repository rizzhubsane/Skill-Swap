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
import { loginSchema, type LoginData } from "@shared/schema";
import { ArrowRightLeft } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<'user' | 'admin'>('user');
  const [adminError, setAdminError] = useState<string | null>(null);
  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    setAdminError(null);
    try {
      if (loginMode === 'user') {
        await login(data);
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
        setLocation("/");
      } else {
        // Admin login
        const response = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Admin login failed");
        // Store token as skillswap_token for unified experience
        localStorage.setItem("skillswap_token", result.token);
        toast({
          title: "Success",
          description: "Logged in as admin!",
        });
        setLocation("/admin");
      }
    } catch (error: any) {
      if (loginMode === 'admin') setAdminError(error.message);
      toast({
        title: "Error",
        description: error.message || "Login failed",
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
            Welcome Back
          </CardTitle>
          <p className="text-skill-gray">Sign in to your SkillSwap account</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="user" value={loginMode} onValueChange={v => setLoginMode(v as 'user' | 'admin')} className="mb-4">
            <TabsList className="w-full flex">
              <TabsTrigger value="user" className="flex-1">User Login</TabsTrigger>
              <TabsTrigger value="admin" className="flex-1">Admin Login</TabsTrigger>
            </TabsList>
          </Tabs>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder={loginMode === 'admin' ? "Enter admin email" : "Enter your email"}
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
                placeholder="Enter your password"
                className="mt-1"
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
            {loginMode === 'admin' && adminError && (
              <div className="text-destructive text-sm">{adminError}</div>
            )}
            <Button
              type="submit"
              className="w-full bg-skill-primary hover:bg-skill-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (loginMode === 'admin' ? "Signing In as Admin..." : "Signing In...") : (loginMode === 'admin' ? "Sign In as Admin" : "Sign In")}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-skill-gray">
              Don't have an account?{" "}
              <Link href="/register">
                <span className="text-skill-primary hover:underline font-medium">
                  Sign up
                </span>
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
