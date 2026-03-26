import { Card } from "@/components/ui/card";

interface EnrichmentCardProps {
  cdr: any;
}

function DeviceInfo({
  label,
  name,
  description,
  pool,
  location,
  user,
}: {
  label: string;
  name: string;
  description: string | null;
  pool: string | null;
  location: string | null;
  user: string | null;
}) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </h4>
      <div className="space-y-1">
        <p className="font-mono text-sm">{name}</p>
        {description && <p className="text-sm">{description}</p>}
        {pool && (
          <p className="text-xs text-muted-foreground">
            Pool: {pool}
            {location && ` • Location: ${location}`}
          </p>
        )}
        {user && <p className="text-xs text-muted-foreground">User: {user}</p>}
        {!description && !pool && !user && (
          <p className="text-xs text-muted-foreground italic">Not enriched</p>
        )}
      </div>
    </div>
  );
}

export function EnrichmentCard({ cdr }: EnrichmentCardProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Devices</h3>
      <div className="grid grid-cols-2 gap-8">
        <DeviceInfo
          label="Originating"
          name={cdr.origdevicename}
          description={cdr.orig_device_description}
          pool={cdr.orig_device_pool}
          location={cdr.orig_device_location}
          user={cdr.orig_device_user}
        />
        <DeviceInfo
          label="Destination"
          name={cdr.destdevicename}
          description={cdr.dest_device_description}
          pool={cdr.dest_device_pool}
          location={cdr.dest_device_location}
          user={cdr.dest_device_user}
        />
      </div>
    </Card>
  );
}
