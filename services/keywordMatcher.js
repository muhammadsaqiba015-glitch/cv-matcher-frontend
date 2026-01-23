class KeywordMatcher {
  constructor() {
    this.stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been',
      'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'to', 'of', 'in',
      'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further',
      'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each',
      'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
      'own', 'same', 'so', 'than', 'too', 'very', 'just', 'also', 'now', 'etc',
      'we', 'you', 'your', 'our', 'their', 'its', 'his', 'her', 'this', 'that',
      'these', 'those', 'i', 'me', 'my', 'myself', 'he', 'she', 'it', 'they', 'them',
      'what', 'which', 'who', 'whom', 'if', 'while', 'about', 'against', 'any',
      'both', 'either', 'neither', 'because', 'until', 'unless', 'since', 'although'
    ]);
  }

  analyze(jdText, cvText) {
    // Extract keywords from job description
    const jdKeywords = this.extractKeywords(jdText);
    const cvKeywords = this.extractKeywords(cvText);
    const cvTextLower = cvText.toLowerCase();

    // Find matches
    const matched = [];
    const missing = [];

    jdKeywords.forEach(keyword => {
      if (cvKeywords.has(keyword) || cvTextLower.includes(keyword.toLowerCase())) {
        matched.push(keyword);
      } else {
        missing.push(keyword);
      }
    });

    // Calculate match percentage
    const totalKeywords = jdKeywords.size;
    const matchedCount = matched.length;
    const matchPercentage = totalKeywords > 0 ? Math.round((matchedCount / totalKeywords) * 100) : 0;

    // Generate strengths based on matched keywords
    const strengths = this.generateStrengths(matched);

    // Generate weaknesses based on missing keywords
    const weaknesses = this.generateWeaknesses(missing);

    // Analyze specific aspects
    const aspects = this.analyzeAspects(jdText, cvText);

    return {
      matchPercentage,
      totalKeywords,
      matchedCount,
      matched: matched.slice(0, 20), // Top 20 matched
      missing: missing.slice(0, 20), // Top 20 missing
      strengths,
      weaknesses,
      aspects
    };
  }

  extractKeywords(text) {
    // Normalize text
    const normalized = text.toLowerCase()
      .replace(/[^\w\s\+\#\.]/g, ' ')
      .replace(/\s+/g, ' ');

    const words = normalized.split(' ');
    const keywords = new Set();

    // Extract single words (excluding stop words)
    words.forEach(word => {
      if (word.length >= 2 && !this.stopWords.has(word)) {
        keywords.add(word);
      }
    });

    // Extract common tech terms and phrases
    const techPatterns = [
      /javascript/gi, /typescript/gi, /python/gi, /java\b/gi, /c\+\+/gi, /c#/gi,
      /react/gi, /angular/gi, /vue/gi, /node\.?js/gi, /express/gi, /next\.?js/gi,
      /aws/gi, /azure/gi, /gcp/gi, /docker/gi, /kubernetes/gi, /k8s/gi,
      /sql/gi, /nosql/gi, /mongodb/gi, /postgresql/gi, /mysql/gi, /redis/gi,
      /git/gi, /github/gi, /gitlab/gi, /ci\/cd/gi, /devops/gi, /agile/gi,
      /scrum/gi, /rest\s?api/gi, /graphql/gi, /microservices/gi,
      /machine\s?learning/gi, /deep\s?learning/gi, /ai\b/gi, /ml\b/gi,
      /html/gi, /css/gi, /sass/gi, /tailwind/gi, /bootstrap/gi,
      /flutter/gi, /react\s?native/gi, /swift/gi, /kotlin/gi,
      /project\s?management/gi, /leadership/gi, /communication/gi,
      /problem[\s-]?solving/gi, /team\s?work/gi, /analytical/gi,
      /data\s?analysis/gi, /data\s?science/gi, /business\s?intelligence/gi,
      /excel/gi, /powerpoint/gi, /tableau/gi, /power\s?bi/gi,
      /bachelor/gi, /master/gi, /phd/gi, /degree/gi, /certification/gi,
      /years?\s?(of\s)?experience/gi, /senior/gi, /junior/gi, /lead/gi, /manager/gi
    ];

    techPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => keywords.add(match.toLowerCase().trim()));
      }
    });

    return keywords;
  }

  generateStrengths(matchedKeywords) {
    const strengths = [];

    // Group matched keywords by category
    const techSkills = matchedKeywords.filter(k =>
      /javascript|typescript|python|java|react|angular|vue|node|express|sql|mongodb|aws|docker/i.test(k)
    );

    const softSkills = matchedKeywords.filter(k =>
      /leadership|communication|team|problem|analytical|management/i.test(k)
    );

    const experience = matchedKeywords.filter(k =>
      /experience|senior|lead|manager|years/i.test(k)
    );

    if (techSkills.length > 0) {
      strengths.push(`Strong technical skills matching: ${techSkills.slice(0, 5).join(', ')}`);
    }

    if (softSkills.length > 0) {
      strengths.push(`Demonstrates key soft skills: ${softSkills.slice(0, 3).join(', ')}`);
    }

    if (experience.length > 0) {
      strengths.push(`Relevant experience level matching job requirements`);
    }

    if (matchedKeywords.length >= 15) {
      strengths.push(`Excellent keyword coverage (${matchedKeywords.length}+ matches)`);
    } else if (matchedKeywords.length >= 10) {
      strengths.push(`Good keyword alignment with job description`);
    }

    // Add specific matched terms as strengths
    const topMatches = matchedKeywords.slice(0, 3);
    topMatches.forEach(keyword => {
      if (!strengths.some(s => s.toLowerCase().includes(keyword.toLowerCase()))) {
        strengths.push(`CV includes required skill: ${keyword}`);
      }
    });

    return strengths.length > 0 ? strengths : ['Some relevant keywords found in CV'];
  }

  generateWeaknesses(missingKeywords) {
    const weaknesses = [];

    // Categorize missing keywords
    const missingTech = missingKeywords.filter(k =>
      /javascript|typescript|python|java|react|angular|vue|node|express|sql|mongodb|aws|docker|kubernetes/i.test(k)
    );

    const missingSoft = missingKeywords.filter(k =>
      /leadership|communication|team|problem|analytical|management|collaboration/i.test(k)
    );

    if (missingTech.length > 0) {
      weaknesses.push(`Missing technical skills: ${missingTech.slice(0, 5).join(', ')}`);
    }

    if (missingSoft.length > 0) {
      weaknesses.push(`Missing soft skills: ${missingSoft.slice(0, 3).join(', ')}`);
    }

    if (missingKeywords.length >= 15) {
      weaknesses.push(`Significant keyword gaps (${missingKeywords.length}+ missing keywords)`);
    } else if (missingKeywords.length >= 8) {
      weaknesses.push(`Multiple missing keywords from job requirements`);
    }

    // Add specific missing terms as weaknesses
    const topMissing = missingKeywords.slice(0, 4);
    topMissing.forEach(keyword => {
      if (!weaknesses.some(w => w.toLowerCase().includes(keyword.toLowerCase()))) {
        weaknesses.push(`CV missing required keyword: ${keyword}`);
      }
    });

    return weaknesses.length > 0 ? weaknesses : ['Some job requirements not explicitly mentioned in CV'];
  }

  analyzeAspects(jdText, cvText) {
    const aspects = {};
    const cvLower = cvText.toLowerCase();
    const jdLower = jdText.toLowerCase();

    // Technical Skills
    const techTerms = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'aws', 'docker', 'api', 'database', 'cloud', 'web', 'mobile', 'software', 'development'];
    const jdTech = techTerms.filter(t => jdLower.includes(t));
    const cvTech = techTerms.filter(t => cvLower.includes(t));
    const techMatch = jdTech.length > 0 ? Math.round((cvTech.filter(t => jdTech.includes(t)).length / jdTech.length) * 100) : 50;

    aspects.technicalSkills = {
      score: Math.min(100, techMatch),
      feedback: techMatch >= 70 ? 'Strong technical skill alignment' : techMatch >= 40 ? 'Moderate technical match - some gaps exist' : 'Significant technical skill gaps'
    };

    // Experience
    const expTerms = ['years', 'experience', 'worked', 'developed', 'managed', 'led', 'built', 'created', 'implemented'];
    const expCount = expTerms.filter(t => cvLower.includes(t)).length;
    const expScore = Math.min(100, expCount * 12);

    aspects.experience = {
      score: expScore,
      feedback: expScore >= 70 ? 'CV demonstrates substantial relevant experience' : expScore >= 40 ? 'Some experience shown but could be more detailed' : 'Limited experience demonstrated'
    };

    // Education
    const eduTerms = ['degree', 'bachelor', 'master', 'phd', 'university', 'college', 'certification', 'certified'];
    const eduCount = eduTerms.filter(t => cvLower.includes(t)).length;
    const eduScore = Math.min(100, eduCount * 15);

    aspects.education = {
      score: eduScore,
      feedback: eduScore >= 60 ? 'Education requirements appear to be met' : 'Consider highlighting relevant education or certifications'
    };

    return aspects;
  }
}

module.exports = new KeywordMatcher();