'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { skillsApi } from './client';
import { Taxonomy } from './domain-types';
import { useAuth, useQuery } from './hooks';

export default function ShowcaseDashboard() {
  const { hasPermission, user } = useAuth();
  const [canViewDashboard, setCanViewDashboard] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      const canView = await hasPermission('canViewDashboard');
      setCanViewDashboard(canView);
    };
    checkPermission();
  });

  const {
    data: taxonomy_data,
    error,
    isLoading,
  } = useQuery<Taxonomy>(
    skillsApi,
    '/taxonomy/1yMsFZfwyumL4W7Erc0hr1IfM8_DsErcdri0TBEJRjq0?businessUnit=QA',
    {
      requiresAuth: true,
    },
  );

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  if (!canViewDashboard) {
    return <div>Cannot view taxonomy dashboard!</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Showcase</h1>
          <p className="text-muted-foreground">Skills Base Platform Taxonomy</p>
        </div>
        <div className="flex items-center space-x-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
            <AvatarFallback>{user?.name?.[0] || 'M'}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{user?.name}</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div>
        <Tabs defaultValue="taxonomy">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="taxonomy">Taxonomy</TabsTrigger>
          </TabsList>
          <TabsContent value="taxonomy">
            <Card>
              <CardHeader>
                <CardTitle>Taxonomy</CardTitle>
                <CardDescription>List of technical skills and descriptions</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  {isLoading ? (
                    <li>Loading...</li>
                  ) : error ? (
                    <li>Error: {error.message}</li>
                  ) : (
                    <li key={taxonomy_data?.docId} className="border-b pb-4">
                      <h3 className="text-lg font-semibold">{taxonomy_data?.title}</h3>
                      <p className="text-sm text-gray-600">{taxonomy_data?.description}</p>
                      <p className="text-sm font-semibold mt-2">
                        Category: {taxonomy_data?.category}
                      </p>
                      <div className="mt-2">
                        <h4 className="font-semibold">Proficiency Description:</h4>
                        <ul className="pl-4 list-disc">
                          {Object.entries(taxonomy_data?.proficiencyDescription || {}).map(
                            ([key, value]) => (
                              <li key={key}>
                                <strong>{key}:</strong> {JSON.stringify(value)}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                      <div className="mt-2">
                        <h4 className="font-semibold">Abilities:</h4>
                        <ul className="pl-4 list-disc">
                          {Object.entries(taxonomy_data?.abilities || {}).map(([key, value]) => (
                            <li key={key}>
                              <strong>{key}:</strong> {JSON.stringify(value)}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-2">
                        <h4 className="font-semibold">Knowledge:</h4>
                        <ul className="pl-4 list-disc">
                          {Object.entries(taxonomy_data?.knowledge || {}).map(([key, value]) => (
                            <li key={key}>
                              <strong>{key}:</strong> {JSON.stringify(value)}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {taxonomy_data?.rangeOfApplication && (
                        <div className="mt-2">
                          <h4 className="font-semibold">Range of Application:</h4>
                          <ul className="pl-4 list-disc">
                            {taxonomy_data.rangeOfApplication.map((application, index) => (
                              <li key={index}>{application}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
