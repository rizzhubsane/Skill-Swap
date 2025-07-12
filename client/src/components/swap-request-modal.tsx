import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { auth } from "@/lib/auth";
import type { User } from "@shared/schema";

interface SwapRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: User | null;
  currentUserSkills: string[];
}

export default function SwapRequestModal({ 
  isOpen, 
  onClose, 
  targetUser, 
  currentUserSkills 
}: SwapRequestModalProps) {
  const [offeredSkill, setOfferedSkill] = useState("");
  const [requestedSkill, setRequestedSkill] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendSwapMutation = useMutation({
    mutationFn: async (data: {
      receiverId: number;
      offeredSkill: string;
      requestedSkill: string;
      message?: string;
    }) => {
      const response = await fetch("/api/swaps/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...auth.getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send swap request");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Swap request sent successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/swaps/list"] });
      onClose();
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setOfferedSkill("");
    setRequestedSkill("");
    setMessage("");
  };

  const handleSubmit = () => {
    if (!targetUser || !offeredSkill || !requestedSkill) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    sendSwapMutation.mutate({
      receiverId: targetUser.id,
      offeredSkill,
      requestedSkill,
      message: message || undefined,
    });
  };

  const handleClose = () => {
    if (!sendSwapMutation.isPending) {
      onClose();
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request a Skill Swap</DialogTitle>
        </DialogHeader>
        
        {targetUser && (
          <div className="space-y-4">
            <div className="text-sm text-skill-gray">
              Sending request to: <span className="font-medium">{targetUser.name}</span>
            </div>
            
            <div>
              <Label htmlFor="offered-skill">Your Skill to Offer</Label>
              <Select value={offeredSkill} onValueChange={setOfferedSkill}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a skill..." />
                </SelectTrigger>
                <SelectContent>
                  {currentUserSkills.map((skill) => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="requested-skill">Skill You Want</Label>
              <Select value={requestedSkill} onValueChange={setRequestedSkill}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a skill..." />
                </SelectTrigger>
                <SelectContent>
                  {targetUser.skillsOffered?.map((skill) => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell them why you'd like to swap skills..."
                rows={3}
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button 
                onClick={handleSubmit}
                disabled={sendSwapMutation.isPending}
                className="flex-1 bg-skill-primary hover:bg-skill-primary/90"
              >
                {sendSwapMutation.isPending ? "Sending..." : "Send Request"}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleClose}
                disabled={sendSwapMutation.isPending}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
