import { EmployeeSkillsReport } from '@/components/Dashboard/components/Reports/EmployeeSkillsReport';
import { ReportTemplate } from '@/components/Dashboard/components/Reports/ReportTemplate';
import { useAdminReportManager } from '@/components/Dashboard/hooks/useAdminReportManager';
import { EmployeeSkillsReportData } from '@/components/Dashboard/types';
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

export function ReportManager() {
  const {
    isOpen,
    isReportReady,
    isGenerating,
    reportType,
    reportData,
    setIsOpen,
    setReportType,
    resetState,
    handleGenerateReport,
    handleDownloadReport,
  } = useAdminReportManager();

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
