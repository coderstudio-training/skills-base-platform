'use client';
import { useHome } from '@/components/Dashboard/hooks/useHome';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronRight, Lightbulb, Shield, TrendingUp, Zap } from 'lucide-react';
import Image from 'next/image';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { LandingPageCard } from './Cards/LandingPageCard';
export default function LandingDashboard() {
  const {
    featuresData,
    benefitsData,
    COLORS,
    email,
    setEmail,
    activeTab,
    setActiveTab,
    isLoading,
    error,
    handleSubmit,
    handleScrollToForm,
  } = useHome();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <header className="text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-700 text-white py-8 px-4 rounded-2xl shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Image
                src={'https://minio-s3.rcdc.me/public/trans_bg-removebg.png?v=1'}
                alt="SkillPoint Logo"
                width={160}
                height={160}
                className="rounded-lg filter brightness-110 hover:scale-105 transition-all duration-500 ease-in-out"
                priority
              />
            </div>
            <p className="text-2xl md:text-3xl font-semibold tracking-wide text-white animate-fade-in-up mt-2 max-w-2xl mx-auto leading-relaxed">
              Skills Crafted with <span className="text-yellow-300 font-bold">CARE</span>
            </p>
            <div className="flex space-x-4 mt-6">
              <Button className="bg-white text-blue-600 hover:bg-blue-50 transition-colors duration-300 text-lg py-2 px-6 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Learn More
              </Button>
              <Button
                className="bg-yellow-400 text-blue-800 hover:bg-yellow-300 transition-colors duration-300 text-lg py-2 px-6 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                onClick={handleScrollToForm}
              >
                Get Started
              </Button>
            </div>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12 auto-rows-fr">
          <LandingPageCard
            title="Creativity"
            contentHeader="Innovative"
            content="Foster creative problem-solving and ideation"
            icon={Lightbulb}
            iconCn="text-yellow-500"
          />
          <LandingPageCard
            title="Agility"
            contentHeader="Adaptable"
            content="Quickly adjust to changing skill demands"
            icon={Zap}
            iconCn="text-blue-500"
          />
          <LandingPageCard
            title="Reliability"
            contentHeader="Consistent"
            content="Dependable skill tracking and development"
            icon={Shield}
            iconCn="text-green-500"
          />
          <LandingPageCard
            title="Evolution"
            contentHeader="Progressive"
            content="Continuous improvement and skill growth"
            icon={TrendingUp}
            iconCn="text-purple-500"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center overflow-x-auto w-full scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
            <TabsList className="justify-center bg-background border shadow-md px-2 py-8">
              <TabsTrigger
                value="overview"
                className="text-lg px-8 py-3 transition-all duration-300 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                Platform Overview
              </TabsTrigger>
              <TabsTrigger
                value="features"
                className="text-lg px-8 py-3 transition-all duration-300 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                Key Features
              </TabsTrigger>
              <TabsTrigger
                value="benefits"
                className="text-lg px-8 py-3 transition-all duration-300 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                Benefits
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="overview">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-300 to-purple-300 p-8">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                  Why Choose SkillPoint?
                </CardTitle>
                <CardDescription className="text-xl font-medium text-gray-700">
                  Discover how our platform can transform your team&apos;s skills management
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="bg-blue-50 dark:bg-blue-200 p-8 rounded-xl shadow-inner">
                    <h3 className="text-2xl font-semibold mb-6 text-blue-700">For Employees</h3>
                    <ul className="space-y-4 text-gray-700">
                      {[
                        'Track your skill progress',
                        'Access personalized learning paths',
                        'Receive targeted training recommendations',
                        'Visualize your career growth',
                      ].map((item, index) => (
                        <li key={index} className="flex items-center">
                          <ChevronRight className="h-6 w-6 text-blue-500 mr-3" />
                          <span className="text-lg">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-200 p-8 rounded-xl shadow-inner">
                    <h3 className="text-2xl font-semibold mb-6 text-purple-700">For Managers</h3>
                    <ul className="space-y-4 text-gray-700">
                      {[
                        'Gain insights into team skills',
                        'Identify and address skill gaps',
                        'Streamline performance evaluations',
                        'Optimize training resources',
                      ].map((item, index) => (
                        <li key={index} className="flex items-center">
                          <ChevronRight className="h-6 w-6 text-purple-500 mr-3" />
                          <span className="text-lg">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="features">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-100 to-blue-100 p-8">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                  Platform Features
                </CardTitle>
                <CardDescription className="text-xl text-gray-700">
                  Explore the powerful tools SkillPoint offers
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <ResponsiveContainer width="100%" height={500}>
                  <PieChart>
                    <Pie
                      data={featuresData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={200}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {featuresData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend layout="vertical" verticalAlign="middle" align="right" />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="benefits">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-yellow-100 to-red-100 p-8">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                  Platform Benefits
                </CardTitle>
                <CardDescription className="text-xl text-gray-700">
                  See the impact SkillPoint can have on your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <ResponsiveContainer width="100%" height={500}>
                  <BarChart
                    data={benefitsData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="increase" fill="#8884d8" name="Percentage Increase">
                      {benefitsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div
          id="get-started-form"
          className="mt-16 text-center bg-gradient-to-r from-blue-100 to-purple-100 dark:bg-gradient-to-r dark:from-blue-900 dark:to-purple-900 p-12 rounded-2xl shadow-inner"
        >
          <h2 className="text-4xl font-bold mb-8 text-gray-900 dark:text-gray-100">
            Ready to Transform Your Team&apos;s Skills?
          </h2>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center justify-center gap-6 md:flex-row max-w-3xl mx-auto"
          >
            <div className="flex-1 w-full md:w-auto">
              <Input
                type="email"
                placeholder="Enter your work email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full md:w-auto dark:bg-gradient-to-r dark:from-blue-400 dark:to-purple-400 bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:from-blue-700 hover:to-purple-800 transition-all duration-300 text-lg py-4 px-10 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              disabled={isLoading || !email}
            >
              {isLoading ? (
                <>
                  <span className="mr-2">Loading...</span>
                  <ChevronRight className="ml-2 h-6 w-6 animate-spin" />
                </>
              ) : (
                <>
                  Get Started
                  <ChevronRight className="ml-2 h-6 w-6" />
                </>
              )}
            </Button>
          </form>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
