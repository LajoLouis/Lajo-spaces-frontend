import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import {
  DollarSign,
  CreditCard,
  Zap,
  Calendar,
  TrendingUp,
  Info,
  AlertTriangle
} from 'lucide-react';
import { usePropertyForm } from '@/stores/propertyStore';

export const PricingStep: React.FC = () => {
  const { formData, updateFormData, formErrors, setFormErrors } = usePropertyForm();

  const handleNumberChange = (field: string, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    updateFormData({ [field]: numValue });

    // Validate pricing fields
    const errors = { ...formErrors };

    if (field === 'monthlyRent') {
      delete errors.monthlyRent;
      if (numValue !== undefined && numValue <= 0) {
        errors.monthlyRent = ['Monthly rent must be greater than $0'];
      }
    }

    if (field === 'securityDeposit') {
      delete errors.securityDeposit;
      if (numValue !== undefined && numValue < 0) {
        errors.securityDeposit = ['Security deposit cannot be negative'];
      }
    }

    if (field === 'utilitiesCost') {
      delete errors.utilitiesCost;
      if (numValue !== undefined && numValue < 0) {
        errors.utilitiesCost = ['Utilities cost cannot be negative'];
      }
    }

    // Validate stay duration
    if (field === 'minimumStay' || field === 'maximumStay') {
      const minimumStay = field === 'minimumStay' ? numValue : formData.minimumStay;
      const maximumStay = field === 'maximumStay' ? numValue : formData.maximumStay;

      // Clear previous stay errors
      delete errors.minimumStay;
      delete errors.maximumStay;

      // Validate minimum stay
      if (minimumStay !== undefined && minimumStay < 1) {
        errors.minimumStay = ['Minimum stay must be at least 1 month'];
      }

      // Validate maximum stay
      if (maximumStay !== undefined && maximumStay < 1) {
        errors.maximumStay = ['Maximum stay must be at least 1 month'];
      }

      // Validate that maximum stay is greater than minimum stay
      if (minimumStay && maximumStay && maximumStay < minimumStay) {
        errors.maximumStay = ['Maximum stay must be greater than minimum stay'];
      }
    }

    setFormErrors(errors);
  };

  const handleDateChange = (field: string, value: string) => {
    updateFormData({ [field]: value });

    // Validate dates
    const errors = { ...formErrors };

    if (field === 'availableFrom' || field === 'availableUntil') {
      const availableFrom = field === 'availableFrom' ? value : formData.availableFrom;
      const availableUntil = field === 'availableUntil' ? value : formData.availableUntil;

      // Clear previous date errors
      delete errors.availableFrom;
      delete errors.availableUntil;

      // Validate available from date
      if (availableFrom) {
        const fromDate = new Date(availableFrom);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (fromDate < today) {
          errors.availableFrom = ['Available from date cannot be in the past'];
        }
      }

      // Validate available until date
      if (availableFrom && availableUntil) {
        const fromDate = new Date(availableFrom);
        const untilDate = new Date(availableUntil);

        if (untilDate <= fromDate) {
          errors.availableUntil = ['Available until date must be after available from date'];
        }
      }

      setFormErrors(errors);
    }
  };

  return (
    <div className="space-y-8">
      {/* Monthly Rent */}
      <Card className="border-green-100">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">Monthly Rent</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="monthlyRent">Monthly Rent Amount *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="monthlyRent"
                  type="number"
                  min="1"
                  placeholder="1800"
                  value={formData.monthlyRent || ''}
                  onChange={(e) => handleNumberChange('monthlyRent', e.target.value)}
                  className={`pl-10 text-lg font-semibold ${formErrors.monthlyRent ? 'border-red-500' : ''}`}
                />
              </div>
              {formErrors.monthlyRent ? (
                <p className="text-sm text-red-600 mt-1">
                  {formErrors.monthlyRent[0]}
                </p>
              ) : (
                <p className="text-sm text-gray-600 mt-1">
                  Set a competitive price based on similar properties in your area
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="negotiable"
                checked={formData.negotiable || false}
                onCheckedChange={(checked) => updateFormData({ negotiable: !!checked })}
              />
              <Label htmlFor="negotiable" className="text-sm">
                Price is negotiable
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Deposit */}
      <Card className="border-blue-100">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Security Deposit</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="securityDeposit">Security Deposit Amount (Optional)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="securityDeposit"
                  type="number"
                  min="0"
                  placeholder="1800"
                  value={formData.securityDeposit || ''}
                  onChange={(e) => handleNumberChange('securityDeposit', e.target.value)}
                  className={`pl-10 ${formErrors.securityDeposit ? 'border-red-500' : ''}`}
                />
              </div>
              {formErrors.securityDeposit ? (
                <p className="text-sm text-red-600 mt-1">
                  {formErrors.securityDeposit[0]}
                </p>
              ) : (
                <p className="text-sm text-gray-600 mt-1">
                  Typically equal to one month's rent. Leave blank if no deposit required.
                </p>
              )}
            </div>

            {/* Quick Deposit Options */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quick Options:</Label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => updateFormData({ securityDeposit: formData.monthlyRent })}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={!formData.monthlyRent}
                >
                  Same as rent
                </button>
                <button
                  type="button"
                  onClick={() => updateFormData({ securityDeposit: (formData.monthlyRent || 0) * 0.5 })}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={!formData.monthlyRent}
                >
                  Half of rent
                </button>
                <button
                  type="button"
                  onClick={() => updateFormData({ securityDeposit: 0 })}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  No deposit
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Utilities */}
      <Card className="border-yellow-100">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold">Utilities</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="utilitiesIncluded"
                checked={formData.utilitiesIncluded || false}
                onCheckedChange={(checked) => updateFormData({ utilitiesIncluded: !!checked })}
              />
              <Label htmlFor="utilitiesIncluded">
                Utilities are included in rent
              </Label>
            </div>

            {!formData.utilitiesIncluded && (
              <div>
                <Label htmlFor="utilitiesCost">Estimated Monthly Utilities Cost</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="utilitiesCost"
                    type="number"
                    min="0"
                    placeholder="150"
                    value={formData.utilitiesCost || ''}
                    onChange={(e) => handleNumberChange('utilitiesCost', e.target.value)}
                    className={`pl-10 ${formErrors.utilitiesCost ? 'border-red-500' : ''}`}
                  />
                </div>
                {formErrors.utilitiesCost ? (
                  <p className="text-sm text-red-600 mt-1">
                    {formErrors.utilitiesCost[0]}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600 mt-1">
                    Include electricity, gas, water, internet, etc. This helps roommates budget.
                  </p>
                )}
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Typical utilities include:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Electricity and gas</li>
                <li>• Water and sewer</li>
                <li>• Internet and cable</li>
                <li>• Trash and recycling</li>
                <li>• Heating and cooling</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability */}
      <Card className="border-purple-100">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Availability</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="availableFrom">Available From *</Label>
                <Input
                  id="availableFrom"
                  type="date"
                  value={formData.availableFrom || ''}
                  onChange={(e) => handleDateChange('availableFrom', e.target.value)}
                  className={formErrors.availableFrom ? 'border-red-500' : ''}
                  min={new Date().toISOString().split('T')[0]}
                />
                {formErrors.availableFrom && (
                  <p className="text-sm text-red-600 mt-1">
                    {formErrors.availableFrom[0]}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="availableUntil">Available Until (Optional)</Label>
                <Input
                  id="availableUntil"
                  type="date"
                  value={formData.availableUntil || ''}
                  onChange={(e) => handleDateChange('availableUntil', e.target.value)}
                  className={formErrors.availableUntil ? 'border-red-500' : ''}
                  min={formData.availableFrom || new Date().toISOString().split('T')[0]}
                />
                {formErrors.availableUntil ? (
                  <p className="text-sm text-red-600 mt-1">
                    {formErrors.availableUntil[0]}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600 mt-1">
                    Leave blank if no end date
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minimumStay">Minimum Stay (months) *</Label>
                <Input
                  id="minimumStay"
                  type="number"
                  min="1"
                  placeholder="6"
                  value={formData.minimumStay || ''}
                  onChange={(e) => handleNumberChange('minimumStay', e.target.value)}
                  className={formErrors.minimumStay ? 'border-red-500' : ''}
                />
                {formErrors.minimumStay && (
                  <p className="text-sm text-red-600 mt-1">
                    {formErrors.minimumStay[0]}
                  </p>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  Minimum lease duration required
                </p>
              </div>

              <div>
                <Label htmlFor="maximumStay">Maximum Stay (months, optional)</Label>
                <Input
                  id="maximumStay"
                  type="number"
                  min="1"
                  placeholder="12"
                  value={formData.maximumStay || ''}
                  onChange={(e) => handleNumberChange('maximumStay', e.target.value)}
                  className={formErrors.maximumStay ? 'border-red-500' : ''}
                />
                {formErrors.maximumStay ? (
                  <p className="text-sm text-red-600 mt-1">
                    {formErrors.maximumStay[0]}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600 mt-1">
                    Leave blank for no maximum limit
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Summary */}
      {Object.keys(formErrors).length > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-3">Please fix the following issues:</h3>
                <ul className="space-y-1 text-red-800">
                  {Object.entries(formErrors).map(([field, errors]) => (
                    <li key={field} className="flex items-start space-x-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span><strong>{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {errors[0]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <TrendingUp className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-3">💰 Pricing Tips</h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span><strong>Research the market:</strong> Check similar properties in your area to set competitive pricing</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span><strong>Consider all costs:</strong> Factor in utilities, parking, and amenities when setting rent</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span><strong>Be transparent:</strong> Clear pricing builds trust with potential roommates</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span><strong>Flexible terms:</strong> Shorter minimum stays can attract more interest</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span><strong>Required fields:</strong> Monthly rent, available from date, and minimum stay are required to proceed</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Cost Summary */}
      {formData.monthlyRent && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-green-600 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900 mb-3">💡 Cost Summary</h3>
                <div className="space-y-2 text-green-800">
                  <div className="flex justify-between">
                    <span>Monthly Rent:</span>
                    <span className="font-semibold">${formData.monthlyRent}</span>
                  </div>
                  {formData.securityDeposit && (
                    <div className="flex justify-between">
                      <span>Security Deposit:</span>
                      <span className="font-semibold">${formData.securityDeposit}</span>
                    </div>
                  )}
                  {!formData.utilitiesIncluded && formData.utilitiesCost && (
                    <div className="flex justify-between">
                      <span>Est. Utilities:</span>
                      <span className="font-semibold">${formData.utilitiesCost}/month</span>
                    </div>
                  )}
                  <hr className="border-green-300" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Monthly Cost:</span>
                    <span>
                      ${formData.monthlyRent + (formData.utilitiesIncluded ? 0 : (formData.utilitiesCost || 0))}
                    </span>
                  </div>
                  {formData.securityDeposit && (
                    <div className="flex justify-between text-sm">
                      <span>Move-in Cost:</span>
                      <span>
                        ${formData.monthlyRent + formData.securityDeposit + (formData.utilitiesIncluded ? 0 : (formData.utilitiesCost || 0))}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
