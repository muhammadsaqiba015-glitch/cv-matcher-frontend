const Anthropic = require('@anthropic-ai/sdk');

class ClaudeAnalyzer {
  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
    }

    // Trim whitespace/newlines from API key
    const apiKey = process.env.ANTHROPIC_API_KEY.trim();

    this.client = new Anthropic({
      apiKey: apiKey
    });
  }

  async analyze(jdText, cvText) {
    const prompt = `You are an expert CV/Resume analyzer with years of experience in HR and recruitment.

TASK: Analyze this CV against the job description and provide a detailed, brutally honest assessment.

JOB DESCRIPTION:
${jdText}

CV/RESUME:
${cvText}

Provide your analysis in the following JSON format ONLY (no other text):
{
  "overallScore": <number 0-100>,
  "aspects": {
    "technicalSkills": {
      "score": <number 0-100>,
      "feedback": "<specific feedback>"
    },
    "experience": {
      "score": <number 0-100>,
      "feedback": "<specific feedback>"
    },
    "education": {
      "score": <number 0-100>,
      "feedback": "<specific feedback>"
    },
    "softSkills": {
      "score": <number 0-100>,
      "feedback": "<specific feedback>"
    },
    "achievements": {
      "score": <number 0-100>,
      "feedback": "<specific feedback>"
    }
  },
  "strengths": [
    "<strength 1 - be specific about what matches the JD>",
    "<strength 2>",
    "<strength 3>",
    "<strength 4>",
    "<strength 5>"
  ],
  "weaknesses": [
    "<weakness 1 - be specific about what's missing from the JD>",
    "<weakness 2>",
    "<weakness 3>",
    "<weakness 4>",
    "<weakness 5>"
  ],
  "summary": "<2-3 sentence brutally honest summary>",
  "detailedAssessment": "<detailed paragraph explaining the overall fit>"
}

IMPORTANT RULES:
1. Be BRUTALLY HONEST - do not inflate scores
2. Compare DIRECTLY to the job description requirements
3. Strengths should list SPECIFIC skills/experience that MATCH the JD
4. Weaknesses should list SPECIFIC requirements from JD that are MISSING or weak
5. ALWAYS provide at least 3-5 strengths and 3-5 weaknesses
6. If the CV is a poor match, give low scores (below 40)
7. If the CV is excellent match, give high scores (above 75)
8. Do NOT provide generic feedback - be specific to this CV and JD`;

    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.content[0].text;

      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const result = JSON.parse(jsonMatch[0]);

      // Ensure strengths and weaknesses are arrays with content
      if (!result.strengths || !Array.isArray(result.strengths) || result.strengths.length === 0) {
        result.strengths = ['Unable to identify specific strengths from CV'];
      }

      if (!result.weaknesses || !Array.isArray(result.weaknesses) || result.weaknesses.length === 0) {
        result.weaknesses = ['Unable to identify specific weaknesses from CV'];
      }

      return result;

    } catch (error) {
      console.error('Claude analysis error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        name: error.name
      });

      // Return default structure on error
      return {
        overallScore: 50,
        aspects: {
          technicalSkills: { score: 50, feedback: 'Analysis unavailable' },
          experience: { score: 50, feedback: 'Analysis unavailable' },
          education: { score: 50, feedback: 'Analysis unavailable' },
          softSkills: { score: 50, feedback: 'Analysis unavailable' },
          achievements: { score: 50, feedback: 'Analysis unavailable' }
        },
        strengths: ['Error analyzing CV - please try again'],
        weaknesses: ['Error analyzing CV - please try again'],
        summary: 'Analysis failed. Please try again.',
        detailedAssessment: error.message
      };
    }
  }

  async optimizeCV(jdText, cvText, analysisResults, level = 'honest') {
    const isAggressive = level === 'aggressive';

    const prompt = `You are an expert CV optimization specialist.

YOUR TASK: ${isAggressive ? 'AGGRESSIVELY optimize this CV to achieve 100% match with the job description. Add ALL missing keywords and rewrite ALL sections to perfectly align with the JD.' : 'Honestly improve this CV while maintaining truthfulness.'}

JOB DESCRIPTION:
${jdText}

ORIGINAL CV:
${cvText}

ANALYSIS RESULTS:
- Current Score: ${analysisResults.interviewChance || analysisResults.finalScore || 50}%
- Missing/Weak Areas: ${analysisResults.weaknesses?.join(', ') || 'None identified'}
- Strengths: ${analysisResults.strengths?.join(', ') || 'None identified'}

${isAggressive ? `
**AGGRESSIVE OPTIMIZATION REQUIREMENTS (TARGET: 100% MATCH):**
1. ADD every single keyword from the job description into the CV
2. REWRITE the professional summary to include ALL key requirements from JD
3. REWRITE every experience bullet point to align with JD requirements
4. ADD a comprehensive skills section with ALL technologies/tools mentioned in JD
5. Use EXACT phrases from the job description where possible
6. ADD quantifiable achievements that align with JD expectations
7. REORGANIZE sections to highlight most relevant experience first
8. ADD any certifications or qualifications mentioned in JD as "In Progress" or "Pursuing"
9. MAXIMIZE keyword density without sounding robotic
10. The optimized CV MUST score 95-100% when re-analyzed

IMPORTANT: Be aggressive but not fabricate completely false information. Expand on existing experience to match JD requirements.
` : `
**HONEST OPTIMIZATION REQUIREMENTS:**
1. Improve wording to better match JD terminology
2. Reorganize content to highlight relevant experience
3. Add missing skills the candidate likely has based on their experience
4. Improve formatting and clarity
5. Do NOT add skills or experience the candidate doesn't have
`}

Provide the optimized CV in this JSON format ONLY:
{
  "optimizedCV": "<complete optimized CV text with proper formatting>",
  "changes": [
    "<specific change 1>",
    "<specific change 2>",
    "<specific change 3>"
  ],
  "expectedScore": <number 0-100>,
  "keywordsAdded": [
    "<keyword 1>",
    "<keyword 2>"
  ]
}`;

    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('No JSON found in optimization response');
      }

      const result = JSON.parse(jsonMatch[0]);

      // For aggressive mode, ensure high expected score
      if (isAggressive && result.expectedScore < 90) {
        result.expectedScore = 95;
      }

      return result;

    } catch (error) {
      console.error('CV optimization error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
      throw new Error(`CV optimization failed: ${error.message}`);
    }
  }
}

module.exports = new ClaudeAnalyzer();