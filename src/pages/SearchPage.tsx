import { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchBar } from "@/components/search/SearchBar";
import { TimeRange } from "@/components/search/TimeRange";
import { ResultRow, isRecordingLeg } from "@/components/search/ResultRow";
import { useSearch } from "@/hooks/useSearch";
import { Button } from "@/components/ui/button";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialTimeRange = searchParams.get("t") || "24h";

  const [timeRange, setTimeRange] = useState(initialTimeRange);
  const [limit, setLimit] = useState(100);
  const [hideRecording, setHideRecording] = useState(false);
  const { results, count, loading, error, search } = useSearch();

  const filteredResults = useMemo(() => {
    if (!hideRecording) return results;
    return results.filter((r) => !isRecordingLeg(r));
  }, [results, hideRecording]);

  const recordingCount = useMemo(
    () => results.filter((r) => isRecordingLeg(r)).length,
    [results],
  );

  const handleSearch = useCallback(
    (query: string) => {
      setSearchParams({ q: query, t: timeRange }, { replace: true });
      search({
        number: query,
        last: timeRange,
        limit: String(limit),
      });
    },
    [search, timeRange, limit, setSearchParams],
  );

  // Re-run search when returning via back button
  useEffect(() => {
    if (initialQuery && results.length === 0 && !loading) {
      search({
        number: initialQuery,
        last: initialTimeRange,
        limit: String(limit),
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <SearchBar
          onSearch={handleSearch}
          loading={loading}
          initialValue={initialQuery}
        />
        <TimeRange selected={timeRange} onSelect={setTimeRange} />
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
              {hideRecording && recordingCount > 0 && (
                <span className="ml-1">
                  ({recordingCount} recording legs hidden)
                </span>
              )}
            </p>
            {recordingCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHideRecording(!hideRecording)}
              >
                {hideRecording ? "Show" : "Hide"} recording legs (
                {recordingCount})
              </Button>
            )}
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
      {!loading && results.length === 0 && count === 0 && !initialQuery && (
        <div className="text-center py-12 text-muted-foreground">
          Search for a phone number, device name, or user ID to get started.
        </div>
      )}
    </div>
  );
}
