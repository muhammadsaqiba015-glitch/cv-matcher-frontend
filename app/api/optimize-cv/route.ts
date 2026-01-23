import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
    let cvFilePath: string | null = null;

    try {
        let formData;
        try {
            formData = await request.formData();
        } catch (e) {
            console.error('Failed to parse formData:', e);
            return NextResponse.json(
                { success: false, error: 'Invalid form data' },
                { status: 400 }
            );
        }

        const cvFile = formData.get('cvFile') as File;
        const jdText = formData.get('jdText') as string;
        const level = (formData.get('level') as string) || 'honest';
        const analysisResultsStr = formData.get('analysisResults') as string;

        console.log('Optimize request received:', {
            hasCvFile: !!cvFile,
            cvFileName: cvFile?.name,
            jdTextLength: jdText?.length,
            level: level,
            hasAnalysisResults: !!analysisResultsStr
        });

        if (!cvFile) {
            return NextResponse.json(
                { success: false, error: 'CV file is required' },
                { status: 400 }
            );
        }

        if (!jdText) {
            return NextResponse.json(
                { success: false, error: 'Job description is required' },
                { status: 400 }
            );
        }

        // Parse analysis results
        let analysisResults: any = { interviewChance: 50, strengths: [], weaknesses: [] };
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
        console.log('CV file saved to:', cvFilePath);

        // Import services
        const textExtractor = require('@/utils/textExtractor');
        const claudeAnalyzer = require('@/services/claudeAnalyzer');

        // Extract text from CV
        console.log('Extracting text from CV...');
        const cvText = await textExtractor.extractFromFile(cvFilePath);

        if (!cvText || cvText.trim().length === 0) {
            return NextResponse.json(
                { success: false, error: 'Could not extract text from CV file' },
                { status: 400 }
            );
        }

        console.log('CV text extracted, length:', cvText.length);

        // Optimize CV
        console.log(`Running ${level} optimization...`);
        const optimizationResult = await claudeAnalyzer.optimizeCV(jdText, cvText, analysisResults, level);

        // Clean up temporary file
        if (cvFilePath) {
            try {
                await unlink(cvFilePath);
            } catch (e) {
                console.warn('Could not delete temp file:', e);
            }
        }

        console.log('Optimization complete! Expected score:', optimizationResult.expectedScore);

        return NextResponse.json({
            success: true,
            optimizedCV: optimizationResult.optimizedCV || '',
            changes: optimizationResult.changes || [],
            expectedScore: optimizationResult.expectedScore || 85,
            keywordsAdded: optimizationResult.keywordsAdded || [],
            level: level,
            message: level === 'aggressive'
                ? 'CV aggressively optimized for maximum match'
                : 'CV honestly improved',
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('Optimization error:', error);

        if (cvFilePath) {
            try {
                await unlink(cvFilePath);
            } catch (e) { }
        }

        return NextResponse.json(
            { success: false, error: error.message || 'Optimization failed' },
            { status: 500 }
        );
    }
}