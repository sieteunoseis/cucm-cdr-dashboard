import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDeviceInfo, getPhoneWebPage } from "@/api/client";

interface DeviceCardProps {
  origDevice: string;
  destDevice: string;
}

interface DeviceInfo {
  found: boolean;
  deviceName: string;
  ip: string | null;
  status: string;
  statusReasonText: string;
  model: string;
  protocol: string;
  activeLoadId: string;
  dirNumber: string;
  description: string;
  webCapable: boolean;
  webPages: Record<string, string> | null;
}

function statusBadge(status: string) {
  if (status === "Registered")
    return (
      <Badge className="bg-green-500/15 text-green-400 border-green-500/25">
        Registered
      </Badge>
    );
  if (status === "UnRegistered")
    return <Badge variant="destructive">Unregistered</Badge>;
  return (
    <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/25">
      {status}
    </Badge>
  );
}

function DevicePanel({ deviceName }: { deviceName: string }) {
  const [info, setInfo] = useState<DeviceInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [webPage, setWebPage] = useState<{
    page: string;
    html: string;
  } | null>(null);
  const [webLoading, setWebLoading] = useState(false);

  // Skip non-phone devices (trunks, CTI ports, etc.)
  const isPhone = /^SEP/i.test(deviceName);

  const handleLookup = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDeviceInfo(deviceName);
      setInfo(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWebPage = async (page: string) => {
    setWebLoading(true);
    try {
      const data = await getPhoneWebPage(deviceName, page);
      setWebPage({ page, html: data.html });
    } catch (err: any) {
      setWebPage({ page, html: `Error: ${err.message}` });
    } finally {
      setWebLoading(false);
    }
  };

  if (!isPhone) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-sm font-medium">{deviceName}</p>
        </div>
        {!info && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleLookup}
            disabled={loading}
          >
            {loading ? "Querying..." : "Lookup"}
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {info && !info.found && (
        <p className="text-sm text-muted-foreground">
          Not found in RISPort — device may be offline
        </p>
      )}

      {info?.found && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              {statusBadge(info.status)}
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IP</span>
              <span className="font-mono">{info.ip || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Protocol</span>
              <span>{info.protocol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Firmware</span>
              <span className="font-mono text-xs">
                {info.activeLoadId || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">DN</span>
              <span className="font-mono">{info.dirNumber || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Description</span>
              <span className="truncate ml-2">{info.description || "N/A"}</span>
            </div>
          </div>

          {info.webCapable && info.ip && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">
                  Phone Web:
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs"
                  onClick={() => handleWebPage("network")}
                  disabled={webLoading}
                >
                  Network/CDP
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs"
                  onClick={() => handleWebPage("console")}
                  disabled={webLoading}
                >
                  Console Log
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs"
                  onClick={() => handleWebPage("status")}
                  disabled={webLoading}
                >
                  Status
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs"
                  onClick={() => handleWebPage("config")}
                  disabled={webLoading}
                >
                  Config
                </Button>
                <a
                  href={`http://${info.ip}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground underline ml-auto"
                >
                  Open phone web UI
                </a>
              </div>

              {webLoading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-3 w-3 animate-spin rounded-full border border-muted-foreground border-t-transparent" />
                  Loading...
                </div>
              )}

              {webPage && (
                <div className="rounded border border-border overflow-auto max-h-80">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-muted text-xs text-muted-foreground border-b border-border">
                    <span>{webPage.page}</span>
                    <button
                      onClick={() => setWebPage(null)}
                      className="hover:text-foreground"
                    >
                      Close
                    </button>
                  </div>
                  <iframe
                    srcDoc={webPage.html}
                    className="w-full h-64 bg-white"
                    sandbox=""
                    title={`${deviceName} ${webPage.page}`}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function DeviceCard({ origDevice, destDevice }: DeviceCardProps) {
  const hasOrig = /^SEP/i.test(origDevice);
  const hasDest = /^SEP/i.test(destDevice);

  if (!hasOrig && !hasDest) return null;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Device Diagnostics</h3>
      <div className="space-y-6">
        {hasOrig && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              Originating
            </p>
            <DevicePanel deviceName={origDevice} />
          </div>
        )}
        {hasDest && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              Destination
            </p>
            <DevicePanel deviceName={destDevice} />
          </div>
        )}
      </div>
    </Card>
  );
}
