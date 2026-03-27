import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { collectLogs } from "@/api/client";

function CopyBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group">
      <code className="block rounded bg-muted px-3 py-2 text-sm font-mono break-all pr-16">
        {text}
      </code>
      <button
        onClick={() => {
          navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="absolute top-1.5 right-1.5 text-xs text-muted-foreground hover:text-foreground bg-muted-foreground/10 rounded px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function DimeGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-border pt-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground w-full text-left hover:text-foreground transition-colors"
      >
        <span
          className={`text-xs transition-transform ${open ? "rotate-90" : ""}`}
        >
          ▶
        </span>
        cisco-dime CLI — Install &amp; Usage
      </button>
      {open && (
        <div className="mt-3 space-y-3 text-sm">
          <div className="space-y-1.5">
            <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
              Install
            </h4>
            <CopyBlock text="npm install -g cisco-dime" />
          </div>
          <div className="space-y-1.5">
            <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
              Configure
            </h4>
            <CopyBlock text="cisco-dime config add prod --host <cucm-pub> --username <user> --password <pass> --insecure" />
          </div>
          <div className="space-y-1.5">
            <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
              SIP traces (last 30 min)
            </h4>
            <CopyBlock text="cisco-dime select sip-traces --last 30m --download --decompress --all-nodes --insecure" />
          </div>
          <div className="space-y-1.5">
            <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
              By date range
            </h4>
            <CopyBlock
              text={
                'cisco-dime select "Cisco CallManager" --from "2026-03-27T00:00:00Z" --to "2026-03-27T01:00:00Z" --download --decompress --all-nodes --insecure'
              }
            />
          </div>
          <div className="space-y-1.5">
            <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
              Presets
            </h4>
            <div className="rounded bg-muted px-3 py-2 font-mono text-xs space-y-1">
              <div>
                <span className="text-muted-foreground w-24 inline-block">
                  sip-traces
                </span>{" "}
                Cisco CallManager, CTIManager
              </div>
              <div>
                <span className="text-muted-foreground w-24 inline-block">
                  cti-traces
                </span>{" "}
                Cisco CTIManager
              </div>
              <div>
                <span className="text-muted-foreground w-24 inline-block">
                  curri-logs
                </span>{" "}
                Cisco Extended Functions
              </div>
              <div>
                <span className="text-muted-foreground w-24 inline-block">
                  syslog
                </span>{" "}
                messages, CiscoSyslog
              </div>
              <div>
                <span className="text-muted-foreground w-24 inline-block">
                  tomcat
                </span>{" "}
                Tomcat, Tomcat Security
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
            {loading ? "Listing..." : "List SDL/SDI Traces on Server"}
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

        <DimeGuide />
      </div>
    </Card>
  );
}
