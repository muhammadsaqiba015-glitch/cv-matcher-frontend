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
        const optimizationLevel = formData.get('optimizationLevel') as string;
        const analysisResultsStr = formData.get('analysisResults') as string;

        if (!cvFile || !jdText || !analysisResultsStr) {
            return NextResponse.json(
                { success: false, error: 'CV file, job description, and analysis results are required' },
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
        const cvOptimizer = require('@/services/cvOptimizer');

        // Extract text
        const cvText = await textExtractor.extractFromFile(cvFilePath);
        const parsedResults = JSON.parse(analysisResultsStr);

        // Optimize
        const optimizedData = await cvOptimizer.optimizeCV(
            cvText,
            jdText,
            parsedResults,
            optimizationLevel || 'honest'
        );

        // Clean up
        if (cvFilePath) {
            await unlink(cvFilePath);
        }

        // Send email notification
        try {
            console.log('Attempting to send optimization email notification...');
            console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
            console.log('RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length);

            const resend = new Resend(process.env.RESEND_API_KEY);
            const emailResult = await resend.emails.send({
                from: 'CV Matcher <onboarding@resend.dev>',
                to: 'muhammadsaqiba015@gmail.com', // REPLACE WITH YOUR EMAIL
                subject: '📄 New CV Generated!',
                html: `
          <h2>Someone just generated an optimized CV!</h2>
          <p><strong>Optimization Level:</strong> ${optimizationLevel || 'honest'}</p>
          <p><strong>Changes Made:</strong> ${optimizedData.changesSummary?.totalChanges || 0}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        `
            });
            console.log('Email sent successfully:', emailResult);
        } catch (emailError: any) {
            console.error('Email notification failed:', emailError);
            console.error('Error message:', emailError.message);
            console.error('Error name:', emailError.name);
            console.error('Full error:', JSON.stringify(emailError, null, 2));
        }

        return NextResponse.json({
            success: true,
            ...optimizedData
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

        console.error('Optimization error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}