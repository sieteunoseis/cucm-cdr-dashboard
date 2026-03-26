import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { collectLogs } from "@/api/client";

interface CollectLogsProps {
  callId: string;
  callManagerId?: string;
  sdlTraceCommand: string | null;
}

export function CollectLogs({
  callId,
  callManagerId,
  sdlTraceCommand,
}: CollectLogsProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCollect = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await collectLogs(callId, callManagerId);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyCommand = () => {
    if (sdlTraceCommand) {
      navigator.clipboard.writeText(sdlTraceCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-2">Collect Logs</h3>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button onClick={handleCollect} disabled={loading}>
            {loading ? "Collecting..." : "Collect SDL/SDI Traces"}
          </Button>
          {sdlTraceCommand && (
            <Button variant="outline" size="sm" onClick={copyCommand}>
              {copied ? "Copied!" : "Copy CLI Command"}
            </Button>
          )}
        </div>

        {sdlTraceCommand && (
          <code className="block rounded bg-muted px-3 py-2 text-sm font-mono break-all">
            {sdlTraceCommand}
          </code>
        )}

        {error && (
          <div className="rounded bg-destructive/10 p-3 text-destructive text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Found {result.count} files from {result.host} ({result.cluster})
            </p>
            {result.files.map((f: any, i: number) => (
              <div
                key={i}
                className="rounded bg-muted px-3 py-2 text-sm font-mono"
              >
                {f.name} — {f.size} bytes ({f.server})
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
