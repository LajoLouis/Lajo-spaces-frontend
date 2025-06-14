
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, MapPin, Star, Filter, Search, Bell, AlertCircle, User, Settings, ArrowRight, Home, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserProfile } from "@/components/auth/UserProfile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("discover");
  const { user } = useAuth();

  const mockMatches = [
    {
      id: 1,
      name: "Sarah Johnson",
      age: 25,
      image: "photo-1649972904349-6e44c42644a7",
      bio: "Marketing professional looking for a clean, friendly roommate. Love cooking and yoga!",
      location: "Downtown Manhattan",
      budget: "$1,500-2,000",
      compatibility: 92,
      interests: ["Yoga", "Cooking", "Reading"]
    },
    {
      id: 2,
      name: "Emily Chen",
      age: 23,
      image: "photo-1581091226825-a6a2a5aee158",
      bio: "Graduate student, quiet but social. Looking for someone who shares similar interests.",
      location: "Brooklyn Heights",
      budget: "$1,200-1,600",
      compatibility: 88,
      interests: ["Gaming", "Movies", "Coffee"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                LajoSpaces
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => setActiveTab("discover")}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  activeTab === "discover" 
                    ? "bg-purple-100 text-purple-700" 
                    : "text-gray-600 hover:text-purple-600"
                }`}
              >
                Discover
              </button>
              <button
                onClick={() => setActiveTab("matches")}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  activeTab === "matches" 
                    ? "bg-purple-100 text-purple-700" 
                    : "text-gray-600 hover:text-purple-600"
                }`}
              >
                Matches
              </button>
              <Link
                to="/messages"
                className={`px-3 py-2 rounded-lg transition-colors ${
                  activeTab === "messages"
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-600 hover:text-purple-600"
                }`}
              >
                Messages
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-5 h-5" />
              </Button>
              <UserProfile variant="dropdown" />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Verification Alert */}
        {user && (!user.isEmailVerified || (user.phone && !user.isPhoneVerified)) && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Please verify your account to access all features.{' '}
              <Link to="/verify" className="font-medium underline hover:no-underline">
                Verify now
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className="text-gray-600">You have 3 new matches and 5 messages waiting</p>
        </div>

        {/* Profile Completion Card */}
        <Card className="mb-8 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Complete Your Profile</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Get better roommate matches by completing your profile</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Progress value={45} className="w-24 sm:w-32 h-2" />
                    <span className="text-xs sm:text-sm text-gray-500">45% complete</span>
                  </div>
                </div>
              </div>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                <Link to="/onboarding" className="flex items-center justify-center space-x-2">
                  <span className="hidden sm:inline">Continue Setup</span>
                  <span className="sm:hidden">Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Matches</p>
                  <p className="text-2xl font-bold text-purple-600">24</p>
                </div>
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Chats</p>
                  <p className="text-2xl font-bold text-blue-600">8</p>
                </div>
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Profile Views</p>
                  <p className="text-2xl font-bold text-green-600">156</p>
                </div>
                <Star className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Compatibility</p>
                  <p className="text-2xl font-bold text-orange-600">89%</p>
                </div>
                <MapPin className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Discover/Matches */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {activeTab === "discover" ? "Discover Roommates" : "Your Matches"}
              </h2>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/discover">
                    <Search className="w-4 h-4 mr-2" />
                    Go to Discovery
                  </Link>
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {mockMatches.map((match) => (
                <Card key={match.id} className="border-0 bg-white/70 backdrop-blur-sm hover:shadow-lg transition-shadow overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3">
                        <img
                          src={`https://images.unsplash.com/${match.image}?w=300&h=400&fit=crop&crop=face`}
                          alt={match.name}
                          className="w-full h-48 sm:h-64 md:h-full object-cover"
                        />
                      </div>
                      <div className="md:w-2/3 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-2 sm:space-y-0">
                          <h3 className="text-lg sm:text-xl font-semibold">{match.name}, {match.age}</h3>
                          <Badge className="bg-green-100 text-green-700 self-start sm:self-auto">
                            {match.compatibility}% Match
                          </Badge>
                        </div>

                        <div className="flex items-center text-gray-600 mb-3">
                          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span className="text-sm">{match.location}</span>
                        </div>

                        <p className="text-gray-700 mb-4 text-sm sm:text-base line-clamp-3">{match.bio}</p>

                        <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
                          {match.interests.slice(0, 3).map((interest, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                          {match.interests.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{match.interests.length - 3} more
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                          <span className="text-sm text-gray-600">Budget: {match.budget}</span>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                              View Profile
                            </Button>
                            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 flex-1 sm:flex-none">
                              <Heart className="w-4 h-4 mr-2" />
                              Like
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Column - Recent Activity */}
          <div>
            <Card className="border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <img
                    src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=40&h=40&fit=crop&crop=face"
                    alt="Sarah"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium">Sarah liked your profile</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <img
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=40&h=40&fit=crop&crop=face"
                    alt="Emily"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium">New message from Emily</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Profile viewed 12 times</p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/70 backdrop-blur-sm mt-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/properties">
                    <Home className="w-4 h-4 mr-2" />
                    Browse Properties
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/properties/post">
                    <Plus className="w-4 h-4 mr-2" />
                    Post Property
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/properties/manage">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Properties
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link to="/messages">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Messages
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Search className="w-4 h-4 mr-2" />
                  Update Preferences
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-around">
          <Link
            to="/discover"
            className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-400 hover:text-purple-600"
          >
            <Search className="w-5 h-5" />
            <span className="text-xs mt-1">Discover</span>
          </Link>
          <button
            onClick={() => setActiveTab("matches")}
            className={`flex flex-col items-center py-2 px-3 rounded-lg ${
              activeTab === "matches" ? "text-purple-600" : "text-gray-400"
            }`}
          >
            <Heart className="w-5 h-5" />
            <span className="text-xs mt-1">Matches</span>
          </button>
          <Link
            to="/messages"
            className={`flex flex-col items-center py-2 px-3 rounded-lg ${
              activeTab === "messages" ? "text-purple-600" : "text-gray-400"
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs mt-1">Messages</span>
          </Link>
          <Link
            to="/profile"
            className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-400 hover:text-purple-600"
          >
            <User className="w-5 h-5" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
