import { Button } from "@/components/ui/button";

const PRESETS = [
  { label: "1h", value: "1h" },
  { label: "4h", value: "4h" },
  { label: "24h", value: "24h" },
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
];

interface TimeRangeProps {
  selected: string;
  onSelect: (value: string) => void;
}

export function TimeRange({ selected, onSelect }: TimeRangeProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Time range:</span>
      {PRESETS.map((p) => (
        <Button
          key={p.value}
          variant={selected === p.value ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onSelect(p.value)}
        >
          {p.label}
        </Button>
      ))}
    </div>
  );
}
