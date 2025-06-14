
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, MapPin, Shield, Users, Zap, Star } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              LajoSpaces
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" className="text-gray-600 hover:text-purple-600">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Find Your Perfect
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent block">
              Roommate Match
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with compatible roommates based on lifestyle, budget, and location. 
            Make finding your ideal living situation as easy as swiping right.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-3">
                Start Matching Now
              </Button>
            </Link>
            <Link to="/discover">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3 border-purple-200 hover:bg-purple-50">
                Browse Roommates
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose LajoSpaces?</h2>
          <p className="text-lg text-gray-600">Everything you need to find the perfect roommate</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow border-0 bg-white/70 backdrop-blur-sm">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
            <p className="text-gray-600">Our AI algorithm matches you with compatible roommates based on lifestyle, preferences, and budget.</p>
          </Card>
          
          <Card className="p-6 text-center hover:shadow-lg transition-shadow border-0 bg-white/70 backdrop-blur-sm">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Safe & Secure</h3>
            <p className="text-gray-600">Verified profiles, background checks, and secure messaging keep your search safe and private.</p>
          </Card>
          
          <Card className="p-6 text-center hover:shadow-lg transition-shadow border-0 bg-white/70 backdrop-blur-sm">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Location-Based</h3>
            <p className="text-gray-600">Find roommates in your preferred neighborhoods with precise location matching and map integration.</p>
          </Card>
        </div>
      </section>

      {/* Success Stories */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Success Stories</h2>
          <p className="text-lg text-gray-600">Join thousands who found their perfect roommate</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: "Sarah & Emma",
              image: "photo-1649972904349-6e44c42644a7",
              quote: "Found my perfect roommate in just 2 weeks! We're now best friends and love our shared apartment."
            },
            {
              name: "Mike & David",
              image: "photo-1581091226825-a6a2a5aee158",
              quote: "The matching algorithm was spot on. We both love gaming and have the same sleep schedule."
            },
            {
              name: "Jessica & Lisa",
              image: "photo-1721322800607-8c38375eef04",
              quote: "LajoSpaces made moving to a new city so much easier. Found a great roommate before I even arrived!"
            }
          ].map((story, index) => (
            <Card key={index} className="p-6 border-0 bg-white/70 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <img
                  src={`https://images.unsplash.com/${story.image}?w=50&h=50&fit=crop&crop=face`}
                  alt={story.name}
                  className="w-12 h-12 rounded-full object-cover mr-3"
                />
                <div>
                  <h4 className="font-semibold">{story.name}</h4>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">"{story.quote}"</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="p-12 text-center bg-gradient-to-r from-purple-600 to-blue-600 border-0 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Roommate?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of users who've found their ideal living situation</p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3 bg-white text-purple-600 hover:bg-gray-100">
              Get Started for Free
            </Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold">LajoSpaces</span>
            </div>
            <p className="text-gray-400">Finding perfect roommates, one match at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
