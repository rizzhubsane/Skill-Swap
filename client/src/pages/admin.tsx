import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  FileText, 
  ArrowRightLeft, 
  MessageCircle, 
  BarChart2, 
  Trash2, 
  Ban, 
  CheckCircle,
  Download,
  Send,
  AlertTriangle,
  Info,
  Wrench
} from "lucide-react";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const adminToken = localStorage.getItem("skillswap_token");
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      setUsers(await response.json());
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBanUser = async (userId: number, userName: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!response.ok) throw new Error("Failed to ban user");
      
      setUsers(users.map((u: any) => u.id === userId ? { ...u, isBanned: true } : u));
      toast({ title: "Success", description: `${userName} has been banned` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleUnbanUser = async (userId: number, userName: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/unban`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!response.ok) throw new Error("Failed to unban user");
      
      setUsers(users.map((u: any) => u.id === userId ? { ...u, isBanned: false } : u));
      toast({ title: "Success", description: `${userName} has been unbanned` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{users.filter((u: any) => !u.isBanned).length}</div>
            <p className="text-sm text-muted-foreground">Active Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{users.filter((u: any) => u.isBanned).length}</div>
            <p className="text-sm text-muted-foreground">Banned Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{users.filter((u: any) => u.isAdmin).length}</div>
            <p className="text-sm text-muted-foreground">Admin Users</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-left">User</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Location</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Skills</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user.id} className="border-t">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        {user.profilePhoto && (
                          <img src={user.profilePhoto} alt={user.name} className="w-8 h-8 rounded-full" />
                        )}
                        <div>
                          <div className="font-medium">{user.name}</div>
                          {user.isAdmin && <Badge variant="secondary">Admin</Badge>}
                        </div>
                      </div>
                    </td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">{user.location || 'N/A'}</td>
                    <td className="p-2">
                      <Badge variant={user.isBanned ? "destructive" : "default"}>
                        {user.isBanned ? "Banned" : "Active"}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="text-xs">
                        <div>Offered: {user.skillsOffered?.length || 0}</div>
                        <div>Wanted: {user.skillsWanted?.length || 0}</div>
                      </div>
                    </td>
                    <td className="p-2">
                      {!user.isAdmin && (
                        <div className="flex gap-2">
                          {user.isBanned ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnbanUser(user.id, user.name)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Unban
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleBanUser(user.id, user.name)}
                            >
                              <Ban className="w-4 h-4 mr-1" />
                              Ban
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SkillModeration() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const adminToken = localStorage.getItem("skillswap_token");
  const { toast } = useToast();

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/skills", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!response.ok) throw new Error("Failed to fetch skills");
      setSkills(await response.json());
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleReject = async (userId: number, skill: string, type: string) => {
    try {
      const response = await fetch(`/api/admin/skills/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ skill, type }),
      });
      if (!response.ok) throw new Error("Failed to remove skill");
      
      setSkills(skills.filter((s: any) => !(s.userId === userId && s.skill === skill && s.type === type)));
      toast({ title: "Success", description: "Inappropriate skill removed" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (loading) return <div>Loading skills...</div>;
  if (skills.length === 0) return <div>No skills to moderate.</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skill Moderation</CardTitle>
        <p className="text-sm text-muted-foreground">
          Review and remove inappropriate or spammy skill descriptions
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="p-2 text-left">User</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">Skill</th>
                <th className="p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((s: any, i: number) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{s.userName}</td>
                  <td className="p-2">{s.userEmail}</td>
                  <td className="p-2">
                    <Badge variant={s.type === "offered" ? "default" : "secondary"}>
                      {s.type}
                    </Badge>
                  </td>
                  <td className="p-2">{s.skill}</td>
                  <td className="p-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(s.userId, s.skill, s.type)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function AdminSwaps() {
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const adminToken = localStorage.getItem("skillswap_token");
  const { toast } = useToast();

  const fetchSwaps = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/swaps", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!response.ok) throw new Error("Failed to fetch swaps");
      setSwaps(await response.json());
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwaps();
  }, []);

  if (loading) return <div>Loading swaps...</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "secondary";
      case "accepted": return "default";
      case "completed": return "outline";
      case "rejected": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Swap Monitoring</CardTitle>
        <p className="text-sm text-muted-foreground">
          Monitor all swap requests and their current status
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{swaps.filter((s: any) => s.status === "pending").length}</div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{swaps.filter((s: any) => s.status === "accepted").length}</div>
              <p className="text-sm text-muted-foreground">Accepted</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{swaps.filter((s: any) => s.status === "completed").length}</div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{swaps.filter((s: any) => s.status === "rejected").length}</div>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="p-2 text-left">Sender</th>
                <th className="p-2 text-left">Receiver</th>
                <th className="p-2 text-left">Skills</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Created</th>
                <th className="p-2 text-left">Message</th>
              </tr>
            </thead>
            <tbody>
              {swaps.map((swap: any) => (
                <tr key={swap.id} className="border-t">
                  <td className="p-2">{swap.sender.name}</td>
                  <td className="p-2">{swap.receiver.name}</td>
                  <td className="p-2">
                    <div className="text-xs">
                      <div>Offers: {swap.offeredSkill}</div>
                      <div>Wants: {swap.requestedSkill}</div>
                    </div>
                  </td>
                  <td className="p-2">
                    <Badge variant={getStatusColor(swap.status)}>
                      {swap.status}
                    </Badge>
                  </td>
                  <td className="p-2">
                    {new Date(swap.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-2 max-w-xs truncate">
                    {swap.message || 'No message'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function PlatformMessages() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [loading, setLoading] = useState(false);
  const adminToken = localStorage.getItem("skillswap_token");
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!title.trim() || !message.trim()) {
      toast({ title: "Error", description: "Title and message are required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/messages/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ title, message, type }),
      });

      if (!response.ok) throw new Error("Failed to send message");
      
      toast({ title: "Success", description: "Platform message sent successfully" });
      setTitle("");
      setMessage("");
      setType("info");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getIconForType = (messageType: string) => {
    switch (messageType) {
      case "warning": return <AlertTriangle className="w-5 h-5" />;
      case "update": return <Wrench className="w-5 h-5" />;
      case "maintenance": return <Wrench className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Messages</CardTitle>
        <p className="text-sm text-muted-foreground">
          Send platform-wide announcements to all users
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Message Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter message title..."
          />
        </div>

        <div>
          <Label htmlFor="type">Message Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="info">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Information
                </div>
              </SelectItem>
              <SelectItem value="warning">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Warning
                </div>
              </SelectItem>
              <SelectItem value="update">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Feature Update
                </div>
              </SelectItem>
              <SelectItem value="maintenance">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Maintenance Alert
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="message">Message Content</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message..."
            rows={4}
          />
        </div>

        <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
          {getIconForType(type)}
          <div>
            <div className="font-medium">{title || "Message Title"}</div>
            <div className="text-sm text-muted-foreground">
              {message || "Your message content will appear here..."}
            </div>
          </div>
        </div>

        <Button onClick={handleSendMessage} disabled={loading} className="w-full">
          <Send className="w-4 h-4 mr-2" />
          {loading ? "Sending..." : "Send Platform Message"}
        </Button>
      </CardContent>
    </Card>
  );
}

function Reports() {
  const [userStats, setUserStats] = useState<any>(null);
  const [swapStats, setSwapStats] = useState<any>(null);
  const [feedbackStats, setFeedbackStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const adminToken = localStorage.getItem("skillswap_token");
  const { toast } = useToast();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [userResponse, swapResponse, feedbackResponse] = await Promise.all([
        fetch("/api/admin/reports/users", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        fetch("/api/admin/reports/swaps", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        fetch("/api/admin/reports/feedback", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
      ]);

      if (!userResponse.ok || !swapResponse.ok || !feedbackResponse.ok) {
        throw new Error("Failed to fetch reports");
      }

      setUserStats(await userResponse.json());
      setSwapStats(await swapResponse.json());
      setFeedbackStats(await feedbackResponse.json());
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const downloadReport = async (type: string) => {
    try {
      const response = await fetch(`/api/admin/reports/download/${type}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (!response.ok) throw new Error("Failed to download report");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_report.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({ title: "Success", description: `${type} report downloaded` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (loading) return <div>Loading reports...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Platform Analytics & Reports</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => downloadReport("users")}>
            <Download className="w-4 h-4 mr-2" />
            Users CSV
          </Button>
          <Button variant="outline" onClick={() => downloadReport("swaps")}>
            <Download className="w-4 h-4 mr-2" />
            Swaps CSV
          </Button>
          <Button variant="outline" onClick={() => downloadReport("feedback")}>
            <Download className="w-4 h-4 mr-2" />
            Feedback CSV
          </Button>
        </div>
      </div>

      {userStats && (
        <Card>
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{userStats?.totalUsers || 0}</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{userStats?.activeUsers || 0}</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{userStats?.bannedUsers || 0}</div>
                <div className="text-sm text-muted-foreground">Banned Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{userStats?.usersWithSkills || 0}</div>
                <div className="text-sm text-muted-foreground">Users with Skills</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{userStats?.recentUsers || 0}</div>
                <div className="text-sm text-muted-foreground">New Users (30 days)</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{userStats?.adminUsers || 0}</div>
                <div className="text-sm text-muted-foreground">Admin Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {swapStats && (
        <Card>
          <CardHeader>
            <CardTitle>Swap Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{swapStats?.totalSwaps || 0}</div>
                <div className="text-sm text-muted-foreground">Total Swaps</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{swapStats?.pendingSwaps || 0}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{swapStats?.acceptedSwaps || 0}</div>
                <div className="text-sm text-muted-foreground">Accepted</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{swapStats?.completedSwaps || 0}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{swapStats?.rejectedSwaps || 0}</div>
                <div className="text-sm text-muted-foreground">Rejected</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{swapStats?.recentSwaps || 0}</div>
                <div className="text-sm text-muted-foreground">Recent (7 days)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {feedbackStats && (
        <Card>
          <CardHeader>
            <CardTitle>Feedback & Rating Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{feedbackStats?.totalFeedback || 0}</div>
                <div className="text-sm text-muted-foreground">Total Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {feedbackStats?.averageRating ? feedbackStats.averageRating.toFixed(1) : 0}
                </div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{feedbackStats?.recentFeedback || 0}</div>
                <div className="text-sm text-muted-foreground">Recent (7 days)</div>
              </div>
            </div>
            
            {feedbackStats?.ratingDistribution && (
              <div>
                <h4 className="font-medium mb-2">Rating Distribution</h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(rating => (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="w-8">{rating}★</span>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${feedbackStats.totalFeedback > 0 
                              ? (feedbackStats.ratingDistribution[rating] / feedbackStats.totalFeedback) * 100 
                              : 0}%`
                          }}
                        />
                      </div>
                      <span className="w-8 text-sm text-muted-foreground">
                        {feedbackStats.ratingDistribution[rating]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const adminToken = localStorage.getItem("skillswap_token");

  useEffect(() => {
    if (!adminToken) {
      setLocation("/login");
    }
  }, [adminToken, setLocation]);

  if (!adminToken) {
    return <div>Redirecting to login...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, moderate content, and monitor platform activity
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="swaps" className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4" />
              Swaps
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="skills">
            <SkillModeration />
          </TabsContent>

          <TabsContent value="swaps">
            <AdminSwaps />
          </TabsContent>

          <TabsContent value="messages">
            <PlatformMessages />
          </TabsContent>

          <TabsContent value="reports">
            <Reports />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}