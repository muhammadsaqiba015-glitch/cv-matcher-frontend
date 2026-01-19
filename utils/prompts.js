/**
 * Claude AI Prompts for CV Analysis
 * 
 * These prompts are carefully crafted to get brutally honest,
 * accurate assessments without any bias in favor of candidates.
 */

const weights = require('../config/weights.config');

/**
 * Generate the main analysis prompt for Claude
 * @param {string} jobDescription - The job description
 * @param {string} cvText - The candidate's CV text
 * @returns {string} - Formatted prompt
 */
function generateAnalysisPrompt(jobDescription, cvText) {
  return `You are an expert technical recruiter and hiring manager with 15+ years of experience. Your job is to provide a brutally honest, unbiased assessment of how well this candidate's CV matches the job description.

**CRITICAL INSTRUCTIONS:**
- Be RUTHLESSLY HONEST - do not inflate scores or be lenient
- NO bias in favor of the candidate - if something is missing, say it clearly
- Focus on ACTUAL EVIDENCE in the CV, not potential or assumptions
- Rate based on what IS there, not what COULD be there
- If experience is tangential or weak, reflect that in the score

---

**JOB DESCRIPTION:**
${jobDescription}

---

**CANDIDATE CV:**
${cvText}

---

**YOUR TASK:**
Analyze this CV against the job description and provide scores for each aspect. Each score should be 0-100, where:
- 90-100: Exceptional match, exceeds requirements significantly
- 75-89: Strong match, meets or slightly exceeds requirements
- 60-74: Adequate match, meets most requirements
- 45-59: Partial match, missing some key requirements
- 30-44: Weak match, missing many requirements
- 0-29: Poor match, fundamentally misaligned

**Provide your analysis in the following JSON format:**

{
  "skillsMatch": {
    "score": <0-100>,
    "analysis": "<Brief explanation of technical and soft skills match>",
    "matches": ["<list of skills that match>"],
    "missing": ["<list of required skills that are missing>"]
  },
  "experienceQuality": {
    "score": <0-100>,
    "analysis": "<Assessment of experience quality, relevance, and level>",
    "strengths": ["<strong points in experience>"],
    "weaknesses": ["<weak points or gaps>"]
  },
  "educationFit": {
    "score": <0-100>,
    "analysis": "<How well education matches requirements>",
    "details": "<Specific education background and how it relates>"
  },
  "careerGrowth": {
    "score": <0-100>,
    "analysis": "<Assessment of career trajectory and progression>",
    "trajectory": "<Growing/Stagnant/Declining>"
  },
  "overallAssessment": {
    "summary": "<2-3 sentence honest summary>",
    "recommendation": "<Strong recommend / Recommend / Consider / Not recommended>",
    "keyStrengths": ["<top 3 strengths>"],
    "keyWeaknesses": ["<top 3 weaknesses>"],
    "redFlags": ["<any concerning patterns or gaps>"]
  }
}

**RESPOND ONLY WITH THE JSON - NO ADDITIONAL TEXT.**`;
}

/**
 * Generate keyword extraction prompt for Job Description
 * @param {string} jobDescription - The job description
 * @returns {string} - Formatted prompt
 */
function generateKeywordExtractionPrompt(jobDescription) {
  return `Extract all relevant keywords, requirements, and criteria from this job description.

**JOB DESCRIPTION:**
${jobDescription}

**Extract the following in JSON format:**

{
  "requiredSkills": ["<list of explicitly required technical skills>"],
  "preferredSkills": ["<list of preferred/nice-to-have skills>"],
  "requiredYearsExperience": <number or null>,
  "requiredEducation": ["<education requirements>"],
  "certifications": ["<any required certifications>"],
  "responsibilities": ["<key responsibilities>"],
  "keywords": ["<other important keywords not covered above>"]
}

**Be precise - only include what is explicitly mentioned or clearly implied. RESPOND ONLY WITH THE JSON.**`;
}

/**
 * Generate A/B testing comparison prompt
 * @param {object} keywordAnalysis - Results from keyword matching
 * @param {object} aiAnalysis - Results from AI analysis
 * @returns {string} - Comparison prompt
 */
function generateABComparisonPrompt(keywordAnalysis, aiAnalysis) {
  return `You're comparing two different analysis methods for CV screening:

**METHOD A (Keyword Matching):**
Score: ${keywordAnalysis.score}
Matches Found: ${keywordAnalysis.matchedSkills?.length || 0}
Missing: ${keywordAnalysis.missingSkills?.length || 0}

**METHOD B (AI Deep Analysis):**
Overall Score: ${aiAnalysis.overallScore}
Skills Score: ${aiAnalysis.aspects?.skillsMatch?.score || 0}
Experience Score: ${aiAnalysis.aspects?.experienceQuality?.score || 0}

**Which method appears more accurate and why? Provide insights in 2-3 sentences.**`;
}

module.exports = {
  generateAnalysisPrompt,
  generateKeywordExtractionPrompt,
  generateABComparisonPrompt
};
