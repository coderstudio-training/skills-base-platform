import { EmployeeSkillsReport, EmployeeSkillsReportData } from '@/components/EmployeeSkillsReport';
import { ReportTemplate } from '@/components/ReportTemplate';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export interface Skill {
  name: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
}

export interface Employee {
  name: string;
  department: string;
  skills: Skill[];
}

export interface ReportData {
  title: string;
  description: string;
  date: string;
  summary?: {
    label: string;
    value: string | number;
  }[];
  details?: {
    label: string;
    value: string | number;
    change?: number;
  }[];
  employees?: Employee[];
}

export function ReportGenerator() {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReportReady, setIsReportReady] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [reportType, setReportType] = useState<string>('');

  const handleGenerateReport = () => {
    setIsGenerating(true);
    // Simulate report generation process
    setTimeout(() => {
      setIsGenerating(false);
      setIsReportReady(true);

      if (reportType === 'employee-skills') {
        setReportData({
          title: 'Employee Skills Report',
          description: 'Comprehensive analysis of employee skills and gaps',
          date: 'June 1, 2023',
          employees: [
            {
              name: 'John Doe',
              department: 'Engineering',
              skills: [
                { name: 'JavaScript', currentLevel: 4, requiredLevel: 5, gap: 1 },
                { name: 'React', currentLevel: 3, requiredLevel: 4, gap: 1 },
              ],
            },
            {
              name: 'Jane Smith',
              department: 'Data Science',
              skills: [
                { name: 'Python', currentLevel: 5, requiredLevel: 4, gap: -1 },
                { name: 'Machine Learning', currentLevel: 4, requiredLevel: 5, gap: 1 },
              ],
            },
          ],
        });
      } else {
        setReportData({
          title: 'Skills Overview Report',
          description: 'A comprehensive overview of skills across all departments',
          date: 'June 1, 2023',
          summary: [
            { label: 'Total Skills', value: 50 },
            { label: 'Average Skill Level', value: 3.7 },
            { label: 'Skills Gap', value: '12%' },
          ],
          details: [
            { label: 'JavaScript', value: 4.2, change: 5 },
            { label: 'Python', value: 3.8, change: 2 },
            { label: 'React', value: 4.0, change: 8 },
            { label: 'Data Science', value: 3.5, change: -2 },
            { label: 'Machine Learning', value: 3.2, change: 10 },
          ],
        });
      }
    }, 3000);
  };

  const handleDownloadReport = () => {
    // In a real application, you would generate a PDF or other format here
    // For this example, we'll just alert that the report is downloaded
    alert('Report downloaded successfully!');
  };

  const resetState = () => {
    setIsGenerating(false);
    setIsReportReady(false);
    setReportData(null);
    setReportType('');
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        setIsOpen(open);
        if (!open) resetState();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          Generate Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Report</DialogTitle>
          <DialogDescription>
            Select the parameters for your report. Click generate when you&apos;re ready.
          </DialogDescription>
        </DialogHeader>
        {!isReportReady ? (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="report-type" className="text-right">
                Type
              </Label>
              <Select onValueChange={value => setReportType(value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="skills">Skills Overview</SelectItem>
                  <SelectItem value="employee-skills">Employee Skills and Gaps</SelectItem>
                  <SelectItem value="departments">Department Analysis</SelectItem>
                  <SelectItem value="employees">Employee Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date-range" className="text-right">
                Date Range
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-week">Last Week</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="last-quarter">Last Quarter</SelectItem>
                  <SelectItem value="last-year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="format" className="text-right">
                Format
              </Label>
              <Select defaultValue="pdf">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <p>Your report is ready. You can now download it.</p>
          </div>
        )}
        <DialogFooter>
          {!isReportReady ? (
            <Button onClick={handleGenerateReport} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Report'
              )}
            </Button>
          ) : (
            <Button onClick={handleDownloadReport}>Download Report</Button>
          )}
        </DialogFooter>
      </DialogContent>
      {isReportReady && reportData && (
        <DialogContent className="sm:max-w-[800px]">
          {reportType === 'employee-skills' ? (
            <EmployeeSkillsReport data={reportData as EmployeeSkillsReportData} />
          ) : (
            <ReportTemplate data={reportData} />
          )}
        </DialogContent>
      )}
    </Dialog>
  );
}
