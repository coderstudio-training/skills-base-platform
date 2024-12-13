'use client';

import { useLearningResources } from '@/components/Dashboard/hooks/useLearningResources';
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

export function LearningResources() {
  const {
    resources,
    loading,
    categories,
    levels,
    selectedCategory,
    setSelectedCategory,
    selectedLevel,
    setSelectedLevel,
  } = useLearningResources();

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
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Level" />
            </SelectTrigger>
            <SelectContent>
              {levels.map(level => (
                <SelectItem key={level} value={level}>
                  {level === 'all' ? 'All Levels' : `Level ${level}`}
                </SelectItem>
              ))}
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
