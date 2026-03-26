import { useParams } from "react-router-dom";

export function CallDetailPage() {
  const { callId } = useParams();
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Call Detail</h2>
      <p className="text-muted-foreground">Call ID: {callId}</p>
    </div>
  );
}
