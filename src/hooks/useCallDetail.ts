import { useState, useEffect } from "react";
import { traceCdr } from "@/api/client";

interface CallDetailState {
  cdr: any[];
  cmr: any[];
  sdlTraceCommand: string | null;
  loading: boolean;
  error: string | null;
}

export function useCallDetail(callId: string, callManagerId?: string) {
  const [state, setState] = useState<CallDetailState>({
    cdr: [],
    cmr: [],
    sdlTraceCommand: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    traceCdr(callId, callManagerId)
      .then((data) => {
        if (!cancelled) {
          setState({
            cdr: data.cdr,
            cmr: data.cmr,
            sdlTraceCommand: data.sdl_trace_command,
            loading: false,
            error: null,
          });
        }
      })
      .catch((err) => {
        if (!cancelled)
          setState((s) => ({ ...s, loading: false, error: err.message }));
      });
    return () => {
      cancelled = true;
    };
  }, [callId, callManagerId]);

  return state;
}
