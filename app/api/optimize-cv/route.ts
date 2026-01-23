import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

export const maxDuration = 60; // Allow up to 60 seconds for optimization

export async function POST(request: NextRequest) {
    let cvFilePath: string | null = null;

    try {
        const formData = await request.formData();
        const cvFile = formData.get('cvFile') as File;
        const jdText = formData.get('jdText') as string;
        const level = formData.get('level') as string || 'honest';
        const analysisResultsStr = formData.get('analysisResults') as string;

        if (!cvFile || !jdText) {
            return NextResponse.json(
                { success: false, error: 'CV file and job description are required' },
                { status: 400 }
            );
        }

        // Parse analysis results if provided
        let analysisResults: any = {};
        if (analysisResultsStr) {
            try {
                analysisResults = JSON.parse(analysisResultsStr);
            } catch (e) {
                console.warn('Could not parse analysis results:', e);
            }
        }

        // Save uploaded file temporarily
        const bytes = await cvFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = '/tmp';
        const fileName = `${Date.now()}-${cvFile.name}`;
        cvFilePath = path.join(uploadDir, fileName);

        await writeFile(cvFilePath, buffer);

        // Import services dynamically
        let textExtractor, claudeAnalyzer;
        try {
            textExtractor = require('@/utils/textExtractor');
            claudeAnalyzer = require('@/services/claudeAnalyzer');
        } catch (importError) {
            console.error('Failed to import services:', importError);
            return NextResponse.json(
                { success: false, error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Extract text from CV
        console.log('Extracting text from CV...');
        let cvText;
        try {
            cvText = await textExtractor.extractFromFile(cvFilePath);
        } catch (extractError: any) {
            console.error('Text extraction error:', extractError);
            return NextResponse.json(
                { success: false, error: `Failed to extract text: ${extractError.message}` },
                { status: 400 }
            );
        }

        if (!cvText || cvText.trim().length === 0) {
            return NextResponse.json(
                { success: false, error: 'Could not extract text from CV file' },
                { status: 400 }
            );
        }

        // Optimize CV
        console.log(`Running ${level} optimization...`);
        let optimizationResult;
        try {
            optimizationResult = await claudeAnalyzer.optimizeCV(jdText, cvText, analysisResults, level);
        } catch (optimizeError: any) {
            console.error('Optimization error:', optimizeError);
            return NextResponse.json(
                { success: false, error: `Optimization failed: ${optimizeError.message}` },
                { status: 500 }
            );
        }

        // Clean up temporary file
        if (cvFilePath) {
            try {
                await unlink(cvFilePath);
            } catch (e) {
                console.warn('Could not delete temp file:', e);
            }
        }

        console.log('Optimization complete!');
        console.log('Expected Score:', optimizationResult.expectedScore);

        const responseMessage = level === 'aggressive'
            ? 'CV aggressively optimized to maximize job match (target: 100%)'
            : 'CV honestly improved while maintaining authenticity';

        return NextResponse.json({
            success: true,
            optimizedCV: optimizationResult.optimizedCV || 'Optimization completed but no CV text generated',
            changes: optimizationResult.changes || [],
            expectedScore: optimizationResult.expectedScore || 85,
            keywordsAdded: optimizationResult.keywordsAdded || [],
            level: level,
            message: responseMessage,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('Unexpected optimization error:', error);

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
                error: error.message || 'Optimization failed unexpectedly'
            },
            { status: 500 }
        );
    }
}