'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getLearningResources } from '@/lib/api';
import { Course } from '@/types/admin';
import { useEffect, useState } from 'react';

export function LearningResources() {
  const [resources, setResources] = useState<Course[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchResources() {
      try {
        setLoading(true);
        const params = {
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          level: selectedLevel !== 'all' ? selectedLevel : undefined,
        };

        const data = await getLearningResources(params);
        setResources(data);
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchResources();
  }, [selectedCategory, selectedLevel]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Resources</CardTitle>
        <div className="flex items-center space-x-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Technical">Technical</SelectItem>
              <SelectItem value="Process">Process</SelectItem>
              <SelectItem value="Leadership">Leadership</SelectItem>
              <SelectItem value="Management">Management</SelectItem>
              <SelectItem value="Business">Business</SelectItem>
              <SelectItem value="Governance">Governance</SelectItem>
              <SelectItem value="Innovation">Innovation</SelectItem>
              <SelectItem value="Operations">Operations</SelectItem>
              <SelectItem value="Strategy">Strategy</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="2">Level 2</SelectItem>
              <SelectItem value="3">Level 3</SelectItem>
              <SelectItem value="4">Level 4</SelectItem>
              <SelectItem value="5">Level 5</SelectItem>
              <SelectItem value="6">Level 6</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] w-full rounded-md">
          <div className="space-y-4 p-4">
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : resources.length === 0 ? (
              <div className="text-center py-4">No resources found</div>
            ) : (
              resources.map(resource => (
                <div key={resource._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">
                        {resource.fields.find(f => f.name === 'courseName')?.value}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {resource.fields.find(f => f.name === 'provider')?.value}
                      </p>
                    </div>
                    <Badge>{resource.skillCategory}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Duration:</span>{' '}
                      {resource.fields.find(f => f.name === 'duration')?.value}
                    </div>
                    <div>
                      <span className="text-gray-500">Format:</span>{' '}
                      {resource.fields.find(f => f.name === 'format')?.value}
                    </div>
                    <div>
                      <span className="text-gray-500">Level:</span> {resource.requiredLevel}
                    </div>
                    <div>
                      <span className="text-gray-500">Certification:</span>{' '}
                      {resource.fields.find(f => f.name === 'certificationOption')?.value || 'None'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
