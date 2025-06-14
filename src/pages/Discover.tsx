
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, X, MapPin, Star, ArrowLeft, Filter, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

const Discover = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const profiles = [
    {
      id: 1,
      name: "Sarah Johnson",
      age: 25,
      images: [
        "photo-1649972904349-6e44c42644a7",
        "photo-1581091226825-a6a2a5aee158",
        "photo-1721322800607-8c38375eef04"
      ],
      bio: "Marketing professional looking for a clean, friendly roommate. Love cooking, yoga, and weekend adventures! Non-smoker, social but respectful of personal space.",
      location: "Downtown Manhattan",
      budget: "$1,500-2,000",
      compatibility: 92,
      interests: ["Yoga", "Cooking", "Reading", "Hiking", "Wine Tasting"],
      lifestyle: {
        sleepSchedule: "Early Bird",
        cleanliness: "Very Clean",
        socialLevel: "Social",
        pets: "Dog Friendly"
      }
    },
    {
      id: 2,
      name: "Emily Chen",
      age: 23,
      images: [
        "photo-1581091226825-a6a2a5aee158",
        "photo-1649972904349-6e44c42644a7",
        "photo-1721322800607-8c38375eef04"
      ],
      bio: "Graduate student in Computer Science. Quiet but social, love gaming nights and coffee shop studying. Looking for someone who shares similar interests and respects study time.",
      location: "Brooklyn Heights",
      budget: "$1,200-1,600",
      compatibility: 88,
      interests: ["Gaming", "Coffee", "Tech", "Movies", "Coding"],
      lifestyle: {
        sleepSchedule: "Night Owl",
        cleanliness: "Clean",
        socialLevel: "Moderate",
        pets: "Cat Friendly"
      }
    },
    {
      id: 3,
      name: "Jessica Martinez",
      age: 27,
      images: [
        "photo-1721322800607-8c38375eef04",
        "photo-1649972904349-6e44c42644a7",
        "photo-1581091226825-a6a2a5aee158"
      ],
      bio: "Graphic designer and freelance artist. Creative, organized, and love hosting dinner parties. Looking for someone who appreciates art and good conversation.",
      location: "Williamsburg",
      budget: "$1,800-2,200",
      compatibility: 85,
      interests: ["Art", "Design", "Photography", "Cooking", "Music"],
      lifestyle: {
        sleepSchedule: "Flexible",
        cleanliness: "Very Clean",
        socialLevel: "Very Social",
        pets: "No Pets"
      }
    }
  ];

  const [currentProfile, setCurrentProfile] = useState(profiles[currentIndex]);
  const [imageIndex, setImageIndex] = useState(0);

  const handleLike = () => {
    console.log("Liked:", currentProfile.name);
    nextProfile();
  };

  const handlePass = () => {
    console.log("Passed:", currentProfile.name);
    nextProfile();
  };

  const nextProfile = () => {
    const nextIndex = (currentIndex + 1) % profiles.length;
    setCurrentIndex(nextIndex);
    setCurrentProfile(profiles[nextIndex]);
    setImageIndex(0);
  };

  const nextImage = () => {
    setImageIndex((prev) => (prev + 1) % currentProfile.images.length);
  };

  const prevImage = () => {
    setImageIndex((prev) => (prev - 1 + currentProfile.images.length) % currentProfile.images.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  LajoSpaces
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Profile Card */}
        <Card className="border-0 shadow-2xl bg-white overflow-hidden relative h-[70vh] mb-6">
          {/* Image Section */}
          <div className="relative h-2/3">
            <img
              src={`https://images.unsplash.com/${currentProfile.images[imageIndex]}?w=400&h=600&fit=crop&crop=face`}
              alt={currentProfile.name}
              className="w-full h-full object-cover"
            />
            
            {/* Image Navigation */}
            <div className="absolute inset-0 flex">
              <button
                onClick={prevImage}
                className="w-1/2 h-full transparent"
                disabled={imageIndex === 0}
              />
              <button
                onClick={nextImage}
                className="w-1/2 h-full transparent"
                disabled={imageIndex === currentProfile.images.length - 1}
              />
            </div>

            {/* Image Indicators */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {currentProfile.images.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 rounded-full transition-all ${
                    index === imageIndex ? "bg-white w-8" : "bg-white/50 w-4"
                  }`}
                />
              ))}
            </div>

            {/* Compatibility Badge */}
            <div className="absolute top-4 right-4">
              <Badge className="bg-green-500 text-white">
                {currentProfile.compatibility}% Match
              </Badge>
            </div>

            {/* Gradient Overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Name and Age */}
            <div className="absolute bottom-4 left-4 text-white">
              <h2 className="text-2xl font-bold">{currentProfile.name}, {currentProfile.age}</h2>
              <div className="flex items-center mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{currentProfile.location}</span>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <CardContent className="p-4 h-1/3 overflow-y-auto">
            <div className="space-y-3">
              <p className="text-gray-700 text-sm leading-relaxed">{currentProfile.bio}</p>
              
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Budget Range</p>
                <p className="text-sm text-gray-600">{currentProfile.budget}/month</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Interests</p>
                <div className="flex flex-wrap gap-1">
                  {currentProfile.interests.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Lifestyle</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Sleep:</span>
                    <span className="ml-1">{currentProfile.lifestyle.sleepSchedule}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Cleanliness:</span>
                    <span className="ml-1">{currentProfile.lifestyle.cleanliness}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Social:</span>
                    <span className="ml-1">{currentProfile.lifestyle.socialLevel}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Pets:</span>
                    <span className="ml-1">{currentProfile.lifestyle.pets}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-6">
          <Button
            size="lg"
            variant="outline"
            className="w-16 h-16 rounded-full border-2 border-red-200 hover:bg-red-50 hover:border-red-300"
            onClick={handlePass}
          >
            <X className="w-8 h-8 text-red-500" />
          </Button>
          
          <Button
            size="lg"
            className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
            onClick={handleLike}
          >
            <Heart className="w-10 h-10 text-white" />
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="w-16 h-16 rounded-full border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
          >
            <Star className="w-8 h-8 text-blue-500" />
          </Button>
        </div>

        {/* Profile Counter */}
        <div className="text-center mt-6 text-sm text-gray-600">
          Profile {currentIndex + 1} of {profiles.length}
        </div>
      </div>
    </div>
  );
};

export default Discover;
