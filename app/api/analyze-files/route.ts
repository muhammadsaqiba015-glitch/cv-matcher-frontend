import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { Resend } from 'resend';

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

        // Extract text
        const cvText = await textExtractor.extractFromFile(cvFilePath);

        // Analyze
        const keywordResults = keywordMatcher.analyze(jdText, cvText);
        const aiResults = await claudeAnalyzer.analyze(jdText, cvText);
        const finalResults = scoreCalculator.calculate(keywordResults, aiResults);

        // Clean up
        if (cvFilePath) {
            await unlink(cvFilePath);
        }

        // Send email notification
        try {
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
                from: 'CV Matcher <onboarding@resend.dev>',
                to: 'Muhammadsaqiba015@gmail.com', // REPLACE WITH YOUR EMAIL
                subject: '🎯 New CV Analyzed!',
                html: `
          <h2>Someone just analyzed their CV!</h2>
          <p><strong>Interview Chance:</strong> ${finalResults.finalScore}%</p>
          <p><strong>Recommendation:</strong> ${finalResults.recommendation.level}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        `
            });
        } catch (emailError) {
            console.error('Email notification failed:', emailError);
            // Don't fail the request if email fails
        }

        return NextResponse.json({
            success: true,
            interviewChance: finalResults.finalScore,
            recommendation: finalResults.recommendation,
            breakdown: finalResults.breakdown,
            aspects: finalResults.aspects,
            strengths: finalResults.strengths,
            weaknesses: finalResults.weaknesses,
            summary: finalResults.summary
        });

    } catch (error: any) {
        // Clean up on error
        if (cvFilePath) {
            try {
                await unlink(cvFilePath);
            } catch (e) {
                console.error('Failed to delete file:', e);
            }
        }

        console.error('Analysis error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}