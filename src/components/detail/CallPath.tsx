import { Card } from "@/components/ui/card";

interface CallPathProps {
  legs: any[];
}

export function CallPath({ legs }: CallPathProps) {
  if (legs.length === 0) return null;
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Call Path</h3>
      <div className="space-y-0">
        {legs.map((leg, i) => (
          <div key={leg.pkid || i} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className="h-3 w-3 rounded-full bg-primary" />
              {i < legs.length - 1 && <div className="w-0.5 h-12 bg-border" />}
            </div>
            <div className="pb-6">
              <p className="font-mono text-sm">
                {leg.origdevicename} → {leg.destdevicename}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Cause: {leg.destcause_description || leg.destcause_value}
                {leg.currentroutingreason_text &&
                  ` • Routing: ${leg.currentroutingreason_text}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
