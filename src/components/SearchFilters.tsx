import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  countyFilter: string;
  onCountyChange: (value: string) => void;
}

const NY_COUNTIES = [
  "All Counties",
  "Albany", "Allegany", "Bronx", "Broome", "Cattaraugus", "Cayuga", "Chautauqua", 
  "Chemung", "Chenango", "Clinton", "Columbia", "Cortland", "Delaware", "Dutchess", 
  "Erie", "Essex", "Franklin", "Fulton", "Genesee", "Greene", "Hamilton", "Herkimer", 
  "Jefferson", "Kings", "Lewis", "Livingston", "Madison", "Monroe", "Montgomery", 
  "Nassau", "New York", "Niagara", "Oneida", "Onondaga", "Ontario", "Orange", 
  "Orleans", "Oswego", "Otsego", "Putnam", "Queens", "Rensselaer", "Richmond", 
  "Rockland", "Saratoga", "Schenectady", "Schoharie", "Schuyler", "Seneca", 
  "St. Lawrence", "Steuben", "Suffolk", "Sullivan", "Tioga", "Tompkins", "Ulster", 
  "Warren", "Washington", "Wayne", "Westchester", "Wyoming", "Yates"
];

export const SearchFilters = ({
  searchQuery,
  onSearchChange,
  countyFilter,
  onCountyChange,
}: SearchFiltersProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="search">Search Programs</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            type="text"
            placeholder="Search by organization name, location, or services..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="county">County</Label>
        <Select value={countyFilter} onValueChange={onCountyChange}>
          <SelectTrigger id="county">
            <SelectValue placeholder="Select a county" />
          </SelectTrigger>
          <SelectContent>
            {NY_COUNTIES.map((county) => (
              <SelectItem key={county} value={county}>
                {county}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
