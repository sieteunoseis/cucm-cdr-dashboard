import { Card } from "@/components/ui/card";
import { mosToGrade, gradeColor } from "@/lib/quality";

interface QualityCardProps {
  cmr: any[];
}

export function QualityCard({ cmr }: QualityCardProps) {
  if (cmr.length === 0) return null;
  const withMos = cmr.find((c) => c.moslqk != null) || cmr[0];
  const grade = mosToGrade(withMos.moslqk);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Quality</h3>
      <div className="grid grid-cols-4 gap-6">
        <div className="text-center">
          <p className={`text-4xl font-bold ${gradeColor(grade)}`}>
            {withMos.moslqk != null ? Number(withMos.moslqk).toFixed(1) : "N/A"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">MOS Score</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold">{withMos.jitter ?? "N/A"}</p>
          <p className="text-xs text-muted-foreground mt-1">Jitter (ms)</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold">{withMos.latency ?? "N/A"}</p>
          <p className="text-xs text-muted-foreground mt-1">Latency (ms)</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold">
            {withMos.numberpacketslost ?? "N/A"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Packets Lost</p>
        </div>
      </div>
    </Card>
  );
}
