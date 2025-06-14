import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Flag, 
  MessageCircle,
  Check,
  Plus
} from 'lucide-react';
import { Property } from '@/types/property.types';

interface PropertyReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  isVerified: boolean;
  rating: number;
  title: string;
  content: string;
  pros: string[];
  cons: string[];
  stayDuration: string;
  roomType: string;
  createdAt: string;
  helpfulCount: number;
  isHelpful?: boolean;
  images?: string[];
}

interface PropertyReviewsProps {
  property: Property;
}

// Mock reviews data
const mockReviews: PropertyReview[] = [
  {
    id: 'review-1',
    userId: 'user-1',
    userName: 'Sarah Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    isVerified: true,
    rating: 5,
    title: 'Amazing place in great location!',
    content: 'I lived here for 8 months and absolutely loved it. The apartment is exactly as described, very clean and well-maintained. The neighborhood is safe and has great restaurants nearby. The owner was very responsive and helpful throughout my stay.',
    pros: ['Great location', 'Clean and modern', 'Responsive owner', 'Safe neighborhood'],
    cons: ['Street parking only', 'Can be noisy on weekends'],
    stayDuration: '8 months',
    roomType: 'Private room',
    createdAt: '2024-01-15',
    helpfulCount: 12,
    isHelpful: false
  },
  {
    id: 'review-2',
    userId: 'user-2',
    userName: 'Mike Chen',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    isVerified: true,
    rating: 4,
    title: 'Good value for money',
    content: 'Stayed here for 6 months while working downtown. The commute was easy and the space was comfortable. Kitchen is well-equipped and the common areas are nice. Only downside was occasional noise from upstairs neighbors.',
    pros: ['Good value', 'Well-equipped kitchen', 'Easy commute', 'Comfortable space'],
    cons: ['Some noise issues', 'Limited storage'],
    stayDuration: '6 months',
    roomType: 'Private room',
    createdAt: '2024-01-08',
    helpfulCount: 8,
    isHelpful: true
  },
  {
    id: 'review-3',
    userId: 'user-3',
    userName: 'Emily Davis',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    isVerified: false,
    rating: 5,
    title: 'Perfect for students!',
    content: 'As a graduate student, this place was perfect for me. Quiet environment for studying, close to campus, and the owner was understanding about student schedules. Would definitely recommend to other students.',
    pros: ['Student-friendly', 'Quiet for studying', 'Close to campus', 'Understanding owner'],
    cons: ['Limited parking'],
    stayDuration: '12 months',
    roomType: 'Private room',
    createdAt: '2023-12-20',
    helpfulCount: 15,
    isHelpful: false
  }
];

export const PropertyReviews: React.FC<PropertyReviewsProps> = ({ property }) => {
  const [reviews] = useState<PropertyReview[]>(mockReviews);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    content: '',
    pros: '',
    cons: ''
  });

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: (reviews.filter(r => r.rating === rating).length / reviews.length) * 100
  }));

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };

    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const handleHelpful = (reviewId: string, isHelpful: boolean) => {
    // In a real app, this would make an API call
    console.log(`Marked review ${reviewId} as ${isHelpful ? 'helpful' : 'not helpful'}`);
  };

  const handleSubmitReview = () => {
    // In a real app, this would submit to the API
    console.log('Submitting review:', newReview);
    setShowWriteReview(false);
    setNewReview({ rating: 5, title: '', content: '', pros: '', cons: '' });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span>Reviews</span>
            <Badge variant="secondary">{reviews.length}</Badge>
          </CardTitle>
          <Button
            onClick={() => setShowWriteReview(!showWriteReview)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Write Review</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div className="flex items-center space-x-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {averageRating.toFixed(1)}
            </div>
            {renderStars(Math.round(averageRating), 'lg')}
            <div className="text-sm text-gray-600 mt-1">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="flex-1 space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center space-x-2">
                <span className="text-sm w-8">{rating}</span>
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Write Review Form */}
        {showWriteReview && (
          <div className="border border-gray-200 rounded-lg p-4 space-y-4">
            <h4 className="font-semibold">Write a Review</h4>
            
            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className="p-1"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= newReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Summarize your experience"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Review</label>
              <Textarea
                value={newReview.content}
                onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                placeholder="Share your experience living here..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Pros</label>
                <Textarea
                  value={newReview.pros}
                  onChange={(e) => setNewReview({ ...newReview, pros: e.target.value })}
                  placeholder="What did you like? (one per line)"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cons</label>
                <Textarea
                  value={newReview.cons}
                  onChange={(e) => setNewReview({ ...newReview, cons: e.target.value })}
                  placeholder="What could be improved? (one per line)"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleSubmitReview}>Submit Review</Button>
              <Button variant="outline" onClick={() => setShowWriteReview(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
              <div className="flex items-start space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={review.userAvatar} />
                  <AvatarFallback>
                    {review.userName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h5 className="font-semibold">{review.userName}</h5>
                    {review.isVerified && (
                      <Badge variant="secondary" className="text-xs">
                        <Check className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 mb-2">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-600">
                      • {review.stayDuration} • {review.roomType}
                    </span>
                  </div>

                  <h6 className="font-medium mb-2">{review.title}</h6>
                  <p className="text-gray-700 mb-3">{review.content}</p>

                  {(review.pros.length > 0 || review.cons.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {review.pros.length > 0 && (
                        <div>
                          <h6 className="font-medium text-green-700 mb-2">Pros</h6>
                          <ul className="space-y-1">
                            {review.pros.map((pro, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start">
                                <span className="text-green-500 mr-2">+</span>
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {review.cons.length > 0 && (
                        <div>
                          <h6 className="font-medium text-red-700 mb-2">Cons</h6>
                          <ul className="space-y-1">
                            {review.cons.map((con, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start">
                                <span className="text-red-500 mr-2">-</span>
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center space-x-4 text-sm">
                    <button
                      onClick={() => handleHelpful(review.id, true)}
                      className={`flex items-center space-x-1 ${
                        review.isHelpful ? 'text-green-600' : 'text-gray-500 hover:text-green-600'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>Helpful ({review.helpfulCount})</span>
                    </button>
                    
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600">
                      <MessageCircle className="w-4 h-4" />
                      <span>Reply</span>
                    </button>
                    
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-red-600">
                      <Flag className="w-4 h-4" />
                      <span>Report</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
