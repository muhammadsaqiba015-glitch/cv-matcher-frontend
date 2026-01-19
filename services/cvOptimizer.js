const Anthropic = require('@anthropic-ai/sdk');

/**
 * CV Optimizer Service
 * Uses Claude AI to rewrite CVs to better match job descriptions
 */
class CVOptimizer {

    constructor() {
        if (!process.env.ANTHROPIC_API_KEY) {
            throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
        }

        this.client = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
        });

        this.model = 'claude-sonnet-4-20250514';
        this.maxTokens = 4096;
    }

    /**
     * Optimize CV based on job description and analysis results
     * @param {string} originalCV - Original CV text
     * @param {string} jobDescription - Job description
     * @param {object} analysisResults - Results from CV analysis
     * @param {string} optimizationLevel - 'honest' or 'aggressive'
     * @returns {Promise<object>} - Optimized CV data
     */
    async optimizeCV(originalCV, jobDescription, analysisResults, optimizationLevel = 'honest') {
        try {
            const prompt = this.generateOptimizationPrompt(
                originalCV,
                jobDescription,
                analysisResults,
                optimizationLevel
            );

            const response = await this.client.messages.create({
                model: this.model,
                max_tokens: this.maxTokens,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.4
            });

            const optimizedData = this.parseResponse(response);

            return {
                success: true,
                optimizedCV: optimizedData,
                changesSummary: this.generateChangesSummary(analysisResults, optimizedData)
            };

        } catch (error) {
            throw new Error(`CV optimization failed: ${error.message}`);
        }
    }

    /**
     * Generate prompt for CV optimization
     */
    generateOptimizationPrompt(originalCV, jobDescription, analysisResults, level) {
        const honestInstructions = `
**STRICT RULES FOR HONEST OPTIMIZATION:**
- DO NOT fabricate any experience, skills, or achievements
- DO NOT add skills the candidate doesn't have
- DO NOT exaggerate years of experience or seniority
- ONLY reword and reorganize existing real information
- Focus on emphasizing relevant existing experience
- Use JD keywords ONLY where they genuinely match candidate's background
`;

        const aggressiveInstructions = `
**RULES FOR AGGRESSIVE OPTIMIZATION:**
- Emphasize and expand on existing experience heavily
- Use strong action verbs and impactful language
- Add JD keywords where candidate has ANY related experience
- Frame existing experience in the most impressive way possible
- Still maintain truthfulness - don't fabricate entirely new experiences
- Be liberal with interpreting existing experience as relevant
`;

        const instructions = level === 'honest' ? honestInstructions : aggressiveInstructions;

        return `You are an expert CV writer and career consultant. Your job is to optimize this CV to better match the job description while maintaining ${level === 'honest' ? 'strict honesty' : 'aggressive marketing'}.

${instructions}

**ANALYSIS RESULTS:**
Interview Chance: ${analysisResults.finalScore}%
Missing Skills: ${analysisResults.weaknesses.slice(0, 5).join(', ')}
Strengths: ${analysisResults.strengths.slice(0, 5).join(', ')}

**ORIGINAL CV:**
${originalCV}

**JOB DESCRIPTION:**
${jobDescription}

**IMPORTANT CONSTRAINTS:**
1. KEEP EXACTLY AS-IS:
   - Name and contact information
   - Company names where candidate worked
   - Job titles (unless minor rewording helps)
   - Education institution names and degrees
   - Dates of employment

2. OPTIMIZE:
   - Job descriptions to highlight relevant experience
   - Skills section to emphasize matching skills
   - Professional summary to align with JD
   - Achievement bullets to showcase relevant impact
   - Project descriptions to match JD requirements
   - Order of experience (most relevant first)

3. FORMAT:
   - Simple, clean, ATS-friendly format
   - Clear section headers
   - Bullet points for achievements
   - No fancy formatting or graphics

**OUTPUT FORMAT:**
Return ONLY a JSON object with this structure:

{
  "contactInfo": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "+1234567890",
    "location": "City, Country",
    "linkedin": "linkedin.com/in/username",
    "github": "github.com/username"
  },
  "summary": "Compelling professional summary that aligns with JD (3-4 sentences)",
  "skills": {
    "technical": ["skill1", "skill2", "skill3"],
    "soft": ["skill1", "skill2"]
  },
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name (EXACT from original)",
      "location": "City, Country",
      "duration": "Month Year - Month Year",
      "achievements": [
        "Achievement bullet 1 with relevant keywords",
        "Achievement bullet 2 showing impact",
        "Achievement bullet 3 highlighting relevant skills"
      ]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "Institution Name (EXACT from original)",
      "year": "Year",
      "details": "GPA or honors if mentioned"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief description with relevant keywords",
      "technologies": ["tech1", "tech2"]
    }
  ],
  "certifications": ["cert1", "cert2"],
  "changes": {
    "addedKeywords": ["keyword1", "keyword2"],
    "emphasizedSkills": ["skill1", "skill2"],
    "reorderedExperience": true/false,
    "optimizedSummary": true/false
  }
}

**RESPOND ONLY WITH THE JSON - NO ADDITIONAL TEXT.**`;
    }

    /**
     * Parse Claude's response
     */
    parseResponse(response) {
        try {
            const textContent = response.content.find(block => block.type === 'text');

            if (!textContent) {
                throw new Error('No text content in Claude response');
            }

            let jsonText = textContent.text.trim();

            // Remove markdown code fences if present
            if (jsonText.startsWith('```json')) {
                jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
            } else if (jsonText.startsWith('```')) {
                jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
            }

            const parsed = JSON.parse(jsonText);

            // Validate required fields
            if (!parsed.contactInfo || !parsed.summary || !parsed.experience) {
                throw new Error('Missing required fields in optimized CV');
            }

            return parsed;

        } catch (error) {
            console.error('Failed to parse CV optimization response:', error);
            throw new Error(`Failed to parse optimized CV: ${error.message}`);
        }
    }

    /**
     * Generate summary of changes made
     */
    generateChangesSummary(analysisResults, optimizedCV) {
        const changes = optimizedCV.changes || {};

        return {
            addedKeywords: changes.addedKeywords || [],
            emphasizedSkills: changes.emphasizedSkills || [],
            reorderedExperience: changes.reorderedExperience || false,
            optimizedSummary: changes.optimizedSummary !== false,
            totalChanges: (changes.addedKeywords?.length || 0) +
                (changes.emphasizedSkills?.length || 0) +
                (changes.reorderedExperience ? 1 : 0) +
                (changes.optimizedSummary ? 1 : 0)
        };
    }

    /**
     * Format optimized CV as readable text
     */
    formatAsText(optimizedCV) {
        const cv = optimizedCV.optimizedCV || optimizedCV;

        let text = '';

        // Contact Info
        text += `${cv.contactInfo.name}\n`;
        if (cv.contactInfo.email) text += `${cv.contactInfo.email}`;
        if (cv.contactInfo.phone) text += ` | ${cv.contactInfo.phone}`;
        if (cv.contactInfo.location) text += ` | ${cv.contactInfo.location}`;
        text += '\n';
        if (cv.contactInfo.linkedin) text += `LinkedIn: ${cv.contactInfo.linkedin}\n`;
        if (cv.contactInfo.github) text += `GitHub: ${cv.contactInfo.github}\n`;
        text += '\n';

        // Summary
        text += `PROFESSIONAL SUMMARY\n`;
        text += `${'─'.repeat(80)}\n`;
        text += `${cv.summary}\n\n`;

        // Skills
        if (cv.skills) {
            text += `SKILLS\n`;
            text += `${'─'.repeat(80)}\n`;
            if (cv.skills.technical?.length > 0) {
                text += `Technical: ${cv.skills.technical.join(', ')}\n`;
            }
            if (cv.skills.soft?.length > 0) {
                text += `Soft Skills: ${cv.skills.soft.join(', ')}\n`;
            }
            text += '\n';
        }

        // Experience
        text += `PROFESSIONAL EXPERIENCE\n`;
        text += `${'─'.repeat(80)}\n`;
        cv.experience.forEach((exp, index) => {
            text += `${exp.title} | ${exp.company}\n`;
            text += `${exp.duration}`;
            if (exp.location) text += ` | ${exp.location}`;
            text += '\n';
            exp.achievements.forEach(achievement => {
                text += `• ${achievement}\n`;
            });
            if (index < cv.experience.length - 1) text += '\n';
        });
        text += '\n';

        // Education
        if (cv.education?.length > 0) {
            text += `EDUCATION\n`;
            text += `${'─'.repeat(80)}\n`;
            cv.education.forEach(edu => {
                text += `${edu.degree} | ${edu.institution}`;
                if (edu.year) text += ` | ${edu.year}`;
                text += '\n';
                if (edu.details) text += `${edu.details}\n`;
            });
            text += '\n';
        }

        // Projects
        if (cv.projects?.length > 0) {
            text += `PROJECTS\n`;
            text += `${'─'.repeat(80)}\n`;
            cv.projects.forEach(project => {
                text += `${project.name}\n`;
                text += `${project.description}\n`;
                if (project.technologies?.length > 0) {
                    text += `Technologies: ${project.technologies.join(', ')}\n`;
                }
                text += '\n';
            });
        }

        // Certifications
        if (cv.certifications?.length > 0) {
            text += `CERTIFICATIONS\n`;
            text += `${'─'.repeat(80)}\n`;
            cv.certifications.forEach(cert => {
                text += `• ${cert}\n`;
            });
        }

        return text;
    }
}

module.exports = new CVOptimizer();