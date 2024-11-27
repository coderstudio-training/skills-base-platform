import { ReportData } from '@/components/ReportGenerator';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ReportTemplateProps {
  data: ReportData;
}

export function ReportTemplate({ data }: ReportTemplateProps) {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold">{data.title}</CardTitle>
            <CardDescription>{data.description}</CardDescription>
          </div>
          <Badge variant="outline">{data.date}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {data.summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.summary.map((item, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardDescription>{item.label}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {data.details && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.details.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.label}</TableCell>
                    <TableCell>{item.value}</TableCell>
                    <TableCell>
                      {item.change !== undefined && (
                        <span className={item.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {item.change >= 0 ? '+' : ''}
                          {item.change}%
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        This report was generated automatically. For any questions, please contact the admin team.
      </CardFooter>
    </Card>
  );
}
