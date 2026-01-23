const Anthropic = require('@anthropic-ai/sdk');

class CVOptimizer {
    constructor() {
        if (!process.env.ANTHROPIC_API_KEY) {
            throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
        }

        // Trim whitespace/newlines from API key
        const apiKey = process.env.ANTHROPIC_API_KEY.trim();

        this.client = new Anthropic({
            apiKey: apiKey
        });

        this.model = 'claude-sonnet-4-20250514';
        this.maxTokens = 4096;
    }

    async optimizeCV(cvText, jdText, analysisResults, level = 'honest') {
        try {
            const prompt = this.getOptimizationPrompt(cvText, jdText, analysisResults, level);

            const message = await this.client.messages.create({
                model: this.model,
                max_tokens: this.maxTokens,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            });

            const responseText = message.content[0].text;

            // Parse JSON response
            let optimizedData;
            try {
                // Try to extract JSON from response
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    optimizedData = JSON.parse(jsonMatch[0]);
                } else {
                    optimizedData = JSON.parse(responseText);
                }
            } catch (parseError) {
                console.error('Failed to parse optimization response:', parseError);
                throw new Error('Failed to parse CV optimization results');
            }

            return optimizedData;

        } catch (error) {
            console.error('CV optimization error:', error);
            throw new Error(`CV optimization failed: ${error.message}`);
        }
    }

    getOptimizationPrompt(cvText, jdText, analysisResults, level) {
        const basePrompt = `You are an expert CV optimization specialist. Your task is to optimize this CV to maximize its match with the job description.

**CRITICAL REQUIREMENTS:**
1. Extract ALL keywords from the job description and incorporate them naturally
2. Rewrite experience bullets to highlight relevant achievements
3. Reorganize sections to prioritize relevant experience
4. Add missing technical skills that the candidate likely has based on their experience
5. Optimize the professional summary to match the role perfectly

**IMPORTANT:** ${level === 'aggressive' ? 'Be VERY aggressive. The optimized CV MUST score 85%+ when re-analyzed. Add every relevant keyword from the JD, emphasize all matching skills heavily, and rewrite all descriptions to align perfectly with the job requirements.' : 'Be honest and only improve wording. Do not add skills or experience the candidate does not have.'}

**Job Description:**
${jdText}

**Original CV:**
${cvText}

**Analysis Results:**
Interview Chance: ${analysisResults.interviewChance}%
Missing Keywords: ${analysisResults.weaknesses.join(', ')}
Strengths: ${analysisResults.strengths.join(', ')}

**YOUR TASK:**
${level === 'aggressive' ? `
Create an EXTREMELY optimized CV that will score 85%+ on re-analysis:
1. Include EVERY keyword from the job description (technical skills, soft skills, tools, methodologies)
2. Rewrite ALL experience bullets to match job requirements perfectly
3. Add a powerful professional summary with ALL key terms from JD
4. List ALL technical skills mentioned in JD (if candidate has related experience)
5. Reorganize experience to show most relevant roles first
6. Use exact phrases from the job description where appropriate
7. Ensure every section (summary, skills, experience) is heavily optimized

The goal is maximum keyword density and perfect alignment with JD.
` : `
Improve the CV honestly:
1. Better word choices that match JD terminology
2. Reorganize bullets to highlight relevant experience
3. Improve professional summary
4. Only add skills the candidate demonstrably has
`}

Return ONLY a valid JSON object with this EXACT structure (no markdown, no extra text):
{
  "optimizedCV": {
    "contactInfo": {
      "name": "Keep original name",
      "email": "Keep original email",
      "phone": "Keep original phone"
    },
    "summary": "Powerful 3-4 sentence professional summary with ALL key terms from JD",
    "skills": {
      "technical": ["skill1", "skill2", "skill3", ...],
      "soft": ["skill1", "skill2", ...]
    },
    "experience": [
      {
        "title": "Job Title",
        "company": "Company Name",
        "duration": "Date Range",
        "achievements": [
          "Achievement 1 with keywords",
          "Achievement 2 with keywords",
          "Achievement 3 with keywords"
        ]
      }
    ],
    "education": [
      {
        "degree": "Degree Name",
        "institution": "School Name",
        "year": "Year"
      }
    ]
  },
  "changesSummary": {
    "addedKeywords": ["keyword1", "keyword2", ...],
    "emphasizedSkills": ["skill1", "skill2", ...],
    "reorderedExperience": true,
    "optimizedSummary": true,
    "totalChanges": 15
  }
}`;

        return basePrompt;
    }
}

module.exports = new CVOptimizer();