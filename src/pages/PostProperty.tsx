import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Home, 
  ArrowLeft, 
  ArrowRight, 
  Check,
  Loader2
} from 'lucide-react';
import { usePropertyForm, usePropertyStore } from '@/stores/propertyStore';
import { mockPropertyService } from '@/services/mockProperty.service';
import { BasicInfoStep } from '@/components/properties/post/BasicInfoStep';
import { LocationStep } from '@/components/properties/post/LocationStep';
import { PricingStep } from '@/components/properties/post/PricingStep';
import { DetailsStep } from '@/components/properties/post/DetailsStep';
import { AmenitiesStep } from '@/components/properties/post/AmenitiesStep';
import { PhotosStep } from '@/components/properties/post/PhotosStep';
import { ReviewStep } from '@/components/properties/post/ReviewStep';
import { toast } from 'sonner';

const steps = [
  { id: 'basic', title: 'Basic Info', description: 'Property title and description' },
  { id: 'location', title: 'Location', description: 'Address and neighborhood' },
  { id: 'pricing', title: 'Pricing', description: 'Rent and fees' },
  { id: 'details', title: 'Details', description: 'Bedrooms, bathrooms, etc.' },
  { id: 'amenities', title: 'Amenities', description: 'Features and rules' },
  { id: 'photos', title: 'Photos', description: 'Property images' },
  { id: 'review', title: 'Review', description: 'Final review and publish' },
];

const PostProperty: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const { formData, formErrors, isSubmitting, resetFormData, setSubmitting } = usePropertyForm();
  const { addProperty, addUserProperty } = usePropertyStore();

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const response = await mockPropertyService.createProperty(formData);

      if (response.success) {
        // Add the new property to the store so it appears in search results
        addProperty(response.data);
        addUserProperty(response.data);

        toast.success('Property posted successfully! Your listing is now live and searchable.');
        resetFormData();
        navigate('/properties');
      } else {
        toast.error(response.message || 'Failed to post property');
      }
    } catch (error) {
      toast.error('An error occurred while posting the property');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStepData.id) {
      case 'basic':
        return <BasicInfoStep />;
      case 'location':
        return <LocationStep />;
      case 'pricing':
        return <PricingStep />;
      case 'details':
        return <DetailsStep />;
      case 'amenities':
        return <AmenitiesStep />;
      case 'photos':
        return <PhotosStep />;
      case 'review':
        return <ReviewStep onSubmit={handleSubmit} />;
      default:
        return <BasicInfoStep />;
    }
  };

  const canProceed = () => {
    // Check if there are any form errors
    const hasErrors = Object.keys(formErrors).length > 0;
    if (hasErrors) return false;

    switch (currentStepData.id) {
      case 'basic':
        return formData.title && formData.description && formData.propertyType && formData.roomType;
      case 'location':
        return formData.address && formData.city && formData.state && formData.zipCode;
      case 'pricing':
        return (
          formData.monthlyRent &&
          formData.monthlyRent > 0 &&
          formData.availableFrom &&
          formData.minimumStay &&
          formData.minimumStay >= 1
        );
      case 'details':
        return formData.bedrooms !== undefined && formData.bathrooms !== undefined && formData.furnished;
      case 'amenities':
        return true; // Optional step
      case 'photos':
        return true; // Optional step
      case 'review':
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          {/* Mobile Layout */}
          <div className="block md:hidden">
            {/* Back Button */}
            <div className="flex items-center justify-between mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/properties')}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span className="hidden xs:inline">Back</span>
              </Button>
              <div className="text-right">
                <div className="text-xs text-gray-600">
                  Step {currentStep + 1} of {steps.length}
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {Math.round(progress)}% complete
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="mb-3">
              <h1 className="text-xl font-bold text-gray-900">Post Your Property</h1>
              <p className="text-sm text-gray-600">Share your space with potential roommates</p>
            </div>

            {/* Current Step */}
            <div className="mb-3">
              <div className="text-lg font-semibold text-gray-900 mb-1">
                {currentStepData.title}
              </div>
              <div className="text-sm text-gray-600">
                {currentStepData.description}
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:block">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/properties')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Properties
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Post Your Property</h1>
                  <p className="text-gray-600">Share your space with potential roommates</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-600">
                  Step {currentStep + 1} of {steps.length}
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {currentStepData.title}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{currentStepData.description}</span>
                <span className="text-sm text-gray-600">{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          {/* Mobile Step Navigation - Horizontal Scroll */}
          <div className="block md:hidden">
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-lg cursor-pointer transition-colors flex-shrink-0 ${
                    index === currentStep
                      ? 'bg-blue-100 text-blue-700'
                      : index < currentStep
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-500'
                  }`}
                  onClick={() => setCurrentStep(index)}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${
                      index === currentStep
                        ? 'bg-blue-600 text-white'
                        : index < currentStep
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {index < currentStep ? <Check className="w-2 h-2" /> : index + 1}
                  </div>
                  <span className="text-xs font-medium whitespace-nowrap">{step.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Step Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center justify-between overflow-x-auto">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    index === currentStep
                      ? 'bg-blue-100 text-blue-700'
                      : index < currentStep
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-500'
                  }`}
                  onClick={() => setCurrentStep(index)}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                      index === currentStep
                        ? 'bg-blue-600 text-white'
                        : index < currentStep
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {index < currentStep ? <Check className="w-3 h-3" /> : index + 1}
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2">
                <Home className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-lg sm:text-xl">{currentStepData.title}</span>
              </CardTitle>
              <p className="text-blue-100 text-sm sm:text-base">{currentStepData.description}</p>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 lg:p-8">
              {renderStep()}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="mt-8">
            {/* Mobile Navigation - Stacked */}
            <div className="block sm:hidden space-y-3">
              {currentStep < steps.length - 1 ? (
                <>
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-green-600"
                  >
                    <span>Next: {steps[currentStep + 1]?.title}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                    onClick={handleSubmit}
                    disabled={!canProceed() || isSubmitting}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Publish Property</span>
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </Button>
                </>
              )}
            </div>

            {/* Desktop Navigation - Side by Side */}
            <div className="hidden sm:flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              <div className="flex items-center space-x-2">
                {currentStep < steps.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-green-600"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!canProceed() || isSubmitting}
                    className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Publish Property</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Form Errors */}
          {Object.keys(formErrors).length > 0 && (
            <Card className="mt-6 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <h3 className="text-red-800 font-semibold mb-2">Please fix the following errors:</h3>
                <ul className="text-red-700 text-sm space-y-1">
                  {Object.entries(formErrors).map(([field, errors]) => (
                    <li key={field}>
                      <strong>{field}:</strong> {errors.join(', ')}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Help Text */}
          <div className="mt-8 text-center text-gray-600">
            <p className="text-sm">
              Need help? Check out our{' '}
              <a href="#" className="text-blue-600 hover:underline">
                posting guidelines
              </a>{' '}
              or{' '}
              <a href="#" className="text-blue-600 hover:underline">
                contact support
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostProperty;
