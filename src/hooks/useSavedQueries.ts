import { useState, useCallback } from "react";

export interface SavedQuery {
  id: string;
  name: string;
  query: string;
  createdAt: string;
}

const STORAGE_KEY = "cdr-saved-queries";

const DEFAULT_QUERIES: SavedQuery[] = [
  {
    id: "default-1",
    name: "IPS/OIO — Calls by DN",
    query: `SELECT
  datetimeorigination, callingpartynumber, originalcalledpartynumber,
  finalcalledpartynumber, duration, origdevicename, destdevicename,
  origcause, destcause, origcodec
FROM cdr_augmented
WHERE datetimeorigination BETWEEN :start_date=Mar-01-2026 AND :end_date=Mar-26-2026
  AND datetimeconnect IS NOT NULL
  AND :dn=5034185603 IN (callingpartynumber, originalcalledpartynumber, finalcalledpartynumber)
ORDER BY datetimeorigination`,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-2",
    name: "Calls for multiple DNs",
    query: `SELECT
  datetimeorigination, callingpartynumber, originalcalledpartynumber,
  finalcalledpartynumber, duration, origdevicename, destdevicename,
  origcause, destcause
FROM cdr_augmented
WHERE datetimeorigination BETWEEN 'Mar-01-2026' AND 'Mar-26-2026'
  AND datetimeconnect IS NOT NULL
  AND (
    finalcalledpartynumber IN ('5034948311', '5034949034', '5034949732')
    OR originalcalledpartynumber IN ('5034948311', '5034949034', '5034949732')
    OR callingpartynumber IN ('5034948311', '5034949034', '5034949732')
  )
ORDER BY datetimeorigination`,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-3",
    name: "Call count by DN (date range)",
    query: `WITH directory_number (dn) AS (VALUES ('5034948311'), ('5034949034'))
SELECT dn,
  COALESCE(calls, 0) AS calls,
  COALESCE(total_duration, '00:00:00'::interval) AS total_duration
FROM directory_number
LEFT JOIN (
  SELECT dn, count(*) AS calls, sum(duration) AS total_duration
  FROM (
    SELECT callingpartynumber AS dn, duration FROM cdr
    WHERE datetimeorigination BETWEEN 'Mar-01-2026' AND 'Mar-26-2026'
      AND callingpartynumber IN (SELECT dn FROM directory_number)
      AND duration > '00:00:00'::interval
    UNION ALL
    SELECT finalcalledpartynumber AS dn, duration FROM cdr
    WHERE datetimeorigination BETWEEN 'Mar-01-2026' AND 'Mar-26-2026'
      AND finalcalledpartynumber IN (SELECT dn FROM directory_number)
      AND duration > '00:00:00'::interval
  ) AS detail
  GROUP BY dn
) AS activity USING (dn)
ORDER BY dn`,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-4",
    name: "Calls by hour (last 24h)",
    query: `SELECT date_trunc('hour', datetimeorigination) AS hour, count(*)
FROM cdr_basic
WHERE datetimeorigination > now() - interval '24 hours'
GROUP BY hour
ORDER BY hour`,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-5",
    name: "Failed calls today",
    query: `SELECT
  datetimeorigination, callingpartynumber, finalcalledpartynumber,
  duration, origdevicename, destdevicename, origcause, destcause
FROM cdr_augmented
WHERE destcause != 'Normal call clearing'
  AND datetimeorigination > now() - interval '24 hours'
ORDER BY datetimeorigination DESC`,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-6",
    name: "Who disconnected?",
    query: `SELECT
  datetimeorigination, callingpartynumber, finalcalledpartynumber,
  duration, origdevicename, destdevicename,
  origcallterminationonbehalfof_text, destcallterminationonbehalfof_text,
  origcause, destcause
FROM cdr_augmented
WHERE callingpartynumber = '5034944251'
  AND datetimeorigination BETWEEN 'Mar-01-2026' AND 'Mar-26-2026'
ORDER BY datetimeorigination`,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-7",
    name: "Uncompleted calls (last 10d)",
    query: `SELECT
  date_trunc('hour', datetimeorigination) AS interval,
  count(*),
  repeat('■', (count(*)::float / 10)::int) AS bar
FROM cdr_augmented
WHERE datetimeorigination > current_date - 10
  AND duration = '00:00:00'
  AND origdevicename NOT LIKE 'RightFax-Prod-%'
GROUP BY date_trunc('hour', datetimeorigination)
ORDER BY interval`,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-8",
    name: "Device call stats (CMR)",
    query: `SELECT *
FROM cmr_augmented
WHERE 'SEP00D6FE056ADB' IN (localdevicename, remotedevicename)
  AND datetimestamp > current_date - 10
ORDER BY datetimestamp DESC`,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-9",
    name: "Top callers today",
    query: `SELECT COALESCE(NULLIF(callingpartynumber, ''), 'Unknown') AS callingpartynumber, count(*) AS calls
FROM cdr_basic
WHERE datetimeorigination > now() - interval '24 hours'
GROUP BY callingpartynumber
ORDER BY calls DESC
LIMIT 20`,
    createdAt: new Date().toISOString(),
  },
];

function loadQueries(): SavedQuery[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_QUERIES));
  return DEFAULT_QUERIES;
}

export function useSavedQueries() {
  const [queries, setQueries] = useState<SavedQuery[]>(loadQueries);

  const save = useCallback((name: string, query: string) => {
    const newQuery: SavedQuery = {
      id: crypto.randomUUID(),
      name,
      query,
      createdAt: new Date().toISOString(),
    };
    setQueries((prev) => {
      const updated = [newQuery, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setQueries((prev) => {
      const updated = prev.filter((q) => q.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const rename = useCallback((id: string, newName: string) => {
    setQueries((prev) => {
      const updated = prev.map((q) =>
        q.id === id ? { ...q, name: newName } : q,
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setQueries(DEFAULT_QUERIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_QUERIES));
  }, []);

  return { queries, save, remove, rename, reset };
}
