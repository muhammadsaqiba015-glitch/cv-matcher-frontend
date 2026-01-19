/**
 * Scoring Weights Configuration
 * 
 * Adjust these values to change how the system calculates interview chances.
 * All weights should be between 0 and 1, and related weights should sum to 1.
 */

module.exports = {
  // ============================================
  // MAIN SCORING WEIGHTS (Must sum to 1.0)
  // ============================================
  scoring: {
    keywordWeight: 0.3,     // Weight for keyword matching score
    aiWeight: 0.7           // Weight for AI analysis score
  },

  // ============================================
  // AI ANALYSIS ASPECT WEIGHTS (Must sum to 1.0)
  // ============================================
  aspects: {
    skillsMatch: 0.35,           // Technical & soft skills alignment
    experienceQuality: 0.30,     // Quality and relevance of experience
    educationFit: 0.15,          // Education requirements match
    careerGrowth: 0.20           // Career trajectory and progression
  },

  // ============================================
  // KEYWORD MATCHING RULES
  // ============================================
  keywords: {
    exactMatchPoints: 10,        // Points for exact skill match
    partialMatchPoints: 5,       // Points for partial/related skill match
    missingRequiredPenalty: -8,  // Penalty for missing required skills
    
    // Minimum scores
    minKeywordScore: 0,          // Floor for keyword score
    maxKeywordScore: 100         // Ceiling for keyword score
  },

  // ============================================
  // EXPERIENCE WEIGHTING
  // ============================================
  experience: {
    // Years of experience multipliers
    lessThanRequired: 0.6,       // Multiplier if less experience than required
    meetsRequirement: 1.0,       // Multiplier if meets experience requirement
    exceedsRequirement: 1.2      // Multiplier if exceeds requirement (bonus)
  },

  // ============================================
  // INTERVIEW CHANCE THRESHOLDS
  // ============================================
  thresholds: {
    excellent: 80,               // >= 80% = Excellent chance
    good: 65,                    // >= 65% = Good chance
    moderate: 45,                // >= 45% = Moderate chance
    low: 30,                     // >= 30% = Low chance
    veryLow: 0                   // < 30% = Very low chance
  }
};
