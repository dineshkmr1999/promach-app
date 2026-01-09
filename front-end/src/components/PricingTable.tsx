import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PricingRow {
  units: string;
  oneTime?: string;
  triYearly?: string;
  quarterly?: string;
  price?: string;
}

interface PricingTableProps {
  title: string;
  description?: string;
  headers: string[];
  data: PricingRow[];
  scopeOfJob?: string[];
  duration?: string;
}

const PricingTable = ({ title, description, headers, data, scopeOfJob, duration }: PricingTableProps) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        {description && <CardDescription className="text-base">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header, index) => (
                  <TableHead key={index} className="font-semibold">{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row.units}</TableCell>
                  {row.oneTime && <TableCell>{row.oneTime}</TableCell>}
                  {row.triYearly && <TableCell>{row.triYearly}</TableCell>}
                  {row.quarterly && <TableCell>{row.quarterly}</TableCell>}
                  {row.price && <TableCell>{row.price}</TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {scopeOfJob && (
          <div className="mt-6">
            <h4 className="font-semibold mb-3">Scope of Job:</h4>
            <ul className="space-y-2">
              {scopeOfJob.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-primary">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {duration && (
          <div className="mt-4 text-sm text-muted-foreground">
            <strong>Duration:</strong> {duration}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PricingTable;
