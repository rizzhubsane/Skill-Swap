import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { auth } from "@/lib/auth";

interface UserRatingProps {
  userId: number;
  rating: number;
}

export default function UserRating({ userId, rating }: UserRatingProps) {
  const { data: feedback = [] } = useQuery({
    queryKey: ["/api/feedback/user", userId],
    queryFn: async () => {
      const response = await fetch(`/api/feedback/user/${userId}`, {
        headers: auth.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch user feedback");
      }
      
      return response.json();
    },
    enabled: !!userId,
  });

  return (
    <div className="flex items-center space-x-1">
      <Star className="w-4 h-4 text-yellow-400 fill-current" />
      <span className="font-medium">{rating?.toFixed(1) || "0.0"}</span>
      <span className="text-skill-gray text-sm">({feedback.length})</span>
    </div>
  );
} 