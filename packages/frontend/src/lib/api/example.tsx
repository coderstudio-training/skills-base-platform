'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { FormEvent, useEffect, useState } from 'react';
import { formatError } from '../utils';
import { skillsApi } from './client';
import { Taxonomy } from './domain-types';
import { useAuth, useMutation, useQuery } from './hooks';

interface ITaxonomy {
  data: ITaxonomyUpsert[];
}

interface ITaxonomyUpsert {
  docTitle: string;
  docId: string;
  docRevisionId: string;
  category: string;
  title: string;
  description: string;
  proficiencyDescription: object;
  abilities: object;
  knowledge: object;
  rangeOfApplication?: string[];
  businessUnit: string;
}

interface ITaxonomyResponse {
  updatedCount: number;
  errors: string[];
}

export default function ShowcaseDashboard() {
  const { hasPermission, user } = useAuth();
  const [canViewDashboard, setCanViewDashboard] = useState(false);

  const [docTitle, setDocTitle] = useState('');
  const [docId, setDocId] = useState('');
  const [docRevisionId, setDocRevisionId] = useState('');
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [proficiencyDescription, setProfiencyDescription] = useState('');
  const [knowledge, setKnowledge] = useState('');
  const [abilities, setAbilities] = useState('');
  const [rangeOfApplication, setRangeOfApplication] = useState('');
  const [businessUnit, setBusinessUnit] = useState('');

  useEffect(() => {
    const checkPermission = async () => {
      const canView = await hasPermission('canViewDashboard');
      setCanViewDashboard(canView);
    };
    checkPermission();
  });

  const {
    data: taxonomy_data,
    error: queryError,
    isLoading: queryLoading,
  } = useQuery<Taxonomy>(
    skillsApi,
    '/taxonomy/1yMsFZfwyumL4W7Erc0hr1IfM8_DsErcdri0TBEJRjq0?businessUnit=QA',
    {
      requiresAuth: true,
    },
  );

  const {
    mutate,
    error: mutateError,
    isLoading: mutateLoading,
  } = useMutation<ITaxonomyResponse, ITaxonomy>(skillsApi, '/taxonomy/bulk-upsert', 'POST', {
    requiresAuth: true,
  });

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const taxonomyData: ITaxonomy = {
      data: [
        {
          docTitle,
          docId,
          docRevisionId,
          category,
          title,
          description,
          proficiencyDescription: {
            'level 1': [proficiencyDescription],
          },
          abilities: {
            'level 1': [abilities],
          },
          knowledge: {
            'level 1': [knowledge],
          },
          rangeOfApplication: [rangeOfApplication],
          businessUnit,
        },
      ],
    };

    const response = await mutate(taxonomyData);

    if (response.error && mutateError) {
      console.error('Error submitting taxonomy data:', response.error);
      alert(`Error: ${response.error.message} || ${formatError(mutateError)}`);
    } else if (response.data) {
      console.log('Successfully submitted taxonomy data:', response.data);
      alert(`Updated count: ${response.data.updatedCount}`);
    }
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
                  {queryLoading ? (
                    <li>Loading...</li>
                  ) : queryError ? (
                    <li>Error: {queryError.message}</li>
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

      <div className="flex justify-between items-center mb-6 bg-white p-8 rounded sm:shadow-md w-96 ">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="docTitle" className="block text-sm font-medium text-gray-700">
              docTitle
            </label>
            <input
              type="text"
              id="docTitle"
              value={docTitle}
              onChange={e => setDocTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
            <label htmlFor="docId" className="block text-sm font-medium text-gray-700">
              docId
            </label>
            <input
              type="text"
              id="docId"
              value={docId}
              onChange={e => setDocId(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
            <label htmlFor="docRevisionId" className="block text-sm font-medium text-gray-700">
              docRevisionId
            </label>
            <input
              type="text"
              id="docRevisionId"
              value={docRevisionId}
              onChange={e => setDocRevisionId(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              category
            </label>
            <input
              type="text"
              id="category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              description
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
            <label htmlFor="businessUnit" className="block text-sm font-medium text-gray-700">
              businessUnit
            </label>
            <input
              type="text"
              id="businessUnit"
              value={businessUnit}
              onChange={e => setBusinessUnit(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
            <label
              htmlFor="proficiencyDescription"
              className="block text-sm font-medium text-gray-700"
            >
              proficiencyDescription
            </label>
            <input
              type="text"
              id="proficiencyDescription"
              value={proficiencyDescription}
              onChange={e => setProfiencyDescription(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
            <label htmlFor="knowledge" className="block text-sm font-medium text-gray-700">
              knowledge
            </label>
            <input
              type="text"
              id="knowledge"
              value={knowledge}
              onChange={e => setKnowledge(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
            <label htmlFor="abilities" className="block text-sm font-medium text-gray-700">
              abilities
            </label>
            <input
              type="text"
              id="abilities"
              value={abilities}
              onChange={e => setAbilities(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
            <label htmlFor="rangeOfApplication" className="block text-sm font-medium text-gray-700">
              rangeOfApplication
            </label>
            <input
              type="text"
              id="rangeOfApplication"
              value={rangeOfApplication}
              onChange={e => setRangeOfApplication(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
            disabled={mutateLoading}
          >
            Test Upsert
          </button>
        </form>
      </div>
    </div>
  );
}
