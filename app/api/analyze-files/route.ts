import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

export const maxDuration = 60;

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

        const bytes = await cvFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = '/tmp';
        const fileName = `${Date.now()}-${cvFile.name}`;
        cvFilePath = path.join(uploadDir, fileName);

        await writeFile(cvFilePath, buffer);

        const textExtractor = require('@/utils/textExtractor');
        const keywordMatcher = require('@/services/keywordMatcher');
        const claudeAnalyzer = require('@/services/claudeAnalyzer');
        const scoreCalculator = require('@/services/scoreCalculator');

        console.log('Extracting text from CV...');
        const cvText = await textExtractor.extractFromFile(cvFilePath);

        if (!cvText || cvText.trim().length === 0) {
            return NextResponse.json(
                { success: false, error: 'Could not extract text from CV file' },
                { status: 400 }
            );
        }

        console.log('Running AI analysis...');
        const aiResults = await claudeAnalyzer.analyze(jdText, cvText);

        // Check if AI detected fake document
        if (aiResults.isFake) {
            if (cvFilePath) {
                try { await unlink(cvFilePath); } catch (e) { }
            }

            return NextResponse.json({
                success: true,
                isFake: true,
                interviewChance: 0,
                recommendation: {
                    level: '🚫 Invalid Document',
                    message: aiResults.summary
                },
                breakdown: { keywordScore: 0, aiScore: 0 },
                aspects: aiResults.aspects,
                strengths: [],
                weaknesses: [],
                summary: aiResults.summary,
                detailedAssessment: aiResults.detailedAssessment,
                fakeReason: aiResults.fakeReason
            });
        }

        console.log('Running keyword analysis...');
        const keywordResults = keywordMatcher.analyze(jdText, cvText);

        console.log('Calculating final score...');
        const finalResults = scoreCalculator.calculate(keywordResults, aiResults);

        if (cvFilePath) {
            try { await unlink(cvFilePath); } catch (e) { }
        }

        console.log('Analysis complete! Score:', finalResults.finalScore);
        console.log('Strengths:', finalResults.strengths?.length);
        console.log('Weaknesses:', finalResults.weaknesses?.length);

        return NextResponse.json({
            success: true,
            isFake: false,
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

        if (cvFilePath) {
            try { await unlink(cvFilePath); } catch (e) { }
        }

        return NextResponse.json(
            { success: false, error: error.message || 'Analysis failed' },
            { status: 500 }
        );
    }
}