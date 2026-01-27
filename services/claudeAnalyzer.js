

const Anthropic = require('@anthropic-ai/sdk');

class ClaudeAnalyzer {
  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
    }

    const apiKey = process.env.ANTHROPIC_API_KEY.trim();

    this.client = new Anthropic({
      apiKey: apiKey,
      timeout: 55000
    });
  }

  detectFakeDocument(cvText, jdText) {
    const cvLower = cvText.toLowerCase();
    const jdLower = jdText.toLowerCase();

    if (cvText.length < 100) {
      return {
        isFake: true,
        reason: 'cv_too_short',
        message: "🤔 Hmm, that's quite a minimalist CV! Either you're a person of very few words, or you're testing me. Come on, give me something real to work with! Upload an actual CV - I promise I won't judge (much). 😄"
      };
    }

    if (jdText.length < 50) {
      return {
        isFake: true,
        reason: 'jd_too_short',
        message: "📝 That job description is shorter than a tweet! I need more details to work with. Is this a job for 'Professional Mystery Solver'? Paste a real job posting and let's do this properly! 🕵️"
      };
    }

    const gibberishPattern = /^[a-z]{20,}$|asdf|qwerty|lorem ipsum|test123|abc123|zzzzz|xxxxx|aaaaaa|jjjjj/i;
    if (gibberishPattern.test(cvText) || gibberishPattern.test(jdText)) {
      return {
        isFake: true,
        reason: 'gibberish',
        message: "🎭 Nice try, keyboard warrior! But 'asdfghjkl' isn't a skill I can analyze (though I admire your typing speed). Upload a real CV and I'll give you actual insights. Deal? 🤝"
      };
    }

    const repeatedPattern = /(.)\1{10,}/;
    if (repeatedPattern.test(cvText) || repeatedPattern.test(jdText)) {
      return {
        isFake: true,
        reason: 'repeated_chars',
        message: "🤖 Beep boop! Detected: keyboard smashing. Look, I get it - sometimes we all want to just go 'aaaaaaaaaa'. But for CV analysis, I'm gonna need actual words. Try again with a real document! 😉"
      };
    }

    const cvKeywords = ['experience', 'education', 'skills', 'work', 'job', 'company', 'university', 'college', 'degree', 'project', 'team', 'manage', 'develop', 'create', 'lead', 'responsible', 'year', 'month', 'resume', 'cv', 'professional', 'summary', 'objective', 'contact', 'email', 'phone'];
    const cvKeywordCount = cvKeywords.filter(word => cvLower.includes(word)).length;

    if (cvKeywordCount < 2) {
      return {
        isFake: true,
        reason: 'not_a_cv',
        message: "🧐 I've analyzed thousands of CVs, and this... doesn't quite look like one. Did you accidentally upload your shopping list? Recipe for banana bread? Fan fiction? (No judgment on that last one!) Please upload an actual CV - I'm here to help! 📄"
      };
    }

    const jdKeywords = ['position', 'role', 'responsibility', 'requirement', 'qualification', 'experience', 'skill', 'team', 'company', 'work', 'candidate', 'apply', 'job', 'salary', 'benefit', 'looking', 'hire', 'opportunity', 'description', 'duties'];
    const jdKeywordCount = jdKeywords.filter(word => jdLower.includes(word)).length;

    if (jdKeywordCount < 2) {
      return {
        isFake: true,
        reason: 'not_a_jd',
        message: "🤨 That job description is giving 'mystery novel' vibes - I can't figure out what job this is for! Is it 'Professional Cat Whisperer'? 'Chief Vibes Officer'? 'Senior Nap Coordinator'? Please paste an actual job posting so I can work my magic! ✨"
      };
    }

    const storyPatterns = /once upon a time|the end|chapter \d|verse \d|chorus|lyrics/i;
    if (storyPatterns.test(cvText) || storyPatterns.test(jdText)) {
      return {
        isFake: true,
        reason: 'story_content',
        message: "📚 I appreciate the creative writing, but I'm a CV analyzer, not a book critic! Save the 'Once upon a time' for bedtime stories and give me a real CV to work with. Unless you're applying to be a storyteller - in which case, still need a proper CV! 😄"
      };
    }

    return { isFake: false };
  }

  async analyze(jdText, cvText) {
    const fakeCheck = this.detectFakeDocument(cvText, jdText);
    if (fakeCheck.isFake) {
      return {
        isFake: true,
        overallScore: 0,
        aspects: {
          technicalSkills: { score: 0, feedback: 'Unable to analyze - invalid document' },
          experience: { score: 0, feedback: 'Unable to analyze - invalid document' },
          education: { score: 0, feedback: 'Unable to analyze - invalid document' },
          softSkills: { score: 0, feedback: 'Unable to analyze - invalid document' },
          achievements: { score: 0, feedback: 'Unable to analyze - invalid document' }
        },
        strengths: [],
        weaknesses: [],
        summary: fakeCheck.message,
        detailedAssessment: fakeCheck.message,
        fakeReason: fakeCheck.reason
      };
    }

    const prompt = `You are an expert CV/Resume analyzer.

TASK: Analyze this CV against the job description.

JOB DESCRIPTION:
${jdText}

CV/RESUME:
${cvText}

Provide JSON ONLY:
{
  "overallScore": <0-100>,
  "aspects": {
    "technicalSkills": {"score": <0-100>, "feedback": "<specific feedback>"},
    "experience": {"score": <0-100>, "feedback": "<specific feedback>"},
    "education": {"score": <0-100>, "feedback": "<specific feedback>"},
    "softSkills": {"score": <0-100>, "feedback": "<specific feedback>"},
    "achievements": {"score": <0-100>, "feedback": "<specific feedback>"}
  },
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>", "<strength 4>", "<strength 5>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>", "<weakness 4>", "<weakness 5>"],
  "summary": "<2-3 sentence brutally honest summary>",
  "detailedAssessment": "<detailed paragraph explaining the overall fit>"
}

RULES:
1. Be BRUTALLY HONEST - do not inflate scores
2. Compare DIRECTLY to the job description requirements
3. Strengths should list SPECIFIC skills/experience that MATCH the JD
4. Weaknesses should list SPECIFIC requirements from JD that are MISSING or weak
5. ALWAYS provide at least 3-5 strengths and 3-5 weaknesses
6. Be specific to this CV and JD - no generic feedback`;

    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      });

      const content = response.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const result = JSON.parse(jsonMatch[0]);

      if (!result.strengths || result.strengths.length === 0) {
        result.strengths = ['Unable to identify specific strengths'];
      }
      if (!result.weaknesses || result.weaknesses.length === 0) {
        result.weaknesses = ['Unable to identify specific weaknesses'];
      }

      result.isFake = false;
      return result;

    } catch (error) {
      console.error('Claude analysis error:', error.message);
      return {
        isFake: false,
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

    const prompt = `You are an expert CV optimization specialist. Your job is to INTELLIGENTLY improve a CV to better match a job description.

=== CRITICAL RULES - READ CAREFULLY ===

🚫 ABSOLUTELY FORBIDDEN - NEVER DO THESE:
1. NEVER add experience the candidate doesn't have
2. NEVER add skills the candidate hasn't demonstrated  
3. NEVER fabricate job titles, companies, or responsibilities
4. NEVER add industry experience they don't have (e.g., don't add "hotel experience" if they worked in e-commerce)
5. NEVER copy phrases directly from the JD and pretend it's their experience
6. NEVER lie or exaggerate beyond what's reasonable

✅ WHAT YOU SHOULD DO:
1. REWORD existing experience using better, more impactful language
2. HIGHLIGHT transferable skills that apply to the new role
3. REFRAME experience to show relevance (e.g., "managed customer support" → "led customer experience operations ensuring satisfaction and retention")
4. USE ACTION VERBS and quantify achievements where possible
5. REORGANIZE content to put most relevant experience first
6. IMPROVE the professional summary to better position them for this role
7. ADD keywords ONLY where they genuinely apply to existing experience
8. EMPHASIZE achievements and results over just duties
9. SUGGEST what they could add IF they have relevant experience they may have forgotten

=== THE TASK ===

JOB DESCRIPTION:
${jdText.substring(0, 3000)}

ORIGINAL CV:
${cvText.substring(0, 4000)}

CURRENT ANALYSIS:
- Score: ${analysisResults?.interviewChance || 50}%
- Weaknesses identified: ${(analysisResults?.weaknesses || []).slice(0, 3).join('; ')}

OPTIMIZATION LEVEL: ${isAggressive ? 'AGGRESSIVE (maximize impact while staying truthful)' : 'HONEST (conservative improvements)'}

${isAggressive ? `
AGGRESSIVE MODE INSTRUCTIONS:
- Push the boundaries of rewording to maximize impact
- Find creative ways to connect existing experience to JD requirements
- Use powerful action verbs and industry terminology
- Emphasize any transferable skills heavily
- Make the professional summary highly compelling
- BUT STILL: Never fabricate experience or add false claims
` : `
HONEST MODE INSTRUCTIONS:
- Make conservative, safe improvements
- Focus mainly on better wording and structure
- Don't stretch interpretations too far
- Keep changes minimal but impactful
`}

=== OUTPUT FORMAT ===

Return ONLY valid JSON:
{
  "optimizedCV": "<the complete optimized CV as formatted text - preserve ALL original information, contact details, etc.>",
  "changes": [
    "<specific change 1 - e.g., 'Reworded customer support experience to emphasize problem-solving skills'>",
    "<specific change 2>",
    "<specific change 3>",
    "<specific change 4>",
    "<specific change 5>"
  ],
  "expectedScore": <realistic expected score after changes - be honest, don't inflate>,
  "keywordsAdded": ["<keyword genuinely applicable>", "<keyword genuinely applicable>"],
  "honestAssessment": "<1-2 sentences about the realistic fit - if there's a significant mismatch between CV and JD, acknowledge it>"
}

REMEMBER: A CV that lies will fail in the interview. Your job is to present the TRUTH in the best possible light, not to fabricate a new truth.`;

    try {
      console.log('Starting intelligent optimization, level:', level);

      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      });

      console.log('Optimization response received');

      const content = response.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        console.error('No JSON in response:', content.substring(0, 200));
        throw new Error('Invalid response format');
      }

      const result = JSON.parse(jsonMatch[0]);

      // Don't artificially inflate the expected score
      // The AI should give a realistic assessment
      if (isAggressive && result.expectedScore > 85) {
        // Cap aggressive mode at 85% unless truly exceptional
        result.expectedScore = Math.min(result.expectedScore, 85);
      }

      return result;

    } catch (error) {
      console.error('Optimization error:', error.message);

      return {
        optimizedCV: cvText,
        changes: ['Optimization failed - showing original CV'],
        expectedScore: analysisResults?.interviewChance || 50,
        keywordsAdded: [],
        honestAssessment: 'Unable to optimize. Please try again.'
      };
    }
  }
}

module.exports = new ClaudeAnalyzer();