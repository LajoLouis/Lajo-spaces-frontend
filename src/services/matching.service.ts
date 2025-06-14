import { UserProfile } from '@/types/profile.types';
import { 
  CompatibilityBreakdown, 
  CompatibilityDetail, 
  MatchingWeights, 
  DEFAULT_MATCHING_WEIGHTS 
} from '@/types/matching.types';

class MatchingService {
  private weights: MatchingWeights = DEFAULT_MATCHING_WEIGHTS;

  // Calculate overall compatibility score between two profiles
  calculateCompatibility(userProfile: UserProfile, targetProfile: UserProfile): CompatibilityBreakdown {
    const lifestyle = this.calculateLifestyleCompatibility(userProfile, targetProfile);
    const budget = this.calculateBudgetCompatibility(userProfile, targetProfile);
    const location = this.calculateLocationCompatibility(userProfile, targetProfile);
    const preferences = this.calculatePreferencesCompatibility(userProfile, targetProfile);
    const dealBreakers = this.calculateDealBreakers(userProfile, targetProfile);
    const interests = this.calculateInterestsCompatibility(userProfile, targetProfile);
    const age = this.calculateAgeCompatibility(userProfile, targetProfile);

    // Calculate weighted overall score
    const overall = Math.round(
      lifestyle.score * this.weights.lifestyle +
      budget.score * this.weights.budget +
      location.score * this.weights.location +
      preferences.score * this.weights.preferences +
      dealBreakers.score * this.weights.dealBreakers +
      interests.score * this.weights.interests +
      age.score * this.weights.age
    );

    return {
      overall: Math.max(0, Math.min(100, overall)),
      lifestyle: lifestyle.score,
      budget: budget.score,
      location: location.score,
      preferences: preferences.score,
      dealBreakers: dealBreakers.score,
      details: {
        lifestyle: lifestyle.details,
        budget: budget.details,
        location: location.details,
        preferences: preferences.details,
        dealBreakers: dealBreakers.details,
      },
    };
  }

  // Calculate lifestyle compatibility
  private calculateLifestyleCompatibility(user: UserProfile, target: UserProfile): { score: number; details: CompatibilityDetail[] } {
    const details: CompatibilityDetail[] = [];
    let totalScore = 0;
    let factors = 0;

    // Sleep schedule compatibility
    if (user.lifestyle?.sleepSchedule && target.lifestyle?.sleepSchedule) {
      const sleepMatch = user.lifestyle.sleepSchedule === target.lifestyle.sleepSchedule;
      const score = sleepMatch ? 100 : user.lifestyle.sleepSchedule === 'flexible' || target.lifestyle.sleepSchedule === 'flexible' ? 75 : 25;
      
      details.push({
        category: 'Sleep Schedule',
        score,
        reason: sleepMatch ? 'Same sleep schedule' : 'Different sleep schedules',
        isPositive: score >= 50,
      });
      
      totalScore += score;
      factors++;
    }

    // Cleanliness compatibility
    if (user.lifestyle?.cleanliness && target.lifestyle?.cleanliness) {
      const cleanlinessScore = this.calculateEnumCompatibility(
        user.lifestyle.cleanliness,
        target.lifestyle.cleanliness,
        ['very-clean', 'moderately-clean', 'relaxed']
      );
      
      details.push({
        category: 'Cleanliness',
        score: cleanlinessScore,
        reason: cleanlinessScore >= 75 ? 'Similar cleanliness standards' : 'Different cleanliness preferences',
        isPositive: cleanlinessScore >= 50,
      });
      
      totalScore += cleanlinessScore;
      factors++;
    }

    // Social level compatibility
    if (user.lifestyle?.socialLevel && target.lifestyle?.socialLevel) {
      const socialScore = this.calculateEnumCompatibility(
        user.lifestyle.socialLevel,
        target.lifestyle.socialLevel,
        ['very-social', 'moderately-social', 'prefer-quiet']
      );
      
      details.push({
        category: 'Social Level',
        score: socialScore,
        reason: socialScore >= 75 ? 'Compatible social preferences' : 'Different social needs',
        isPositive: socialScore >= 50,
      });
      
      totalScore += socialScore;
      factors++;
    }

    // Work from home compatibility
    if (user.lifestyle?.workFromHome !== undefined && target.lifestyle?.workFromHome !== undefined) {
      const wfhScore = user.lifestyle.workFromHome === target.lifestyle.workFromHome ? 100 : 60;
      
      details.push({
        category: 'Work From Home',
        score: wfhScore,
        reason: wfhScore === 100 ? 'Same work arrangement' : 'Different work arrangements',
        isPositive: wfhScore >= 50,
      });
      
      totalScore += wfhScore;
      factors++;
    }

    return {
      score: factors > 0 ? Math.round(totalScore / factors) : 50,
      details,
    };
  }

  // Calculate budget compatibility
  private calculateBudgetCompatibility(user: UserProfile, target: UserProfile): { score: number; details: CompatibilityDetail[] } {
    const details: CompatibilityDetail[] = [];
    
    if (!user.roommate?.budgetRange || !target.roommate?.budgetRange) {
      return { score: 50, details: [] };
    }

    const userMin = user.roommate.budgetRange.min;
    const userMax = user.roommate.budgetRange.max;
    const targetMin = target.roommate.budgetRange.min;
    const targetMax = target.roommate.budgetRange.max;

    // Calculate overlap
    const overlapMin = Math.max(userMin, targetMin);
    const overlapMax = Math.min(userMax, targetMax);
    const hasOverlap = overlapMin <= overlapMax;

    let score = 0;
    if (hasOverlap) {
      const overlapSize = overlapMax - overlapMin;
      const userRange = userMax - userMin;
      const targetRange = targetMax - targetMin;
      const avgRange = (userRange + targetRange) / 2;
      score = Math.round((overlapSize / avgRange) * 100);
    } else {
      // Calculate how far apart they are
      const gap = Math.min(Math.abs(userMax - targetMin), Math.abs(targetMax - userMin));
      const avgBudget = (userMin + userMax + targetMin + targetMax) / 4;
      score = Math.max(0, 100 - (gap / avgBudget) * 100);
    }

    details.push({
      category: 'Budget Range',
      score,
      reason: hasOverlap 
        ? `Budget ranges overlap ($${overlapMin}-$${overlapMax})`
        : `Budget ranges don't overlap`,
      isPositive: score >= 50,
    });

    return { score: Math.min(100, score), details };
  }

  // Calculate location compatibility (simplified - would use real coordinates in production)
  private calculateLocationCompatibility(user: UserProfile, target: UserProfile): { score: number; details: CompatibilityDetail[] } {
    const details: CompatibilityDetail[] = [];
    
    if (!user.location?.city || !target.location?.city) {
      return { score: 50, details: [] };
    }

    // Simple city/state matching (in real app, would use coordinates and distance)
    const sameCity = user.location.city.toLowerCase() === target.location.city.toLowerCase();
    const sameState = user.location.state?.toLowerCase() === target.location.state?.toLowerCase();

    let score = 0;
    let reason = '';

    if (sameCity) {
      score = 100;
      reason = 'Same city';
    } else if (sameState) {
      score = 75;
      reason = 'Same state';
    } else {
      score = 25;
      reason = 'Different locations';
    }

    details.push({
      category: 'Location',
      score,
      reason,
      isPositive: score >= 50,
    });

    return { score, details };
  }

  // Calculate preferences compatibility
  private calculatePreferencesCompatibility(user: UserProfile, target: UserProfile): { score: number; details: CompatibilityDetail[] } {
    const details: CompatibilityDetail[] = [];
    let totalScore = 0;
    let factors = 0;

    // Age preference compatibility
    if (user.roommate?.ageRange && target.dateOfBirth) {
      const targetAge = new Date().getFullYear() - new Date(target.dateOfBirth).getFullYear();
      const ageMatch = targetAge >= user.roommate.ageRange.min && targetAge <= user.roommate.ageRange.max;
      const ageScore = ageMatch ? 100 : 25;
      
      details.push({
        category: 'Age Preference',
        score: ageScore,
        reason: ageMatch ? 'Age matches your preference' : 'Age outside your preferred range',
        isPositive: ageScore >= 50,
      });
      
      totalScore += ageScore;
      factors++;
    }

    // Gender preference compatibility
    if (user.roommate?.genderPreference && target.gender) {
      const genderMatch = user.roommate.genderPreference === 'no-preference' || 
                          user.roommate.genderPreference === target.gender;
      const genderScore = genderMatch ? 100 : 0;
      
      details.push({
        category: 'Gender Preference',
        score: genderScore,
        reason: genderMatch ? 'Gender matches your preference' : 'Gender doesn\'t match preference',
        isPositive: genderScore >= 50,
      });
      
      totalScore += genderScore;
      factors++;
    }

    // Housing type compatibility
    if (user.roommate?.housingType && target.roommate?.housingType) {
      const commonTypes = user.roommate.housingType.filter(type => 
        target.roommate?.housingType?.includes(type)
      );
      const housingScore = commonTypes.length > 0 ? 
        Math.round((commonTypes.length / Math.max(user.roommate.housingType.length, target.roommate.housingType.length)) * 100) : 25;
      
      details.push({
        category: 'Housing Type',
        score: housingScore,
        reason: commonTypes.length > 0 ? 
          `Compatible housing preferences (${commonTypes.join(', ')})` : 
          'No common housing preferences',
        isPositive: housingScore >= 50,
      });
      
      totalScore += housingScore;
      factors++;
    }

    return {
      score: factors > 0 ? Math.round(totalScore / factors) : 50,
      details,
    };
  }

  // Calculate deal breakers
  private calculateDealBreakers(user: UserProfile, target: UserProfile): { score: number; details: CompatibilityDetail[] } {
    const details: CompatibilityDetail[] = [];
    let violations = 0;
    let totalChecks = 0;

    if (!user.roommate?.dealBreakers || !target.lifestyle) {
      return { score: 100, details: [] };
    }

    // Check smoking deal breaker
    if (user.roommate.dealBreakers.smoking) {
      totalChecks++;
      const targetSmoker = target.lifestyle.smoking === 'smoker' || target.lifestyle.smoking === 'social-smoker';
      if (targetSmoker) {
        violations++;
        details.push({
          category: 'Smoking',
          score: 0,
          reason: 'Deal breaker: They smoke',
          isPositive: false,
        });
      }
    }

    // Check pets deal breaker
    if (user.roommate.dealBreakers.pets) {
      totalChecks++;
      const targetHasPets = target.lifestyle.pets === 'have-pets';
      if (targetHasPets) {
        violations++;
        details.push({
          category: 'Pets',
          score: 0,
          reason: 'Deal breaker: They have pets',
          isPositive: false,
        });
      }
    }

    // Calculate score (0 if any violations, 100 if none)
    const score = violations > 0 ? 0 : 100;

    if (violations === 0 && totalChecks > 0) {
      details.push({
        category: 'Deal Breakers',
        score: 100,
        reason: 'No deal breaker violations',
        isPositive: true,
      });
    }

    return { score, details };
  }

  // Calculate interests compatibility
  private calculateInterestsCompatibility(user: UserProfile, target: UserProfile): { score: number; details: CompatibilityDetail[] } {
    const details: CompatibilityDetail[] = [];
    
    if (!user.interests || !target.interests || user.interests.length === 0 || target.interests.length === 0) {
      return { score: 50, details: [] };
    }

    const commonInterests = user.interests.filter(interest => target.interests?.includes(interest));
    const totalInterests = new Set([...user.interests, ...target.interests]).size;
    const score = Math.round((commonInterests.length / Math.min(user.interests.length, target.interests.length)) * 100);

    details.push({
      category: 'Common Interests',
      score,
      reason: commonInterests.length > 0 ? 
        `${commonInterests.length} shared interests: ${commonInterests.slice(0, 3).join(', ')}${commonInterests.length > 3 ? '...' : ''}` :
        'No common interests found',
      isPositive: score >= 50,
    });

    return { score, details };
  }

  // Calculate age compatibility
  private calculateAgeCompatibility(user: UserProfile, target: UserProfile): { score: number; details: CompatibilityDetail[] } {
    const details: CompatibilityDetail[] = [];
    
    if (!user.dateOfBirth || !target.dateOfBirth) {
      return { score: 50, details: [] };
    }

    const userAge = new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear();
    const targetAge = new Date().getFullYear() - new Date(target.dateOfBirth).getFullYear();
    const ageDiff = Math.abs(userAge - targetAge);

    let score = 100;
    if (ageDiff <= 2) score = 100;
    else if (ageDiff <= 5) score = 85;
    else if (ageDiff <= 10) score = 70;
    else if (ageDiff <= 15) score = 50;
    else score = 25;

    details.push({
      category: 'Age Compatibility',
      score,
      reason: `${ageDiff} year age difference`,
      isPositive: score >= 50,
    });

    return { score, details };
  }

  // Helper method for enum compatibility calculation
  private calculateEnumCompatibility(value1: string, value2: string, orderedValues: string[]): number {
    const index1 = orderedValues.indexOf(value1);
    const index2 = orderedValues.indexOf(value2);
    
    if (index1 === -1 || index2 === -1) return 50;
    if (index1 === index2) return 100;
    
    const maxDistance = orderedValues.length - 1;
    const distance = Math.abs(index1 - index2);
    return Math.round(100 - (distance / maxDistance) * 75);
  }

  // Update matching weights
  setWeights(weights: Partial<MatchingWeights>): void {
    this.weights = { ...this.weights, ...weights };
  }

  // Get current weights
  getWeights(): MatchingWeights {
    return { ...this.weights };
  }
}

// Create and export singleton instance
export const matchingService = new MatchingService();
export default matchingService;
