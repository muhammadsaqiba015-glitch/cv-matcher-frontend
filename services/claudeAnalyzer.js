const Anthropic = require('@anthropic-ai/sdk');
const prompts = require('../utils/prompts');
const weights = require('../config/weights.config');

/**
 * Claude AI Analyzer Service
 * Phase 2: Deep AI analysis of CV against Job Description
 */
class ClaudeAnalyzer {
  
  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
    }
    
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    
    this.model = 'claude-sonnet-4-20250514'; // Using Claude Sonnet 4.5
    this.maxTokens = 4096;
  }

  /**
   * Analyze CV against Job Description using Claude AI
   * @param {string} jobDescription - The job description
   * @param {string} cvText - The CV text
   * @returns {Promise<object>} - AI analysis results
   */
  async analyze(jobDescription, cvText) {
    try {
      // Generate the analysis prompt
      const prompt = prompts.generateAnalysisPrompt(jobDescription, cvText);
      
      // Call Claude API
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3 // Lower temperature for more consistent, objective analysis
      });
      
      // Parse the response
      const analysis = this.parseResponse(response);
      
      // Calculate overall AI score
      const overallScore = this.calculateOverallScore(analysis);
      
      return {
        overallScore,
        aspects: {
          skillsMatch: analysis.skillsMatch,
          experienceQuality: analysis.experienceQuality,
          educationFit: analysis.educationFit,
          careerGrowth: analysis.careerGrowth
        },
        assessment: analysis.overallAssessment,
        rawResponse: response
      };
      
    } catch (error) {
      throw new Error(`Claude AI analysis failed: ${error.message}`);
    }
  }

  /**
   * Parse Claude's response
   * @param {object} response - Raw Claude API response
   * @returns {object} - Parsed analysis
   */
  parseResponse(response) {
    try {
      // Extract text from Claude's response
      const textContent = response.content.find(block => block.type === 'text');
      
      if (!textContent) {
        throw new Error('No text content in Claude response');
      }
      
      // Clean the text (remove markdown code blocks if present)
      let jsonText = textContent.text.trim();
      
      // Remove markdown code fences if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
      }
      
      // Parse JSON
      const parsed = JSON.parse(jsonText);
      
      // Validate required fields
      this.validateAnalysis(parsed);
      
      return parsed;
      
    } catch (error) {
      console.error('Failed to parse Claude response:', error);
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }

  /**
   * Validate that the analysis has all required fields
   * @param {object} analysis - Parsed analysis
   */
  validateAnalysis(analysis) {
    const requiredFields = [
      'skillsMatch',
      'experienceQuality',
      'educationFit',
      'careerGrowth',
      'overallAssessment'
    ];
    
    requiredFields.forEach(field => {
      if (!analysis[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
      if (field !== 'overallAssessment' && typeof analysis[field].score !== 'number') {
        throw new Error(`Missing score for ${field}`);
      }
    });
  }

  /**
   * Calculate overall AI score from aspect scores
   * @param {object} analysis - Parsed analysis
   * @returns {number} - Overall score (0-100)
   */
  calculateOverallScore(analysis) {
    const aspectWeights = weights.aspects;
    
    const weightedScore = 
      (analysis.skillsMatch.score * aspectWeights.skillsMatch) +
      (analysis.experienceQuality.score * aspectWeights.experienceQuality) +
      (analysis.educationFit.score * aspectWeights.educationFit) +
      (analysis.careerGrowth.score * aspectWeights.careerGrowth);
    
    return Math.round(weightedScore);
  }

  /**
   * Extract keywords from Job Description using Claude
   * @param {string} jobDescription - The job description
   * @returns {Promise<object>} - Extracted keywords
   */
  async extractKeywords(jobDescription) {
    try {
      const prompt = prompts.generateKeywordExtractionPrompt(jobDescription);
      
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2
      });
      
      const textContent = response.content.find(block => block.type === 'text');
      let jsonText = textContent.text.trim();
      
      // Clean markdown
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
      }
      
      return JSON.parse(jsonText);
      
    } catch (error) {
      throw new Error(`Keyword extraction failed: ${error.message}`);
    }
  }

  /**
   * Test the Claude API connection
   * @returns {Promise<boolean>} - True if successful
   */
  async testConnection() {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: 'Respond with "OK" if you can read this.'
          }
        ]
      });
      
      return response.content.length > 0;
    } catch (error) {
      throw new Error(`Claude API connection test failed: ${error.message}`);
    }
  }
}

module.exports = new ClaudeAnalyzer();
