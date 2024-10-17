'use client'

import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // This points to your custom tabs
import { ManagerData } from '@/types/manager'

interface ManagerDashboardProps {
  initialData: ManagerData
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function ManagerDashboard({ initialData }: ManagerDashboardProps) {
  const [timeRange, setTimeRange] = useState<string>('6m')
  const [managerData, setManagerData] = useState<ManagerData>(initialData)

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{managerData.name}</h1>
          <p className="text-muted-foreground">
            {managerData.role} - {managerData.department}
          </p>
        </div>

        {/* Select Component */}
        <Select value={timeRange} onValueChange={(value: string) => setTimeRange(value)}>
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

      {/* Tabs Component */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team-skills">Team Skills</TabsTrigger>
          <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <p>Overview content goes here.</p>
        </TabsContent>
        <TabsContent value="team-skills">
          <p>Team skills content goes here.</p>
        </TabsContent>
        <TabsContent value="evaluations">
          <p>Evaluations content goes here.</p>
        </TabsContent>
        <TabsContent value="training">
          <p>Training content goes here.</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
