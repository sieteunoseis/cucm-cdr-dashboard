import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { relatedCalls } from "@/api/client";
import { formatDurationFromInterval, formatTimestamp } from "@/lib/format";

interface RelatedCallsProps {
  callId: string;
  callManagerId?: string;
}

export function RelatedCalls({ callId, callManagerId }: RelatedCallsProps) {
  const navigate = useNavigate();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    relatedCalls(callId, callManagerId)
      .then((data) => {
        if (!cancelled) {
          setResults(data.results);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [callId, callManagerId]);

  if (loading) return null;
  if (error) return null;
  if (results.length === 0) return null;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        Related Calls ({results.length})
      </h3>
      <p className="text-xs text-muted-foreground mb-3">
        Other call legs involving the same numbers within 5 minutes
      </p>
      <div className="space-y-2">
        {results.map((r) => {
          const isConnected = r.datetimeconnect != null;
          const isTransfer =
            !!r.lastredirectdn ||
            r.origcallterminationonbehalfof === 5 ||
            r.origcallterminationonbehalfof === 6;
          const isConference = (r.joinonbehalfof || 0) !== 0;

          return (
            <div
              key={r.pkid}
              onClick={() =>
                navigate(
                  `/call/${r.globalcallid_callid}?cm=${r.globalcallid_callmanagerid}`,
                )
              }
              className="flex items-center justify-between rounded-md border border-border p-3 hover:bg-accent cursor-pointer transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm font-mono">
                  <span>{r.callingpartynumber || "N/A"}</span>
                  <span className="text-muted-foreground">→</span>
                  <span>{r.finalcalledpartynumber || "N/A"}</span>
                  {isTransfer && (
                    <Badge className="text-xs bg-orange-500/15 text-orange-400 border-orange-500/25">
                      Transfer
                    </Badge>
                  )}
                  {isConference && (
                    <Badge className="text-xs bg-blue-500/15 text-blue-400 border-blue-500/25">
                      Conference
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {r.orig_device_description || r.origdevicename}
                  {" → "}
                  {r.dest_device_description || r.destdevicename}
                  {r.lastredirectdn && (
                    <span className="ml-2">
                      Redirected from: {r.lastredirectdn}
                    </span>
                  )}
                  <span className="ml-2 opacity-50">
                    Call ID: {r.globalcallid_callid}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4 shrink-0">
                <div className="text-right">
                  <div className="text-sm">
                    {formatDurationFromInterval(r.duration)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTimestamp(r.datetimeorigination)}
                  </div>
                </div>
                <Badge variant={isConnected ? "default" : "destructive"}>
                  {isConnected
                    ? "Connected"
                    : r.destcause_description || `Cause ${r.destcause_value}`}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
