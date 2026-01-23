import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
    let cvFilePath: string | null = null;

    try {
        const formData = await request.formData();
        const cvFile = formData.get('cvFile') as File;
        const jdText = formData.get('jdText') as string;

        if (!cvFile || !jdText) {
            return NextResponse.json(
                { success: false, error: 'CV file and job description are required' },
                { status: 400 }
            );
        }

        // Save uploaded file temporarily
        const bytes = await cvFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = '/tmp';
        const fileName = `${Date.now()}-${cvFile.name}`;
        cvFilePath = path.join(uploadDir, fileName);

        await writeFile(cvFilePath, buffer);

        // Import services
        const textExtractor = require('@/utils/textExtractor');
        const keywordMatcher = require('@/services/keywordMatcher');
        const claudeAnalyzer = require('@/services/claudeAnalyzer');
        const scoreCalculator = require('@/services/scoreCalculator');

        // Extract text from CV
        console.log('Extracting text from CV...');
        const cvText = await textExtractor.extractFromFile(cvFilePath);

        if (!cvText || cvText.trim().length === 0) {
            return NextResponse.json(
                { success: false, error: 'Could not extract text from CV file' },
                { status: 400 }
            );
        }

        // Phase 1: Keyword Matching
        console.log('Running keyword analysis...');
        const keywordResults = keywordMatcher.analyze(jdText, cvText);

        // Phase 2: AI Analysis
        console.log('Running AI analysis...');
        const aiResults = await claudeAnalyzer.analyze(jdText, cvText);

        // Calculate final score and merge results
        console.log('Calculating final score...');
        const finalResults = scoreCalculator.calculate(keywordResults, aiResults);

        // Clean up temporary file
        if (cvFilePath) {
            try {
                await unlink(cvFilePath);
            } catch (e) {
                console.warn('Could not delete temp file:', e);
            }
        }

        console.log('Analysis complete!');
        console.log('Final Score:', finalResults.finalScore);
        console.log('Strengths count:', finalResults.strengths?.length);
        console.log('Weaknesses count:', finalResults.weaknesses?.length);

        // Return comprehensive results
        return NextResponse.json({
            success: true,
            interviewChance: finalResults.finalScore,
            recommendation: finalResults.recommendation,
            breakdown: finalResults.breakdown,
            aspects: finalResults.aspects,
            strengths: finalResults.strengths || [],
            weaknesses: finalResults.weaknesses || [],
            summary: finalResults.summary,
            detailedAssessment: finalResults.detailedAssessment,
            keywordAnalysis: {
                matched: keywordResults.matched || [],
                missing: keywordResults.missing || [],
                matchPercentage: keywordResults.matchPercentage
            },
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('Analysis error:', error);

        // Clean up on error
        if (cvFilePath) {
            try {
                await unlink(cvFilePath);
            } catch (e) {
                // Ignore cleanup errors
            }
        }

        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Analysis failed',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}