import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface AdvancedSearchParams {
  calling?: string;
  called?: string;
  device?: string;
  cause?: string;
  start?: string;
  end?: string;
  last?: string;
  limit?: string;
}

interface AdvancedSearchProps {
  onSearch: (params: AdvancedSearchParams) => void;
  loading?: boolean;
}

export function AdvancedSearch({ onSearch, loading }: AdvancedSearchProps) {
  const [open, setOpen] = useState(false);
  const [calling, setCalling] = useState("");
  const [called, setCalled] = useState("");
  const [device, setDevice] = useState("");
  const [cause, setCause] = useState("");

  // Default: last 15 minutes
  const toLocalDatetime = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const now = new Date();
  const fifteenAgo = new Date(now.getTime() - 15 * 60 * 1000);
  const [start, setStart] = useState(toLocalDatetime(fifteenAgo));
  const [end, setEnd] = useState(toLocalDatetime(now));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params: AdvancedSearchParams = {};
    if (calling.trim()) params.calling = calling.trim();
    if (called.trim()) params.called = called.trim();
    if (device.trim()) params.device = device.trim();
    if (cause.trim()) params.cause = cause.trim();
    if (start) params.start = new Date(start).toISOString();
    if (end) params.end = new Date(end).toISOString();
    if (!start && !end) params.last = "24h";
    params.limit = "200";
    onSearch(params);
  };

  const handleClear = () => {
    setCalling("");
    setCalled("");
    setDevice("");
    setCause("");
    setStart("");
    setEnd("");
  };

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Advanced Search
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Advanced Search</h3>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Close
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Calling Number (from)
            </label>
            <Input
              placeholder=""
              value={calling}
              onChange={(e) => setCalling(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Called Number (to)
            </label>
            <Input
              placeholder=""
              value={called}
              onChange={(e) => setCalled(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Device Name
            </label>
            <Input
              placeholder="e.g. SEPxxxxxxxxxxxx"
              value={device}
              onChange={(e) => setDevice(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Cause Code
            </label>
            <Input
              placeholder="e.g. 16"
              value={cause}
              onChange={(e) => setCause(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Start Time
            </label>
            <Input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              End Time
            </label>
            <Input
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
          <Button type="button" variant="outline" onClick={handleClear}>
            Clear
          </Button>
          <span className="text-xs text-muted-foreground ml-auto">
            Clear times for last 24h
          </span>
        </div>
      </form>
    </div>
  );
}
