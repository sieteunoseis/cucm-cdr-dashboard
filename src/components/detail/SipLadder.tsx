import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sipLadder } from "@/api/client";

interface SipLadderProps {
  callId: string;
  callManagerId?: string;
}

interface SipMessage {
  timestamp: string;
  direction: "incoming" | "outgoing";
  type: "request" | "response";
  method: string | null;
  statusCode: number | null;
  reasonPhrase: string | null;
  summary: string;
  callId: string;
  fromNumber: string | null;
  toNumber: string | null;
  from: string | null;
  to: string | null;
  cseq: string | null;
  remoteIp: string;
  remotePort: number;
  raw: string;
}

function methodColor(method: string): string {
  switch (method) {
    case "INVITE":
      return "bg-green-500/15 text-green-400 border-green-500/25";
    case "BYE":
      return "bg-red-500/15 text-red-400 border-red-500/25";
    case "CANCEL":
      return "bg-orange-500/15 text-orange-400 border-orange-500/25";
    case "ACK":
      return "bg-blue-500/15 text-blue-400 border-blue-500/25";
    case "REFER":
      return "bg-purple-500/15 text-purple-400 border-purple-500/25";
    case "UPDATE":
      return "bg-yellow-500/15 text-yellow-400 border-yellow-500/25";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function statusColor(code: number): string {
  if (code >= 100 && code < 200) return "text-blue-400";
  if (code >= 200 && code < 300) return "text-green-400";
  if (code >= 300 && code < 400) return "text-yellow-400";
  if (code >= 400) return "text-red-400";
  return "text-muted-foreground";
}

function formatTime(ts: string): string {
  const match = ts.match(/(\d{2}:\d{2}:\d{2}\.\d{3})/);
  return match ? match[1] : ts;
}

export function SipLadder({ callId, callManagerId }: SipLadderProps) {
  const [messages, setMessages] = useState<SipMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [fetched, setFetched] = useState(false);
  const [meta, setMeta] = useState<{
    count: number;
    files_searched: number;
  } | null>(null);

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sipLadder(callId, callManagerId);
      setMessages(data.messages);
      setMeta({ count: data.count, files_searched: data.files_searched });
      setFetched(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter out REGISTER messages — they're noise
  const filtered = messages.filter(
    (m) => m.method !== "REGISTER" && !(m.cseq && m.cseq.includes("REGISTER")),
  );

  // Get unique endpoints (IPs) for the ladder columns
  const endpoints = [...new Set(filtered.map((m) => m.remoteIp))];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">SIP Ladder</h3>
        {!fetched && (
          <Button onClick={handleFetch} disabled={loading}>
            {loading ? "Fetching traces..." : "Load SIP Trace"}
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded bg-destructive/10 p-3 text-destructive text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          Downloading and parsing SDL traces...
        </div>
      )}

      {fetched && filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No SIP messages found for this call in {meta?.files_searched} trace
          files.
        </p>
      )}

      {filtered.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground mb-3">
            {filtered.length} SIP messages from {meta?.files_searched} trace
            files
            {endpoints.length > 0 && ` • ${endpoints.length} endpoints`}
          </p>

          {filtered.map((msg, i) => {
            const isExpanded = expanded === i;
            const arrow = msg.direction === "incoming" ? "←" : "→";

            return (
              <div key={i}>
                <div
                  onClick={() => setExpanded(isExpanded ? null : i)}
                  className="flex items-center gap-3 rounded px-3 py-1.5 hover:bg-accent cursor-pointer transition-colors font-mono text-xs"
                >
                  <span className="text-muted-foreground w-24 shrink-0">
                    {formatTime(msg.timestamp)}
                  </span>

                  <span className="w-6 text-center text-muted-foreground">
                    {arrow}
                  </span>

                  <span className="w-28 shrink-0 text-muted-foreground">
                    {msg.remoteIp}
                  </span>

                  {msg.type === "request" ? (
                    <Badge className={`text-xs ${methodColor(msg.method!)}`}>
                      {msg.method}
                    </Badge>
                  ) : (
                    <span
                      className={`font-medium ${statusColor(msg.statusCode!)}`}
                    >
                      {msg.summary}
                    </span>
                  )}

                  <span className="text-muted-foreground ml-auto truncate">
                    {msg.fromNumber && msg.toNumber
                      ? `${msg.fromNumber} → ${msg.toNumber}`
                      : msg.cseq || ""}
                  </span>
                </div>

                {isExpanded && (
                  <pre className="mx-3 my-1 p-3 rounded bg-muted text-xs overflow-x-auto max-h-96 whitespace-pre-wrap">
                    {msg.raw}
                  </pre>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
