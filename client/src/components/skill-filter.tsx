import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface SkillFilterProps {
  searchParams: {
    skill: string;
    location: string;
    availability: string;
    page: number;
  };
  setSearchParams: (params: any) => void;
}

export default function SkillFilter({ searchParams, setSearchParams }: SkillFilterProps) {
  const clearFilters = () => {
    setSearchParams({
      skill: "",
      location: "",
      availability: "",
      page: 1,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label>Skill</Label>
          <Input
            value={searchParams.skill}
            onChange={(e) =>
              setSearchParams({ ...searchParams, skill: e.target.value, page: 1 })
            }
            placeholder="Enter skill (e.g., React, Python, Guitar)..."
          />
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

      {/* Active filters display */}
      {(searchParams.skill || searchParams.location || searchParams.availability) && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Active filters:</span>
          {searchParams.skill && (
            <span className="px-2 py-1 bg-skill-secondary text-white rounded">
              Skill: {searchParams.skill}
            </span>
          )}
          {searchParams.location && (
            <span className="px-2 py-1 bg-skill-primary text-white rounded">
              Location: {searchParams.location}
            </span>
          )}
          {searchParams.availability && (
            <span className="px-2 py-1 bg-skill-primary text-white rounded">
              Availability: {searchParams.availability}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
} 