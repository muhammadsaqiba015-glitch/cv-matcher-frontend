class ScoreCalculator {
  constructor() {
    this.weights = {
      keyword: 0.6,  // 60% weight for keyword matching
      ai: 0.4        // 40% weight for AI analysis
    };
  }

  calculate(keywordResults, aiResults) {
    // Calculate final score (60% keyword, 40% AI)
    const keywordScore = keywordResults.matchPercentage || 0;
    const aiScore = aiResults.overallScore || 0;

    const finalScore = Math.round((keywordScore * this.weights.keyword) + (aiScore * this.weights.ai));

    // Merge aspects from both analyses
    const aspects = {
      ...keywordResults.aspects,
      ...aiResults.aspects
    };

    // IMPORTANT: Properly merge strengths and weaknesses
    // Ensure we always have arrays, even if empty
    const keywordStrengths = Array.isArray(keywordResults.strengths) ? keywordResults.strengths : [];
    const aiStrengths = Array.isArray(aiResults.strengths) ? aiResults.strengths : [];
    const keywordWeaknesses = Array.isArray(keywordResults.weaknesses) ? keywordResults.weaknesses : [];
    const aiWeaknesses = Array.isArray(aiResults.weaknesses) ? aiResults.weaknesses : [];

    // Combine and remove duplicates
    const strengths = [...new Set([...keywordStrengths, ...aiStrengths])].filter(s => s && s.trim());
    const weaknesses = [...new Set([...keywordWeaknesses, ...aiWeaknesses])].filter(w => w && w.trim());

    // Generate recommendation based on score
    const recommendation = this.getRecommendation(finalScore);

    // Generate summary
    const summary = aiResults.summary || this.generateSummary(finalScore, strengths.length, weaknesses.length);

    // Get detailed assessment
    const detailedAssessment = aiResults.detailedAssessment || '';

    return {
      finalScore,
      interviewChance: finalScore, // Alias for frontend compatibility
      recommendation,
      breakdown: {
        keywordScore: Math.round(keywordScore),
        aiScore: Math.round(aiScore)
      },
      aspects,
      strengths: strengths.slice(0, 10), // Limit to top 10
      weaknesses: weaknesses.slice(0, 10), // Limit to top 10
      summary,
      detailedAssessment
    };
  }

  generateSummary(score, strengthCount, weaknessCount) {
    if (score >= 80) {
      return `Excellent match! Your CV demonstrates strong alignment with the job requirements with ${strengthCount} key strengths identified.`;
    } else if (score >= 65) {
      return `Good match with room for improvement. You have ${strengthCount} strengths but ${weaknessCount} areas need attention.`;
    } else if (score >= 45) {
      return `Moderate match. While you have some relevant experience, there are ${weaknessCount} significant gaps to address.`;
    } else if (score >= 30) {
      return `Limited match. Your CV shows ${weaknessCount} major gaps compared to the job requirements.`;
    } else {
      return `Poor match. Consider significant CV improvements or targeting roles that better match your current experience.`;
    }
  }

  getRecommendation(score) {
    if (score >= 80) {
      return {
        level: 'Excellent Match',
        message: 'Your CV is an excellent match for this position. You have a strong chance of getting an interview. Submit your application with confidence!'
      };
    } else if (score >= 65) {
      return {
        level: 'Good Match',
        message: 'Your CV shows good alignment with the job requirements. Consider highlighting relevant skills more prominently and addressing any gaps before applying.'
      };
    } else if (score >= 45) {
      return {
        level: 'Moderate Match',
        message: 'Your CV has some relevant qualifications but could be significantly improved. Consider using our optimization feature to better match the job requirements.'
      };
    } else if (score >= 30) {
      return {
        level: 'Low Match',
        message: 'Your CV shows limited alignment with the job requirements. We strongly recommend optimizing your CV or considering a different role that better matches your experience.'
      };
    } else {
      return {
        level: 'Poor Match',
        message: 'Your CV does not align well with this job. Consider focusing on roles that better match your current experience or significantly updating your CV.'
      };
    }
  }

  generateABComparison(keywordResults, aiResults) {
    return {
      methodA: {
        name: 'Keyword Matching',
        score: keywordResults.matchPercentage || 0,
        description: 'Pattern-based analysis of keywords and phrases'
      },
      methodB: {
        name: 'AI Analysis',
        score: aiResults.overallScore || 0,
        description: 'Claude AI semantic understanding and context analysis'
      },
      difference: Math.abs((keywordResults.matchPercentage || 0) - (aiResults.overallScore || 0)),
      recommendation: this.getMethodRecommendation(keywordResults.matchPercentage, aiResults.overallScore)
    };
  }

  getMethodRecommendation(keywordScore, aiScore) {
    const diff = Math.abs((keywordScore || 0) - (aiScore || 0));

    if (diff <= 10) {
      return 'Both methods agree - high confidence in the score.';
    } else if (keywordScore > aiScore) {
      return 'Keywords match well but AI detected contextual gaps. Focus on demonstrating practical experience.';
    } else {
      return 'AI found good contextual fit despite keyword gaps. Consider adding more relevant keywords to your CV.';
    }
  }
}

module.exports = new ScoreCalculator();