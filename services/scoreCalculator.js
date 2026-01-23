class ScoreCalculator {
  calculate(keywordResults, aiResults) {
    // Calculate final score (60% keyword, 40% AI)
    const keywordScore = keywordResults.matchPercentage || 0;
    const aiScore = aiResults.overallScore || 0;

    const finalScore = Math.round((keywordScore * 0.6) + (aiScore * 0.4));

    // Merge aspects
    const aspects = {
      ...keywordResults.aspects,
      ...aiResults.aspects
    };

    // Merge strengths and weaknesses
    const strengths = [
      ...(keywordResults.strengths || []),
      ...(aiResults.strengths || [])
    ].filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates

    const weaknesses = [
      ...(keywordResults.weaknesses || []),
      ...(aiResults.weaknesses || [])
    ].filter((v, i, a) => a.indexOf(v) === i);

    // Generate recommendation
    const recommendation = this.getRecommendation(finalScore);

    // Generate summary
    const summary = aiResults.summary || `Based on comprehensive analysis, your CV shows ${finalScore}% alignment with the job requirements.`;

    return {
      finalScore,
      recommendation,
      breakdown: {
        keywordScore,
        aiScore
      },
      aspects,
      strengths: strengths.slice(0, 8), // Limit to top 8
      weaknesses: weaknesses.slice(0, 8),
      summary
    };
  }

  getRecommendation(score) {
    if (score >= 80) {
      return {
        level: 'Excellent Match',
        message: 'Your CV is an excellent match for this position. You have a strong chance of getting an interview.'
      };
    } else if (score >= 65) {
      return {
        level: 'Good Match',
        message: 'Your CV shows good alignment with the job requirements. Consider highlighting relevant skills more prominently.'
      };
    } else if (score >= 45) {
      return {
        level: 'Moderate Match',
        message: 'Your CV has some relevant qualifications but could be improved to better match the job requirements.'
      };
    } else if (score >= 30) {
      return {
        level: 'Low Match',
        message: 'Your CV shows limited alignment with the job requirements. Consider significant improvements or targeting a different role.'
      };
    } else {
      return {
        level: 'Poor Match',
        message: 'Your CV does not align well with this job. Consider focusing on roles that better match your experience.'
      };
    }
  }
}

module.exports = new ScoreCalculator();