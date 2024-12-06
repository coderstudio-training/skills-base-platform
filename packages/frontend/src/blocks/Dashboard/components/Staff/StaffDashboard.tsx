'use client';

import { UserHeader } from '@/blocks/Dashboard/components/Header/UserHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useSkillsData } from '../../hooks/useSkills';
import Overview from './Overview';
// import StaffSkillsView from './SkillsView';

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: session, status } = useSession();
  const email = session?.user?.email;

  // Get skills data only if we have an email
  const { data: skillsData, error, isLoading } = useSkillsData(email);

  // Handle session loading first
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Check authentication after session loads
  if (status === 'unauthenticated' || !email) {
    return <div>Please log in to view your dashboard</div>;
  }

  // Handle skills data loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div>Error loading dashboard: {error.message}</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-[80%]">
      <UserHeader />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills Details</TabsTrigger>
          <TabsTrigger value="growth-plan">Growth Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Overview skillsData={skillsData} />
        </TabsContent>

        {/* <TabsContent value="skills" className="mt-6">
          <StaffSkillsView />
        </TabsContent> */}

        <TabsContent value="growth-plan">{/* Growth Plan content will go here */}</TabsContent>
      </Tabs>
    </div>
  );
}
