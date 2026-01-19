const weights = require('../config/weights.config');

/**
 * Score Calculator Service
 * Combines keyword matching and AI analysis scores
 */
class ScoreCalculator {

  /**
   * Calculate final interview chance score
   * @param {object} keywordResults - Results from keyword matching
   * @param {object} aiResults - Results from AI analysis
   * @returns {object} - Final calculated scores and breakdown
   */
  calculate(keywordResults, aiResults) {
    try {
      // Get individual scores
      const keywordScore = keywordResults.score;
      const aiScore = aiResults.overallScore;
      
      // Apply configured weights
      const finalScore = this.calculateWeightedScore(keywordScore, aiScore);
      
      // Determine recommendation level
      const recommendation = this.getRecommendation(finalScore);
      
      // Combine strengths and weaknesses
      const strengths = this.extractStrengths(keywordResults, aiResults);
      const weaknesses = this.extractWeaknesses(keywordResults, aiResults);
      
      return {
        finalScore: Math.round(finalScore),
        recommendation,
        breakdown: {
          keywordScore: Math.round(keywordScore),
          aiScore: Math.round(aiScore),
          weights: {
            keyword: weights.scoring.keywordWeight,
            ai: weights.scoring.aiWeight
          }
        },
        aspects: {
          skillsMatch: {
            score: aiResults.aspects.skillsMatch.score,
            weight: weights.aspects.skillsMatch,
            feedback: aiResults.aspects.skillsMatch.analysis
          },
          experienceQuality: {
            score: aiResults.aspects.experienceQuality.score,
            weight: weights.aspects.experienceQuality,
            feedback: aiResults.aspects.experienceQuality.analysis
          },
          educationFit: {
            score: aiResults.aspects.educationFit.score,
            weight: weights.aspects.educationFit,
            feedback: aiResults.aspects.educationFit.analysis
          },
          careerGrowth: {
            score: aiResults.aspects.careerGrowth.score,
            weight: weights.aspects.careerGrowth,
            feedback: aiResults.aspects.careerGrowth.analysis
          }
        },
        strengths,
        weaknesses,
        summary: aiResults.assessment.summary,
        detailedAssessment: aiResults.assessment
      };
      
    } catch (error) {
      throw new Error(`Score calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate weighted score from keyword and AI scores
   * @param {number} keywordScore - Keyword matching score
   * @param {number} aiScore - AI analysis score
   * @returns {number} - Final weighted score
   */
  calculateWeightedScore(keywordScore, aiScore) {
    const weightedScore = 
      (keywordScore * weights.scoring.keywordWeight) +
      (aiScore * weights.scoring.aiWeight);
    
    // Ensure score is between 0-100
    return Math.max(0, Math.min(100, weightedScore));
  }

  /**
   * Get recommendation based on final score
   * @param {number} score - Final score
   * @returns {object} - Recommendation details
   */
  getRecommendation(score) {
    const thresholds = weights.thresholds;
    
    if (score >= thresholds.excellent) {
      return {
        level: 'Excellent',
        message: 'Strong candidate - highly recommended for interview',
        color: 'green'
      };
    } else if (score >= thresholds.good) {
      return {
        level: 'Good',
        message: 'Good candidate - recommended for interview',
        color: 'blue'
      };
    } else if (score >= thresholds.moderate) {
      return {
        level: 'Moderate',
        message: 'Moderate fit - consider for interview if positions available',
        color: 'yellow'
      };
    } else if (score >= thresholds.low) {
      return {
        level: 'Low',
        message: 'Weak candidate - not recommended unless desperate',
        color: 'orange'
      };
    } else {
      return {
        level: 'Very Low',
        message: 'Very weak candidate - do not recommend for interview',
        color: 'red'
      };
    }
  }

  /**
   * Extract and combine strengths from both analyses
   * @param {object} keywordResults - Keyword matching results
   * @param {object} aiResults - AI analysis results
   * @returns {array} - List of strengths
   */
  extractStrengths(keywordResults, aiResults) {
    const strengths = [];
    
    // From keyword matching
    if (keywordResults.matchedSkills && keywordResults.matchedSkills.length > 0) {
      const topSkills = keywordResults.matchedSkills.slice(0, 5);
      strengths.push(`Matches ${keywordResults.matchedSkills.length} required skills including: ${topSkills.join(', ')}`);
    }
    
    // From AI analysis
    if (aiResults.aspects.skillsMatch.matches && aiResults.aspects.skillsMatch.matches.length > 0) {
      aiResults.aspects.skillsMatch.matches.slice(0, 3).forEach(match => {
        if (!strengths.some(s => s.toLowerCase().includes(match.toLowerCase()))) {
          strengths.push(match);
        }
      });
    }
    
    if (aiResults.aspects.experienceQuality.strengths) {
      aiResults.aspects.experienceQuality.strengths.forEach(strength => {
        strengths.push(strength);
      });
    }
    
    if (aiResults.assessment.keyStrengths) {
      aiResults.assessment.keyStrengths.forEach(strength => {
        if (!strengths.some(s => s.toLowerCase().includes(strength.toLowerCase()))) {
          strengths.push(strength);
        }
      });
    }
    
    return strengths.slice(0, 8); // Return top 8 strengths
  }

  /**
   * Extract and combine weaknesses from both analyses
   * @param {object} keywordResults - Keyword matching results
   * @param {object} aiResults - AI analysis results
   * @returns {array} - List of weaknesses
   */
  extractWeaknesses(keywordResults, aiResults) {
    const weaknesses = [];
    
    // From keyword matching
    if (keywordResults.missingSkills && keywordResults.missingSkills.length > 0) {
      weaknesses.push(`Missing ${keywordResults.missingSkills.length} required skills: ${keywordResults.missingSkills.slice(0, 5).join(', ')}`);
    }
    
    // From AI analysis
    if (aiResults.aspects.skillsMatch.missing && aiResults.aspects.skillsMatch.missing.length > 0) {
      aiResults.aspects.skillsMatch.missing.slice(0, 3).forEach(missing => {
        if (!weaknesses.some(w => w.toLowerCase().includes(missing.toLowerCase()))) {
          weaknesses.push(`Lacks: ${missing}`);
        }
      });
    }
    
    if (aiResults.aspects.experienceQuality.weaknesses) {
      aiResults.aspects.experienceQuality.weaknesses.forEach(weakness => {
        weaknesses.push(weakness);
      });
    }
    
    if (aiResults.assessment.keyWeaknesses) {
      aiResults.assessment.keyWeaknesses.forEach(weakness => {
        if (!weaknesses.some(w => w.toLowerCase().includes(weakness.toLowerCase()))) {
          weaknesses.push(weakness);
        }
      });
    }
    
    // Add red flags if present
    if (aiResults.assessment.redFlags && aiResults.assessment.redFlags.length > 0) {
      aiResults.assessment.redFlags.forEach(flag => {
        weaknesses.push(`⚠️ ${flag}`);
      });
    }
    
    return weaknesses.slice(0, 8); // Return top 8 weaknesses
  }

  /**
   * Generate a comparison report for A/B testing
   * @param {object} keywordResults - Keyword matching results
   * @param {object} aiResults - AI analysis results
   * @returns {object} - Comparison data
   */
  generateABComparison(keywordResults, aiResults) {
    return {
      methodA_Keywords: {
        score: keywordResults.score,
        approach: 'Rule-based keyword matching',
        strengths: [
          'Fast and deterministic',
          'Easy to understand',
          'No API costs'
        ],
        limitations: [
          'Misses context and nuance',
          'Cannot judge quality of experience',
          'Simple pattern matching only'
        ]
      },
      methodB_AI: {
        score: aiResults.overallScore,
        approach: 'Deep AI analysis with Claude',
        strengths: [
          'Understands context and nuance',
          'Judges quality not just presence',
          'Provides detailed reasoning'
        ],
        limitations: [
          'Slower (API call)',
          'Costs money per analysis',
          'Requires API key'
        ]
      },
      scoreDifference: Math.abs(keywordResults.score - aiResults.overallScore),
      agreement: Math.abs(keywordResults.score - aiResults.overallScore) < 15 ? 'High' : 'Low'
    };
  }
}

module.exports = new ScoreCalculator();
