// app/dashboard/manager/page.tsx
'use client';

import ManagerTrainingView from '@/components/dashboard/ManagerTrainingView';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Upload } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

export default function ManagerDashboard() {
  const { data: session } = useSession();
  const [timeRange, setTimeRange] = useState('6m');

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Manager Dashboard</h1>
            <p className="text-muted-foreground">Skills Base Platform Overview</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">{session?.user?.name}</span>
            <Button variant="outline" onClick={() => signOut()}>
              Logout
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            <Button variant="default" size="sm" className="bg-[#0F172A] text-white">
              <Upload className="mr-2 h-4 w-4" />
              Import Data
            </Button>
            <Button variant="default" size="sm" className="bg-[#0F172A] text-white">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Last 6 Months" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full flex border-b">
              <TabsTrigger
                value="overview"
                className="flex-1 border-b-2 border-transparent data-[state=active]:border-black px-6 py-3"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="team-skills"
                className="flex-1 border-b-2 border-transparent data-[state=active]:border-black px-6 py-3"
              >
                Team Skills
              </TabsTrigger>
              <TabsTrigger
                value="performance"
                className="flex-1 border-b-2 border-transparent data-[state=active]:border-black px-6 py-3"
              >
                Performance
              </TabsTrigger>
              <TabsTrigger
                value="training"
                className="flex-1 border-b-2 border-transparent data-[state=active]:border-black px-6 py-3"
              >
                Training
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="overview">{/* Overview content */}</TabsContent>

              <TabsContent value="team-skills">{/* Team Skills content */}</TabsContent>

              <TabsContent value="performance">{/* Performance content */}</TabsContent>

              <TabsContent value="training">
                <ManagerTrainingView />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
