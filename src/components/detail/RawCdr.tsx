import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";

interface RawCdrProps {
  cdr: any;
}

export function RawCdr({ cdr }: RawCdrProps) {
  const [filter, setFilter] = useState("");
  const [view, setView] = useState<"table" | "json">("table");
  const entries = Object.entries(cdr).filter(
    ([key, val]) =>
      val != null &&
      val !== "" &&
      key.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <Accordion>
      <AccordionItem value="raw">
        <AccordionTrigger>
          Raw CDR ({Object.keys(cdr).length} fields)
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex items-center gap-2 mb-3">
            <Input
              placeholder="Filter fields..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1"
            />
            <div className="flex rounded border border-border text-xs">
              <button
                onClick={() => setView("table")}
                className={`px-3 py-1.5 rounded-l transition-colors ${view === "table" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Table
              </button>
              <button
                onClick={() => setView("json")}
                className={`px-3 py-1.5 rounded-r transition-colors ${view === "json" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                JSON
              </button>
            </div>
          </div>

          {view === "table" ? (
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <tbody>
                  {entries.map(([key, val]) => (
                    <tr key={key} className="border-b border-border">
                      <td className="py-1 pr-4 font-mono text-muted-foreground whitespace-nowrap">
                        {key}
                      </td>
                      <td className="py-1 font-mono break-all">
                        {typeof val === "object"
                          ? JSON.stringify(val)
                          : String(val)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <pre className="max-h-96 overflow-auto rounded bg-muted p-4 text-xs font-mono whitespace-pre-wrap">
              {JSON.stringify(Object.fromEntries(entries), null, 2)}
            </pre>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
