import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { FormEvent } from "react";

type SearchBarProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch?: () => void;
};

const SearchBar = ({ searchQuery, onSearchChange, onSearch }: SearchBarProps) => {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative w-full max-w-2xl mx-auto my-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search destinations, spots, or routes..."
          className="pl-10 pr-24 py-3 text-lg"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <Button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 h-5/6">
          Search
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;