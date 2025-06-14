import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Heart, 
  MessageCircle, 
  Calendar,
  Users,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  MapPin,
  Star,
  ArrowUp,
  ArrowDown,
  Info
} from 'lucide-react';
import { Property } from '@/types/property.types';

interface PropertyAnalyticsProps {
  property: Property;
}

interface AnalyticsData {
  views: {
    total: number;
    thisWeek: number;
    lastWeek: number;
    trend: 'up' | 'down' | 'stable';
    dailyViews: { date: string; views: number }[];
  };
  favorites: {
    total: number;
    thisWeek: number;
    conversionRate: number;
  };
  inquiries: {
    total: number;
    thisWeek: number;
    responseRate: number;
    averageResponseTime: number;
  };
  performance: {
    rank: number;
    totalProperties: number;
    marketComparison: 'above' | 'below' | 'average';
  };
}

export const PropertyAnalytics: React.FC<PropertyAnalyticsProps> = ({ property }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // Mock analytics data - in a real app, this would come from an API
  const analyticsData: AnalyticsData = {
    views: {
      total: property.views,
      thisWeek: 45,
      lastWeek: 38,
      trend: 'up',
      dailyViews: [
        { date: '2024-01-15', views: 8 },
        { date: '2024-01-16', views: 12 },
        { date: '2024-01-17', views: 6 },
        { date: '2024-01-18', views: 15 },
        { date: '2024-01-19', views: 9 },
        { date: '2024-01-20', views: 11 },
        { date: '2024-01-21', views: 7 },
      ]
    },
    favorites: {
      total: property.favorites,
      thisWeek: 8,
      conversionRate: 18.4 // (favorites / views) * 100
    },
    inquiries: {
      total: property.inquiries,
      thisWeek: 3,
      responseRate: 85,
      averageResponseTime: 2.5 // hours
    },
    performance: {
      rank: 12,
      totalProperties: 156,
      marketComparison: 'above'
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Property Analytics</h2>
          <p className="text-gray-600">{property.title}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={selectedPeriod === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('7d')}
          >
            7 Days
          </Button>
          <Button
            variant={selectedPeriod === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('30d')}
          >
            30 Days
          </Button>
          <Button
            variant={selectedPeriod === '90d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('90d')}
          >
            90 Days
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.views.total}</p>
                <div className="flex items-center space-x-1 mt-1">
                  {getTrendIcon(analyticsData.views.trend)}
                  <span className={`text-sm ${getTrendColor(analyticsData.views.trend)}`}>
                    +{analyticsData.views.thisWeek - analyticsData.views.lastWeek} this week
                  </span>
                </div>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Favorites</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.favorites.total}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {analyticsData.favorites.conversionRate}% conversion rate
                </p>
              </div>
              <Heart className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inquiries</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.inquiries.total}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {analyticsData.inquiries.responseRate}% response rate
                </p>
              </div>
              <MessageCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Market Rank</p>
                <p className="text-3xl font-bold text-gray-900">#{analyticsData.performance.rank}</p>
                <p className="text-sm text-gray-600 mt-1">
                  of {analyticsData.performance.totalProperties} properties
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Views Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Daily Views</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.views.dailyViews.map((day, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600 w-16">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(day.views / 15) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{day.views}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Engagement Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Engagement Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Eye className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">View Rate</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {analyticsData.views.thisWeek} views/week
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Heart className="w-5 h-5 text-red-600" />
                    <span className="font-medium">Favorite Rate</span>
                  </div>
                  <span className="text-lg font-bold text-red-600">
                    {analyticsData.favorites.conversionRate}%
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Inquiry Rate</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {((analyticsData.inquiries.total / analyticsData.views.total) * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">Response Time</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">
                    {analyticsData.inquiries.averageResponseTime}h avg
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement">
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Engagement Analytics</h3>
              <p className="text-gray-600">Detailed engagement metrics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardContent className="p-12 text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Analysis</h3>
              <p className="text-gray-600">Performance comparison tools coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="w-5 h-5" />
                  <span>Optimization Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Great Performance!</h4>
                      <p className="text-sm text-blue-700">
                        Your property is performing {analyticsData.performance.marketComparison} average with a strong view-to-inquiry conversion rate.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Star className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900">Optimization Tip</h4>
                      <p className="text-sm text-yellow-700">
                        Consider adding more photos to increase engagement. Properties with 5+ photos get 40% more inquiries.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Response Time</h4>
                      <p className="text-sm text-green-700">
                        Your average response time of {analyticsData.inquiries.averageResponseTime} hours is excellent! Keep it up to maintain high engagement.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
