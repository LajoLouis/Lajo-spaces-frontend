import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Star,
  Search,
  Filter,
  Send,
  Phone,
  Mail,
  Calendar,
  User,
  Home,
  DollarSign,
  MapPin
} from 'lucide-react';
import { Property } from '@/types/property.types';

interface Inquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  inquirerName: string;
  inquirerEmail: string;
  inquirerPhone?: string;
  inquirerAvatar?: string;
  message: string;
  moveInDate?: string;
  budget?: number;
  stayDuration?: string;
  status: 'pending' | 'responded' | 'accepted' | 'declined';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  respondedAt?: string;
  lastActivity: string;
}

interface InquiryManagementProps {
  userProperties: Property[];
}

// Mock inquiries data
const mockInquiries: Inquiry[] = [
  {
    id: 'inq_1',
    propertyId: 'prop_1',
    propertyTitle: 'Spacious Private Room in Modern Downtown Apartment',
    inquirerName: 'Sarah Johnson',
    inquirerEmail: 'sarah.j@email.com',
    inquirerPhone: '+1 (555) 123-4567',
    inquirerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    message: 'Hi! I\'m very interested in your property. I\'m a working professional looking for a clean, quiet place. Could we schedule a viewing?',
    moveInDate: '2024-02-15',
    budget: 1800,
    stayDuration: '12 months',
    status: 'pending',
    priority: 'high',
    createdAt: '2024-01-20T10:30:00Z',
    lastActivity: '2024-01-20T10:30:00Z'
  },
  {
    id: 'inq_2',
    propertyId: 'prop_2',
    propertyTitle: 'Cozy Studio in Mission District - Pet Friendly',
    inquirerName: 'Michael Chen',
    inquirerEmail: 'mike.chen@email.com',
    inquirerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    message: 'Hello! I have a small dog and I\'m looking for a pet-friendly place. Is your studio still available?',
    moveInDate: '2024-03-01',
    budget: 2200,
    stayDuration: '6 months',
    status: 'responded',
    priority: 'medium',
    createdAt: '2024-01-19T14:15:00Z',
    respondedAt: '2024-01-19T16:45:00Z',
    lastActivity: '2024-01-19T16:45:00Z'
  },
  {
    id: 'inq_3',
    propertyId: 'prop_1',
    propertyTitle: 'Spacious Private Room in Modern Downtown Apartment',
    inquirerName: 'Emily Rodriguez',
    inquirerEmail: 'emily.r@email.com',
    inquirerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
    message: 'I\'m a graduate student and this looks perfect for my needs. What\'s the earliest move-in date?',
    moveInDate: '2024-02-01',
    budget: 1700,
    stayDuration: '24 months',
    status: 'accepted',
    priority: 'high',
    createdAt: '2024-01-18T09:20:00Z',
    respondedAt: '2024-01-18T11:30:00Z',
    lastActivity: '2024-01-18T11:30:00Z'
  }
];

export const InquiryManagement: React.FC<InquiryManagementProps> = ({ userProperties }) => {
  const [inquiries] = useState<Inquiry[]>(mockInquiries);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [replyMessage, setReplyMessage] = useState('');

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = inquiry.inquirerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inquiry.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inquiry.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'responded':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleReply = (inquiry: Inquiry) => {
    // In a real app, this would send the reply
    console.log('Sending reply to:', inquiry.inquirerEmail, 'Message:', replyMessage);
    setReplyMessage('');
    setSelectedInquiry(null);
  };

  const handleStatusChange = (inquiryId: string, newStatus: string) => {
    // In a real app, this would update the inquiry status
    console.log('Updating inquiry status:', inquiryId, 'to:', newStatus);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inquiry Management</h2>
          <p className="text-gray-600">Manage inquiries for your properties</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{inquiries.length} total inquiries</Badge>
          <Badge className="bg-yellow-100 text-yellow-800">
            {inquiries.filter(i => i.status === 'pending').length} pending
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search inquiries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="responded">Responded</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
            </select>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inquiries List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inquiries */}
        <div className="space-y-4">
          {filteredInquiries.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No inquiries found</h3>
                <p className="text-gray-600">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'Inquiries will appear here when people contact you about your properties'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredInquiries.map((inquiry) => (
              <Card 
                key={inquiry.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedInquiry?.id === inquiry.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedInquiry(inquiry)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={inquiry.inquirerAvatar} />
                      <AvatarFallback>
                        {inquiry.inquirerName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{inquiry.inquirerName}</h4>
                          <p className="text-sm text-gray-600">{inquiry.propertyTitle}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(inquiry.priority)}>
                            {inquiry.priority}
                          </Badge>
                          <Badge className={getStatusColor(inquiry.status)}>
                            {inquiry.status}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-gray-700 text-sm mb-3 line-clamp-2">{inquiry.message}</p>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          {inquiry.moveInDate && (
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(inquiry.moveInDate).toLocaleDateString()}</span>
                            </span>
                          )}
                          {inquiry.budget && (
                            <span className="flex items-center space-x-1">
                              <DollarSign className="w-3 h-3" />
                              <span>${inquiry.budget.toLocaleString()}</span>
                            </span>
                          )}
                        </div>
                        <span>{new Date(inquiry.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Inquiry Details */}
        <div className="lg:sticky lg:top-6">
          {selectedInquiry ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>Inquiry Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Inquirer Info */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedInquiry.inquirerAvatar} />
                    <AvatarFallback>
                      {selectedInquiry.inquirerName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{selectedInquiry.inquirerName}</h4>
                    <p className="text-sm text-gray-600">{selectedInquiry.inquirerEmail}</p>
                    {selectedInquiry.inquirerPhone && (
                      <p className="text-sm text-gray-600">{selectedInquiry.inquirerPhone}</p>
                    )}
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button size="sm" variant="outline">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>

                {/* Property Info */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Property</h5>
                  <p className="text-sm text-gray-700">{selectedInquiry.propertyTitle}</p>
                </div>

                {/* Inquiry Details */}
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Message</h5>
                    <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">
                      {selectedInquiry.message}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {selectedInquiry.moveInDate && (
                      <div>
                        <h6 className="font-medium text-gray-900 text-sm">Move-in Date</h6>
                        <p className="text-sm text-gray-600">
                          {new Date(selectedInquiry.moveInDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {selectedInquiry.budget && (
                      <div>
                        <h6 className="font-medium text-gray-900 text-sm">Budget</h6>
                        <p className="text-sm text-gray-600">${selectedInquiry.budget.toLocaleString()}/mo</p>
                      </div>
                    )}
                    {selectedInquiry.stayDuration && (
                      <div>
                        <h6 className="font-medium text-gray-900 text-sm">Stay Duration</h6>
                        <p className="text-sm text-gray-600">{selectedInquiry.stayDuration}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Actions */}
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Update Status</h5>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStatusChange(selectedInquiry.id, 'responded')}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Responded
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStatusChange(selectedInquiry.id, 'accepted')}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStatusChange(selectedInquiry.id, 'declined')}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  </div>

                  {/* Quick Reply */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Quick Reply</h5>
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Type your reply..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        rows={3}
                      />
                      <Button 
                        onClick={() => handleReply(selectedInquiry)}
                        disabled={!replyMessage.trim()}
                        className="w-full"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select an Inquiry</h3>
                <p className="text-gray-600">Choose an inquiry from the list to view details and respond</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
