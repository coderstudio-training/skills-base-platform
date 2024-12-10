'use client';

import { PROFICIENCY_LEVELS } from '@/blocks/Dashboard/constants';
import { TSCProficiency } from '@/blocks/Dashboard/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ProficiencyTable({ proficiencies }: { proficiencies: TSCProficiency[] }) {
  return (
    <div className="space-y-8">
      <Table>
        <TableHeader>
          <TableRow>
            {PROFICIENCY_LEVELS.map(level => (
              <TableHead key={level} className="text-center">
                Level {level}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            {PROFICIENCY_LEVELS.map(level => {
              const prof = proficiencies.find(p => p.level === level);
              return (
                <TableCell key={level} className="align-top">
                  {prof && (
                    <div className="space-y-2">
                      <div className="font-medium">{prof.code}</div>
                      <div>{prof.description}</div>
                    </div>
                  )}
                </TableCell>
              );
            })}
          </TableRow>
        </TableBody>
      </Table>

      <div>
        <h4 className="font-semibold mb-2">Knowledge</h4>
        <Table>
          <TableHeader>
            <TableRow>
              {PROFICIENCY_LEVELS.map(level => (
                <TableHead key={level} className="text-center">
                  Level {level}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              {PROFICIENCY_LEVELS.map(level => {
                const prof = proficiencies.find(p => p.level === level);
                return (
                  <TableCell key={level} className="align-top">
                    {prof?.knowledge && (
                      <ul className="list-disc pl-5 space-y-1">
                        {prof.knowledge.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Abilities</h4>
        <Table>
          <TableHeader>
            <TableRow>
              {PROFICIENCY_LEVELS.map(level => (
                <TableHead key={level} className="text-center">
                  Level {level}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              {PROFICIENCY_LEVELS.map(level => {
                const prof = proficiencies.find(p => p.level === level);
                return (
                  <TableCell key={level} className="align-top">
                    {prof?.abilities && (
                      <ul className="list-disc pl-5 space-y-1">
                        {prof.abilities.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
