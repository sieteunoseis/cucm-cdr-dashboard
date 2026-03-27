import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchBar } from "@/components/search/SearchBar";
import { TimeRange } from "@/components/search/TimeRange";
import {
  AdvancedSearch,
  type AdvancedSearchParams,
} from "@/components/search/AdvancedSearch";
import {
  ResultRow,
  isRecordingLeg,
  isTransfer,
  isConference,
} from "@/components/search/ResultRow";
import { useSearch } from "@/hooks/useSearch";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const REFRESH_INTERVAL = 30000;

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialTimeRange = searchParams.get("t") || "24h";

  const [timeRange, setTimeRange] = useState(initialTimeRange);
  const [limit, setLimit] = useState(100);
  const [hideRecording, setHideRecording] = useState(true);
  const [hideZeroDuration, setHideZeroDuration] = useState(false);
  const [hideTransfer, setHideTransfer] = useState(false);
  const [hideConference, setHideConference] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const lastSearchRef = useRef<Record<string, string> | null>(null);
  const { results, count, loading, error, search } = useSearch();

  const { filteredResults, hiddenCounts } = useMemo(() => {
    let filtered = results;
    const counts = {
      recording: 0,
      zeroDuration: 0,
      transfer: 0,
      conference: 0,
    };
    for (const r of results) {
      if (isRecordingLeg(r)) counts.recording++;
      if (
        r.duration === "00:00:00" ||
        r.duration === "0" ||
        Number(r.duration) === 0
      )
        counts.zeroDuration++;
      if (isTransfer(r)) counts.transfer++;
      if (isConference(r)) counts.conference++;
    }
    if (hideRecording) filtered = filtered.filter((r) => !isRecordingLeg(r));
    if (hideZeroDuration)
      filtered = filtered.filter(
        (r) =>
          r.duration !== "00:00:00" &&
          r.duration !== "0" &&
          Number(r.duration) !== 0,
      );
    if (hideTransfer) filtered = filtered.filter((r) => !isTransfer(r));
    if (hideConference) filtered = filtered.filter((r) => !isConference(r));
    return { filteredResults: filtered, hiddenCounts: counts };
  }, [results, hideRecording, hideZeroDuration, hideTransfer, hideConference]);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchParams({ q: query, t: timeRange }, { replace: true });
      const params = { number: query, last: timeRange, limit: String(limit) };
      lastSearchRef.current = params;
      search(params);
    },
    [search, timeRange, limit, setSearchParams],
  );

  const handleAdvancedSearch = useCallback(
    (params: AdvancedSearchParams) => {
      const clean: Record<string, string> = {};
      for (const [k, v] of Object.entries(params)) {
        if (v) clean[k] = v;
      }
      lastSearchRef.current = clean;
      search(clean);
    },
    [search],
  );

  // Load recent calls on mount (or re-run search when returning via back button)
  useEffect(() => {
    const params = initialQuery
      ? { number: initialQuery, last: initialTimeRange, limit: String(limit) }
      : { last: timeRange, limit: String(limit) };
    lastSearchRef.current = params;
    search(params);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !lastSearchRef.current) return;
    const id = setInterval(() => {
      if (lastSearchRef.current) search(lastSearchRef.current);
    }, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [autoRefresh, search]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <SearchBar
          onSearch={handleSearch}
          loading={loading}
          initialValue={initialQuery}
        />
        <div className="flex items-center justify-between">
          <TimeRange selected={timeRange} onSelect={setTimeRange} />
          <div className="flex items-center gap-2">
            <Button
              variant={autoRefresh ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              disabled={!lastSearchRef.current}
            >
              {autoRefresh ? "Auto-refresh on (30s)" : "Auto-refresh"}
            </Button>
          </div>
        </div>
        <AdvancedSearch onSearch={handleAdvancedSearch} loading={loading} />
      </div>
      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive text-sm">
          {error}
        </div>
      )}
      {results.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredResults.length} of {count} results
            </p>
            <div className="flex items-center gap-5 text-xs text-muted-foreground">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <Switch
                  checked={hideRecording}
                  onCheckedChange={setHideRecording}
                />
                Hide recording ({hiddenCounts.recording})
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <Switch
                  checked={hideZeroDuration}
                  onCheckedChange={setHideZeroDuration}
                />
                Hide 0s calls ({hiddenCounts.zeroDuration})
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <Switch
                  checked={hideTransfer}
                  onCheckedChange={setHideTransfer}
                />
                Hide transfers ({hiddenCounts.transfer})
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <Switch
                  checked={hideConference}
                  onCheckedChange={setHideConference}
                />
                Hide conferences ({hiddenCounts.conference})
              </label>
            </div>
          </div>
          <div className="space-y-2">
            {filteredResults.map((r) => (
              <ResultRow key={r.pkid} result={r} />
            ))}
          </div>
          {results.length >= limit && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setLimit((l) => l + 100)}
            >
              Load more
            </Button>
          )}
        </div>
      )}
      {!loading && results.length === 0 && count === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No calls found in the selected time range.
        </div>
      )}
    </div>
  );
}
