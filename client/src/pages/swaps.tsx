import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/auth";
import { Clock, CheckCircle, XCircle, MessageCircle } from "lucide-react";

interface SwapRequestWithUsers {
  id: number;
  offeredSkill: string;
  requestedSkill: string;
  status: string;
  message?: string;
  createdAt: string;
  sender: {
    id: number;
    name: string;
    email: string;
  };
  receiver: {
    id: number;
    name: string;
    email: string;
  };
}

export default function Swaps() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  const { data: swaps = [], isLoading } = useQuery<SwapRequestWithUsers[]>({
    queryKey: ["/api/swaps/list"],
    queryFn: async () => {
      const response = await fetch("/api/swaps/list", {
        headers: auth.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch swap requests");
      }
      
      return response.json();
    },
    enabled: !!user,
  });

  const respondToSwapMutation = useMutation({
    mutationFn: async ({ swapId, status }: { swapId: number; status: string }) => {
      const response = await fetch(`/api/swaps/${swapId}/respond`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...auth.getAuthHeaders(),
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to respond to swap request");
      }

      return response.json();
    },
    onSuccess: (_, { status }) => {
      toast({
        title: "Success",
        description: `Swap request ${status} successfully!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/swaps/list"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "accepted":
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
      case "rejected":
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case "completed":
        return <Badge variant="outline" className="text-blue-600 border-blue-600"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sentSwaps = swaps.filter(swap => swap.sender.id === user?.id);
  const receivedSwaps = swaps.filter(swap => swap.receiver.id === user?.id);

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
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-skill-primary">My Swaps</h1>
          <p className="text-skill-gray mt-2">
            Manage your skill swap requests and view your exchange history
          </p>
        </div>

        <Tabs defaultValue="received" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received">Received Requests ({receivedSwaps.length})</TabsTrigger>
            <TabsTrigger value="sent">Sent Requests ({sentSwaps.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-skill-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-skill-gray">Loading swap requests...</p>
              </div>
            ) : receivedSwaps.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-skill-gray opacity-50" />
                  <h3 className="font-medium mb-2">No received requests</h3>
                  <p className="text-skill-gray text-sm">
                    You haven't received any swap requests yet. Keep your profile active to attract swap partners!
                  </p>
                </CardContent>
              </Card>
            ) : (
              receivedSwaps.map((swap) => (
                <Card key={swap.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback>
                            {swap.sender.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{swap.sender.name}</h3>
                            {getStatusBadge(swap.status)}
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm">
                              <span className="text-skill-gray">Offers:</span>
                              <Badge variant="outline" className="bg-skill-secondary bg-opacity-10 text-white border-skill-secondary">
                                {swap.offeredSkill}
                              </Badge>
                              <span className="text-skill-gray">for</span>
                              <Badge variant="outline" className="bg-skill-accent bg-opacity-10 text-white border-skill-accent">
                                {swap.requestedSkill}
                              </Badge>
                            </div>
                            
                            {swap.message && (
                              <div className="text-sm">
                                <span className="text-skill-gray">Message:</span>
                                <p className="mt-1 p-2 bg-muted rounded text-sm">{swap.message}</p>
                              </div>
                            )}
                            
                            <p className="text-xs text-skill-gray">
                              Sent {formatDate(swap.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {swap.status === "pending" && (
                        <div className="flex space-x-2 ml-4">
                          <Button
                            size="sm"
                            className="bg-skill-secondary hover:bg-skill-secondary/90"
                            onClick={() => respondToSwapMutation.mutate({ swapId: swap.id, status: "accepted" })}
                            disabled={respondToSwapMutation.isPending}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => respondToSwapMutation.mutate({ swapId: swap.id, status: "rejected" })}
                            disabled={respondToSwapMutation.isPending}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-skill-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-skill-gray">Loading swap requests...</p>
              </div>
            ) : sentSwaps.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-skill-gray opacity-50" />
                  <h3 className="font-medium mb-2">No sent requests</h3>
                  <p className="text-skill-gray text-sm">
                    You haven't sent any swap requests yet. Browse the community to find skills you're interested in!
                  </p>
                  <Button 
                    className="mt-4 bg-skill-primary hover:bg-skill-primary/90"
                    onClick={() => setLocation("/")}
                  >
                    Browse Skills
                  </Button>
                </CardContent>
              </Card>
            ) : (
              sentSwaps.map((swap) => (
                <Card key={swap.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>
                          {swap.receiver.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">To: {swap.receiver.name}</h3>
                          {getStatusBadge(swap.status)}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="text-skill-gray">You offered:</span>
                            <Badge variant="outline" className="bg-skill-secondary bg-opacity-10 text-white border-skill-secondary">
                              {swap.offeredSkill}
                            </Badge>
                            <span className="text-skill-gray">for</span>
                            <Badge variant="outline" className="bg-skill-accent bg-opacity-10 text-white border-skill-accent">
                              {swap.requestedSkill}
                            </Badge>
                          </div>
                          
                          {swap.message && (
                            <div className="text-sm">
                              <span className="text-skill-gray">Your message:</span>
                              <p className="mt-1 p-2 bg-muted rounded text-sm">{swap.message}</p>
                            </div>
                          )}
                          
                          <p className="text-xs text-skill-gray">
                            Sent {formatDate(swap.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
