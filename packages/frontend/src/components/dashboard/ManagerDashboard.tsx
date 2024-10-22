'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Progress } from "@/components/ui/progress"
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Upload, Download, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// import { ManagerData } from '@/types/manager'
// import { dummyManagerData } from '@/lib/dummyData'

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function ManagerDashboard() {
  const { data: session } = useSession();
  const [timeRange, setTimeRange] = useState<string>('6m');
  //   const [managerData, setManagerData] = useState<ManagerData>(dummyManagerData)

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const handleExportReport = async () => {
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert('Report exported successfully!');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manager Dashboard</h1>
          <p className="text-muted-foreground">Skills Base Platform Overview</p>
        </div>
        <div className="flex items-center space-x-4">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={session?.user?.image || ''}
              alt={session?.user?.name || ''}
            />
            <AvatarFallback>{session?.user?.name?.[0] || 'M'}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{session?.user?.name}</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Import Data
          </Button>
          <Button onClick={handleExportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
        <Select
          value={timeRange}
          onValueChange={(value: string) => setTimeRange(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">Last Month</SelectItem>
            <SelectItem value="3m">Last 3 Months</SelectItem>
            <SelectItem value="6m">Last 6 Months</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team-skills">Team Skills</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="development">Development</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">{/* Overview content */}</TabsContent>

        <TabsContent value="team-skills">
          {/* Team Skills content */}
        </TabsContent>

        <TabsContent value="performance">
          {/* Performance content */}
        </TabsContent>

        <TabsContent value="development">
          {/* Development content */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
