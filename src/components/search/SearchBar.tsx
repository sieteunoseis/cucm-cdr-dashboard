import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
}

export function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [value, setValue] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!value.trim()) return;
    timerRef.current = setTimeout(() => onSearch(value.trim()), 300);
    return () => clearTimeout(timerRef.current);
  }, [value, onSearch]);

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Search by phone number, device name, or user ID..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-12 text-lg"
      />
      {loading && (
        <div className="absolute right-3 top-3 h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      )}
    </div>
  );
}
