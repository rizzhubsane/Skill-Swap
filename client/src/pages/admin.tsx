import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Users, FileText, ArrowRightLeft, MessageCircle, BarChart2, Trash2 } from "lucide-react";

const sections = [
  { key: "users", label: "User Management", icon: Users },
  { key: "skills", label: "Skill Moderation", icon: FileText },
  { key: "swaps", label: "Swaps", icon: ArrowRightLeft },
  { key: "messages", label: "Messages", icon: MessageCircle },
  { key: "reports", label: "Reports", icon: BarChart2 },
];

function SkillModeration() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const adminToken = localStorage.getItem("skillswap_token");

  const fetchSkills = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/skills", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!response.ok) throw new Error("Failed to fetch skills");
      setSkills(await response.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
    // eslint-disable-next-line
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
    } catch (err) {
      alert("Failed to remove skill");
    }
  };

  if (loading) return <div>Loading skills...</div>;
  if (error) return <div className="text-destructive">{error}</div>;
  if (skills.length === 0) return <div>No skills to moderate.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-skill-primary text-white">
            <th className="p-2">User</th>
            <th className="p-2">Email</th>
            <th className="p-2">Type</th>
            <th className="p-2">Skill</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {skills.map((s: any, i: number) => (
            <tr key={i} className="border-b">
              <td className="p-2 font-medium">{s.userName}</td>
              <td className="p-2">{s.userEmail}</td>
              <td className="p-2 capitalize">{s.type}</td>
              <td className="p-2">{s.skill}</td>
              <td className="p-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleReject(s.userId, s.skill, s.type)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const adminToken = localStorage.getItem("skillswap_token");

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      setUsers(await response.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const handleBan = async (userId: number) => {
    if (!window.confirm("Are you sure you want to ban this user?")) return;
    try {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!response.ok) throw new Error("Failed to ban user");
      setUsers(users.map((u: any) => u.id === userId ? { ...u, isBanned: true } : u));
    } catch (err) {
      alert("Failed to ban user");
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-destructive">{error}</div>;
  if (users.length === 0) return <div>No users found.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-skill-primary text-white">
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Location</th>
            <th className="p-2">Status</th>
            <th className="p-2">Role</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u: any, i: number) => (
            <tr key={i} className="border-b">
              <td className="p-2 font-medium">{u.name}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.location || "-"}</td>
              <td className="p-2">
                {u.isBanned ? (
                  <span className="text-destructive font-semibold">Banned</span>
                ) : (
                  <span className="text-green-600 font-semibold">Active</span>
                )}
              </td>
              <td className="p-2">
                {u.isAdmin ? (
                  <span className="text-skill-accent font-semibold">Admin</span>
                ) : (
                  <span>User</span>
                )}
              </td>
              <td className="p-2">
                {!u.isAdmin && !u.isBanned && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleBan(u.id)}
                  >
                    Ban
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminSwaps() {
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const adminToken = localStorage.getItem("skillswap_token");

  const fetchSwaps = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/swaps", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!response.ok) throw new Error("Failed to fetch swaps");
      setSwaps(await response.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwaps();
    // eslint-disable-next-line
  }, []);

  const filteredSwaps = statusFilter === 'all' ? swaps : swaps.filter((s: any) => s.status === statusFilter);

  if (loading) return <div>Loading swaps...</div>;
  if (error) return <div className="text-destructive">{error}</div>;
  if (swaps.length === 0) return <div>No swaps found.</div>;

  return (
    <div>
      <div className="mb-4 flex gap-2 items-center">
        <label className="font-medium">Filter by status:</label>
        <select
          className="border rounded px-2 py-1"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-skill-primary text-white">
              <th className="p-2">Sender</th>
              <th className="p-2">Receiver</th>
              <th className="p-2">Offered Skill</th>
              <th className="p-2">Requested Skill</th>
              <th className="p-2">Status</th>
              <th className="p-2">Message</th>
              <th className="p-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {filteredSwaps.map((swap: any, i: number) => (
              <tr key={i} className="border-b">
                <td className="p-2 font-medium">{swap.sender?.name} <br /><span className="text-xs text-gray-500">{swap.sender?.email}</span></td>
                <td className="p-2 font-medium">{swap.receiver?.name} <br /><span className="text-xs text-gray-500">{swap.receiver?.email}</span></td>
                <td className="p-2">{swap.offeredSkill}</td>
                <td className="p-2">{swap.requestedSkill}</td>
                <td className="p-2 capitalize">{swap.status}</td>
                <td className="p-2">{swap.message || '-'}</td>
                <td className="p-2">{new Date(swap.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("users");

  useEffect(() => {
    const token = localStorage.getItem("skillswap_token");
    if (!token) {
      setLocation("/login");
    } else {
      setLoading(false);
    }
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("skillswap_token");
    setLocation("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-skill-background">
        <div className="text-skill-gray">Checking admin authentication...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-skill-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border flex flex-col py-8 px-4 min-h-screen">
        <h2 className="text-2xl font-bold text-skill-primary mb-8">Admin</h2>
        <nav className="flex-1 space-y-2">
          {sections.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left font-medium transition-colors ${
                activeSection === key
                  ? "bg-skill-primary text-white"
                  : "hover:bg-skill-primary/10 text-skill-primary"
              }`}
              onClick={() => setActiveSection(key)}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </nav>
        <Button onClick={handleLogout} variant="outline" className="mt-8 w-full">Logout</Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold text-skill-primary mb-8">
          {sections.find(s => s.key === activeSection)?.label}
        </h1>
        <div className="bg-white rounded-xl shadow p-8 min-h-[300px]">
          {activeSection === "users" && <UserManagement />}
          {activeSection === "skills" && <SkillModeration />}
          {activeSection === "swaps" && <AdminSwaps />}
          {activeSection === "messages" && (
            <div>Messages section (coming soon)</div>
          )}
          {activeSection === "reports" && (
            <div>Reports section (coming soon)</div>
          )}
        </div>
      </main>
    </div>
  );
}
