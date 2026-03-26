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
          <Input
            placeholder="Filter fields..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="mb-3"
          />
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <tbody>
                {entries.map(([key, val]) => (
                  <tr key={key} className="border-b border-border">
                    <td className="py-1 pr-4 font-mono text-muted-foreground whitespace-nowrap">
                      {key}
                    </td>
                    <td className="py-1 font-mono break-all">{String(val)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
