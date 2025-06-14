import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Mail, Phone, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Validation schema
const verificationSchema = z.object({
  verificationCode: z.string()
    .min(6, "Verification code must be 6 digits")
    .max(6, "Verification code must be 6 digits")
    .regex(/^\d{6}$/, "Verification code must contain only numbers"),
});

type VerificationFormData = z.infer<typeof verificationSchema>;

const Verify = () => {
  const [verificationType, setVerificationType] = useState<'email' | 'phone'>('email');
  const { user, verifyEmail, verifyPhone, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get verification requirements from navigation state
  const needsEmailVerification = location.state?.needsEmailVerification || false;
  const needsPhoneVerification = location.state?.needsPhoneVerification || false;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      verificationCode: "",
    },
  });

  const onSubmit = async (data: VerificationFormData) => {
    try {
      clearError();
      
      if (verificationType === 'email') {
        await verifyEmail({
          email: user?.email,
          verificationCode: data.verificationCode,
        });
        toast.success('Email verified successfully!');
      } else {
        await verifyPhone({
          phone: user?.phone,
          verificationCode: data.verificationCode,
        });
        toast.success('Phone number verified successfully!');
      }

      // Reset form
      reset();

      // Check if we need to verify the other method
      if (verificationType === 'email' && needsPhoneVerification && user?.phone) {
        setVerificationType('phone');
        toast.info('Please verify your phone number as well.');
      } else if (verificationType === 'phone' && needsEmailVerification && !user?.isEmailVerified) {
        setVerificationType('email');
        toast.info('Please verify your email address as well.');
      } else {
        // All verifications complete, redirect to dashboard
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      // Error is handled by the auth store and toast
      console.error('Verification failed:', error);
    }
  };

  const handleResendCode = async () => {
    try {
      // In a real app, you would call an API to resend the verification code
      toast.success(`Verification code resent to your ${verificationType}`);
    } catch (error) {
      toast.error('Failed to resend verification code');
    }
  };

  const canSkip = !needsEmailVerification && !needsPhoneVerification;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              LajoSpaces
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Account</h1>
          <p className="text-gray-600">
            We've sent a verification code to your {verificationType}
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-xl flex items-center justify-center space-x-2">
              {verificationType === 'email' ? (
                <Mail className="h-5 w-5" />
              ) : (
                <Phone className="h-5 w-5" />
              )}
              <span>
                Verify {verificationType === 'email' ? 'Email' : 'Phone Number'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Verification type switcher */}
            {user?.email && user?.phone && (
              <div className="flex space-x-2 mb-6">
                <Button
                  type="button"
                  variant={verificationType === 'email' ? 'default' : 'outline'}
                  onClick={() => setVerificationType('email')}
                  className="flex-1"
                  disabled={isLoading}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                  {user.isEmailVerified && <CheckCircle className="h-4 w-4 ml-2 text-green-500" />}
                </Button>
                <Button
                  type="button"
                  variant={verificationType === 'phone' ? 'default' : 'outline'}
                  onClick={() => setVerificationType('phone')}
                  className="flex-1"
                  disabled={isLoading}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Phone
                  {user.isPhoneVerified && <CheckCircle className="h-4 w-4 ml-2 text-green-500" />}
                </Button>
              </div>
            )}

            {/* Current verification target */}
            <div className="text-center mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Code sent to: <strong>
                  {verificationType === 'email' 
                    ? user?.email 
                    : user?.phone
                  }
                </strong>
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  {...register("verificationCode")}
                  className="text-center text-lg tracking-widest"
                  placeholder="123456"
                  maxLength={6}
                  disabled={isLoading}
                />
                {errors.verificationCode && (
                  <p className="text-sm text-red-600">{errors.verificationCode.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleResendCode}
                disabled={isLoading}
                className="text-sm"
              >
                Didn't receive the code? Resend
              </Button>

              {canSkip && (
                <div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate('/dashboard')}
                    className="text-sm text-gray-500"
                  >
                    Skip for now
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Verify;
