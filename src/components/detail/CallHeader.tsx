import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDurationFromInterval, formatTimestamp } from "@/lib/format";
import { isStarred, starCall, unstarCall } from "@/api/client";

interface CallHeaderProps {
  cdr: any;
}

export function CallHeader({ cdr }: CallHeaderProps) {
  const navigate = useNavigate();
  const isConnected = cdr.datetimeconnect != null;
  const [starred, setStarred] = useState(false);
  const [toggling, setToggling] = useState(false);

  const callId = String(cdr.globalcallid_callid);
  const cmId = String(cdr.globalcallid_callmanagerid);

  useEffect(() => {
    isStarred(callId, cmId)
      .then((r) => setStarred(r.starred))
      .catch(() => {});
  }, [callId, cmId]);

  const toggleStar = async () => {
    setToggling(true);
    try {
      if (starred) {
        await unstarCall(callId, cmId);
        setStarred(false);
      } else {
        await starCall(callId, cmId);
        setStarred(true);
      }
    } catch {}
    setToggling(false);
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        ← Back
      </Button>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-mono font-bold">
              {cdr.callingpartynumber || "N/A"}
              <span className="text-muted-foreground mx-3">→</span>
              {cdr.finalcalledpartynumber || "N/A"}
            </h1>
            <button
              onClick={toggleStar}
              disabled={toggling}
              className="text-2xl transition-colors hover:scale-110"
              title={starred ? "Unstar call" : "Star call"}
            >
              {starred ? "★" : "☆"}
            </button>
          </div>
          {cdr.originalcalledpartynumber &&
            cdr.originalcalledpartynumber !== cdr.finalcalledpartynumber && (
              <p className="text-lg font-mono text-muted-foreground mt-1">
                Originally dialed: {cdr.originalcalledpartynumber}
              </p>
            )}
          <p className="text-muted-foreground mt-1">
            {formatTimestamp(cdr.datetimeorigination)} —{" "}
            {formatDurationFromInterval(cdr.duration)}
            <span className="ml-3 opacity-50">
              Call ID: {cdr.globalcallid_callid} • CM:{" "}
              {cdr.globalcallid_callmanagerid} • {cdr.globalcallid_clusterid}
            </span>
          </p>
        </div>
        <Badge variant={isConnected ? "default" : "destructive"}>
          {isConnected ? "Connected" : `Cause ${cdr.destcause_value}`}
        </Badge>
      </div>
    </div>
  );
}
