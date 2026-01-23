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
        const analysisMethod = formData.get('analysisMethod') as string || 'both'; // NEW

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

        let finalResults;

        // Analyze based on method
        if (analysisMethod === 'keyword') {
            // Keyword only
            const keywordResults = keywordMatcher.analyze(jdText, cvText);
            finalResults = {
                finalScore: keywordResults.matchPercentage,
                recommendation: getRecommendation(keywordResults.matchPercentage),
                breakdown: {
                    keywordScore: keywordResults.matchPercentage,
                    aiScore: 0
                },
                aspects: keywordResults.aspects || {},
                strengths: keywordResults.strengths || [],
                weaknesses: keywordResults.weaknesses || [],
                summary: `Based on keyword analysis, your CV matches ${keywordResults.matchPercentage}% of the job requirements.`
            };
        } else if (analysisMethod === 'ai') {
            // AI only
            const aiResults = await claudeAnalyzer.analyze(jdText, cvText);
            finalResults = {
                finalScore: aiResults.overallScore,
                recommendation: getRecommendation(aiResults.overallScore),
                breakdown: {
                    keywordScore: 0,
                    aiScore: aiResults.overallScore
                },
                aspects: aiResults.aspects || {},
                strengths: aiResults.strengths || [],
                weaknesses: aiResults.weaknesses || [],
                summary: aiResults.summary || `AI analysis shows ${aiResults.overallScore}% match with the job requirements.`
            };
        } else {
            // Both (hybrid) - Best accuracy
            const keywordResults = keywordMatcher.analyze(jdText, cvText);
            const aiResults = await claudeAnalyzer.analyze(jdText, cvText);
            finalResults = scoreCalculator.calculate(keywordResults, aiResults);
        }

        // Clean up
        if (cvFilePath) {
            await unlink(cvFilePath);
        }

        // Send email notification
        try {
            console.log('Attempting to send analysis email notification...');

            const resend = new Resend(process.env.RESEND_API_KEY);
            const emailResult = await resend.emails.send({
                from: 'CV Matcher <onboarding@resend.dev>',
                to: 'your-email@example.com', // YOUR EMAIL HERE
                subject: '🎯 New CV Analyzed!',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3B82F6;">🎯 New CV Analyzed!</h2>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>CV File:</strong> ${cvFile.name}</p>
              <p style="margin: 10px 0;"><strong>Analysis Method:</strong> ${analysisMethod}</p>
              <p style="margin: 10px 0;"><strong>Interview Chance:</strong> <span style="color: ${finalResults.finalScore >= 65 ? '#10B981' : '#F59E0B'}; font-size: 24px; font-weight: bold;">${finalResults.finalScore}%</span></p>
              <p style="margin: 10px 0;"><strong>Recommendation:</strong> ${finalResults.recommendation.level}</p>
              <p style="margin: 10px 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `
            });
            console.log('Email sent successfully:', emailResult);
        } catch (emailError: any) {
            console.error('Email notification failed:', emailError);
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

// Helper function for recommendations
function getRecommendation(score: number) {
    if (score >= 80) {
        return {
            level: 'Excellent Match',
            message: 'Your CV is an excellent match for this position. You have a strong chance of getting an interview.'
        };
    } else if (score >= 65) {
        return {
            level: 'Good Match',
            message: 'Your CV shows good alignment with the job requirements. Consider highlighting relevant skills more prominently.'
        };
    } else if (score >= 45) {
        return {
            level: 'Moderate Match',
            message: 'Your CV has some relevant qualifications but could be improved to better match the job requirements.'
        };
    } else if (score >= 30) {
        return {
            level: 'Low Match',
            message: 'Your CV shows limited alignment with the job requirements. Consider significant improvements or targeting a different role.'
        };
    } else {
        return {
            level: 'Poor Match',
            message: 'Your CV does not align well with this job. Consider focusing on roles that better match your experience.'
        };
    }
}