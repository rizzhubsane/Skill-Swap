import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Clock, ArrowRightLeft } from "lucide-react";
import SkillTag from "./skill-tag";
import type { User } from "@shared/schema";

interface UserCardProps {
  user: User;
  onRequestSwap: (user: User) => void;
}

export default function UserCard({ user, onRequestSwap }: UserCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={user.profilePhoto || ""} alt={user.name} />
            <AvatarFallback className="text-lg">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg">{user.name}</h3>
                <p className="text-skill-gray text-sm">{user.location}</p>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-medium">{user.rating?.toFixed(1) || "0.0"}</span>
                <span className="text-skill-gray text-sm">(0)</span>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="mb-2">
                <span className="text-sm font-medium text-skill-gray">Offers:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.skillsOffered?.map((skill, index) => (
                    <SkillTag key={index} skill={skill} variant="offered" />
                  ))}
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-skill-gray">Wants:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.skillsWanted?.map((skill, index) => (
                    <SkillTag key={index} skill={skill} variant="wanted" />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-skill-gray flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {user.availability || "Not specified"}
              </span>
              <Button 
                onClick={() => onRequestSwap(user)}
                className="bg-skill-primary hover:bg-skill-primary/90 text-white"
              >
                <ArrowRightLeft className="w-4 h-4 mr-1" />
                Request Swap
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
