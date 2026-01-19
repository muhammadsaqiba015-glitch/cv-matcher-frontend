const weights = require('../config/weights.config');

/**
 * Keyword Matching Service
 * Phase 1: Extract and match keywords between JD and CV
 */
class KeywordMatcher {

  /**
   * Analyze CV against Job Description using keyword matching
   * @param {string} jobDescription - The job description text
   * @param {string} cvText - The CV text
   * @returns {object} - Keyword matching results
   */
  analyze(jobDescription, cvText) {
    try {
      // Extract keywords from JD
      const jdKeywords = this.extractKeywords(jobDescription);
      
      // Find matches in CV
      const matches = this.findMatches(jdKeywords, cvText);
      
      // Calculate score
      const score = this.calculateScore(matches, jdKeywords);
      
      return {
        score: Math.max(
          weights.keywords.minKeywordScore,
          Math.min(score, weights.keywords.maxKeywordScore)
        ),
        breakdown: matches,
        totalRequired: jdKeywords.skills.required.length + jdKeywords.skills.preferred.length,
        totalMatched: matches.exactMatches.length + matches.partialMatches.length,
        matchedSkills: [...matches.exactMatches, ...matches.partialMatches],
        missingSkills: matches.missingSkills
      };
    } catch (error) {
      throw new Error(`Keyword matching failed: ${error.message}`);
    }
  }

  /**
   * Extract keywords from job description
   * @param {string} text - Job description text
   * @returns {object} - Extracted keywords
   */
  extractKeywords(text) {
    const lowercaseText = text.toLowerCase();
    
    // Common technical skills patterns
    const technicalSkills = [
      'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'php',
      'react', 'vue', 'angular', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel',
      'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins',
      'git', 'github', 'gitlab', 'ci/cd', 'devops', 'agile', 'scrum',
      'rest api', 'graphql', 'microservices', 'serverless',
      'machine learning', 'ai', 'deep learning', 'nlp', 'computer vision',
      'html', 'css', 'sass', 'tailwind', 'bootstrap',
      'testing', 'jest', 'pytest', 'selenium', 'cypress',
      'supabase', 'firebase', 'amplify'
    ];
    
    // Soft skills patterns
    const softSkills = [
      'leadership', 'communication', 'teamwork', 'problem solving',
      'analytical', 'critical thinking', 'project management',
      'collaboration', 'mentoring', 'presentation'
    ];
    
    // Education patterns
    const educationPatterns = [
      'bachelor', 'master', 'phd', 'degree', 'diploma',
      'computer science', 'engineering', 'mba'
    ];
    
    const foundSkills = {
      required: [],
      preferred: []
    };
    
    // Check for required vs preferred indicators
    const requiredIndicators = ['required', 'must have', 'mandatory', 'essential'];
    const preferredIndicators = ['preferred', 'nice to have', 'bonus', 'plus'];
    
    // Extract technical skills
    technicalSkills.forEach(skill => {
      if (lowercaseText.includes(skill)) {
        // Determine if required or preferred based on context
        const isRequired = requiredIndicators.some(indicator => 
          lowercaseText.includes(`${indicator}`) && 
          lowercaseText.indexOf(skill) > lowercaseText.indexOf(indicator) - 200
        );
        
        if (isRequired || !preferredIndicators.some(ind => lowercaseText.includes(ind))) {
          foundSkills.required.push(skill);
        } else {
          foundSkills.preferred.push(skill);
        }
      }
    });
    
    // Extract soft skills
    const foundSoftSkills = softSkills.filter(skill => 
      lowercaseText.includes(skill)
    );
    
    // Extract education requirements
    const foundEducation = educationPatterns.filter(pattern =>
      lowercaseText.includes(pattern)
    );
    
    // Extract years of experience
    const yearsMatch = text.match(/(\d+)\+?\s*years?/i);
    const yearsRequired = yearsMatch ? parseInt(yearsMatch[1]) : null;
    
    return {
      skills: foundSkills,
      softSkills: foundSoftSkills,
      education: foundEducation,
      yearsRequired
    };
  }

  /**
   * Find matches between JD keywords and CV
   * @param {object} jdKeywords - Extracted JD keywords
   * @param {string} cvText - CV text
   * @returns {object} - Match results
   */
  findMatches(jdKeywords, cvText) {
    const lowercaseCv = cvText.toLowerCase();
    const allSkills = [...jdKeywords.skills.required, ...jdKeywords.skills.preferred];
    
    const exactMatches = [];
    const partialMatches = [];
    const missingSkills = [];
    
    allSkills.forEach(skill => {
      if (lowercaseCv.includes(skill)) {
        exactMatches.push(skill);
      } else {
        // Check for partial matches (related skills)
        const related = this.findRelatedSkills(skill, lowercaseCv);
        if (related.length > 0) {
          partialMatches.push({ skill, related });
        } else {
          missingSkills.push(skill);
        }
      }
    });
    
    // Check years of experience
    const cvYearsMatch = cvText.match(/(\d+)\+?\s*years?/i);
    const cvYears = cvYearsMatch ? parseInt(cvYearsMatch[1]) : 0;
    
    const experienceMatch = jdKeywords.yearsRequired 
      ? cvYears >= jdKeywords.yearsRequired
      : true;
    
    return {
      exactMatches,
      partialMatches,
      missingSkills,
      experienceMatch,
      cvYears,
      requiredYears: jdKeywords.yearsRequired
    };
  }

  /**
   * Find related skills (e.g., React -> ReactJS)
   * @param {string} skill - The skill to find related terms for
   * @param {string} text - Text to search in
   * @returns {array} - Related skills found
   */
  findRelatedSkills(skill, text) {
    const skillRelations = {
      'react': ['reactjs', 'react.js', 'react native'],
      'node.js': ['nodejs', 'node js'],
      'javascript': ['js', 'ecmascript'],
      'typescript': ['ts'],
      'python': ['py'],
      'postgresql': ['postgres'],
      'mongodb': ['mongo'],
      'aws': ['amazon web services'],
      'gcp': ['google cloud'],
      'ci/cd': ['continuous integration', 'continuous deployment']
    };
    
    const related = skillRelations[skill] || [];
    return related.filter(relatedSkill => text.includes(relatedSkill));
  }

  /**
   * Calculate keyword matching score
   * @param {object} matches - Match results
   * @param {object} jdKeywords - JD keywords
   * @returns {number} - Score (0-100)
   */
  calculateScore(matches, jdKeywords) {
    let score = 50; // Start at baseline
    
    // Add points for exact matches
    score += matches.exactMatches.length * weights.keywords.exactMatchPoints;
    
    // Add points for partial matches
    score += matches.partialMatches.length * weights.keywords.partialMatchPoints;
    
    // Subtract points for missing required skills
    const missingRequired = matches.missingSkills.filter(skill =>
      jdKeywords.skills.required.includes(skill)
    );
    score += missingRequired.length * weights.keywords.missingRequiredPenalty;
    
    // Experience multiplier
    if (jdKeywords.yearsRequired && matches.cvYears) {
      if (matches.cvYears < jdKeywords.yearsRequired) {
        score *= weights.experience.lessThanRequired;
      } else if (matches.cvYears >= jdKeywords.yearsRequired * 1.5) {
        score *= weights.experience.exceedsRequirement;
      } else {
        score *= weights.experience.meetsRequirement;
      }
    }
    
    return Math.round(score);
  }
}

module.exports = new KeywordMatcher();
