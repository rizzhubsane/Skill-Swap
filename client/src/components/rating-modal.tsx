import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/auth";
import { Star } from "lucide-react";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  swapId: number;
  revieweeId: number;
  revieweeName: string;
  offeredSkill: string;
  requestedSkill: string;
}

export default function RatingModal({ 
  isOpen, 
  onClose, 
  swapId, 
  revieweeId, 
  revieweeName,
  offeredSkill,
  requestedSkill
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitRatingMutation = useMutation({
    mutationFn: async (data: {
      swapId: number;
      revieweeId: number;
      rating: number;
      comment?: string;
    }) => {
      // Submit the rating
      const response = await fetch("/api/feedback/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...auth.getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit rating");
      }

      // Mark the swap as completed
      const completeResponse = await fetch(`/api/swaps/${data.swapId}/complete`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...auth.getAuthHeaders(),
        },
      });

      if (!completeResponse.ok) {
        const error = await completeResponse.json();
        throw new Error(error.message || "Failed to complete swap");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Rating submitted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/swaps/list"] });
      queryClient.invalidateQueries({ queryKey: ["/api/feedback/user"] });
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
    setRating(0);
    setComment("");
    setHoveredRating(0);
  };

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    submitRatingMutation.mutate({
      swapId,
      revieweeId,
      rating,
      comment: comment || undefined,
    });
  };

  const handleClose = () => {
    if (!submitRatingMutation.isPending) {
      onClose();
      resetForm();
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= (hoveredRating || rating);
      
      return (
        <button
          key={index}
          type="button"
          className={`p-1 transition-colors ${
            isFilled ? "text-yellow-400" : "text-gray-300"
          } hover:text-yellow-400`}
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
        >
          <Star className={`w-8 h-8 ${isFilled ? "fill-current" : ""}`} />
        </button>
      );
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Experience</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-skill-gray">
            Rate your experience with <span className="font-medium">{revieweeName}</span>
          </div>
          
          <div className="text-sm">
            <span className="text-skill-gray">Swap:</span>
            <div className="mt-1 p-2 bg-muted rounded">
              <span className="text-skill-secondary">{offeredSkill}</span>
              <span className="mx-2 text-skill-gray">↔</span>
              <span className="text-skill-accent">{requestedSkill}</span>
            </div>
          </div>
          
          <div>
            <Label>Rating</Label>
            <div className="flex justify-center mt-2">
              {renderStars()}
            </div>
            <div className="text-center mt-1 text-sm text-skill-gray">
              {rating > 0 && (
                <span>
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </span>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="comment">Comment (Optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this skill swap..."
              rows={3}
              className="mt-1"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button 
              onClick={handleSubmit}
              disabled={submitRatingMutation.isPending}
              className="flex-1 bg-skill-primary hover:bg-skill-primary/90"
            >
              {submitRatingMutation.isPending ? "Submitting..." : "Submit Rating"}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={submitRatingMutation.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 