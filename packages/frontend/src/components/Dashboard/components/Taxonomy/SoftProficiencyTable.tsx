import { SoftSkillProficiency } from '@/components/Dashboard/types'; // Adjust the import path
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function SoftProficiencyTable({
  proficiencies,
}: {
  proficiencies: SoftSkillProficiency[];
}) {
  return (
    <div className="space-y-8">
      {/* Proficiency Description */}
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              {proficiencies.map((_, index) => (
                <TableHead key={index} className="text-center">
                  Level {index + 1}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              {proficiencies.map((prof, index) => (
                <TableCell key={index} className="align-top">
                  {prof.description && (
                    <ul className="list-disc pl-5 space-y-1">
                      {prof.description.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Benchmark */}
      <div>
        <h4 className="font-semibold mb-2">Benchmarks</h4>
        <Table>
          <TableHeader>
            <TableRow>
              {proficiencies.map((_, index) => (
                <TableHead key={index} className="text-center">
                  Level {index + 1}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              {proficiencies.map((prof, index) => (
                <TableCell key={index} className="align-top">
                  {prof.benchmark && (
                    <ul className="list-disc pl-5 space-y-1">
                      {prof.benchmark.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
