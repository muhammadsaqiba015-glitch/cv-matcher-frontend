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
        const level = (formData.get('level') as string) || 'honest';
        const analysisResultsStr = formData.get('analysisResults') as string;

        console.log('Optimize request:', {
            hasCvFile: !!cvFile,
            jdLength: jdText?.length,
            level
        });

        if (!cvFile) {
            return NextResponse.json({ success: false, error: 'CV file is required' }, { status: 400 });
        }

        if (!jdText) {
            return NextResponse.json({ success: false, error: 'Job description is required' }, { status: 400 });
        }

        // Parse analysis results
        let analysisResults = { interviewChance: 50, strengths: [], weaknesses: [] };
        if (analysisResultsStr) {
            try {
                analysisResults = JSON.parse(analysisResultsStr);
            } catch (e) {
                console.warn('Could not parse analysis results');
            }
        }

        // Save file
        const bytes = await cvFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        cvFilePath = path.join('/tmp', `${Date.now()}-${cvFile.name}`);
        await writeFile(cvFilePath, buffer);

        // Extract text
        const textExtractor = require('@/utils/textExtractor');
        const cvText = await textExtractor.extractFromFile(cvFilePath);

        if (!cvText || cvText.trim().length === 0) {
            return NextResponse.json({ success: false, error: 'Could not extract CV text' }, { status: 400 });
        }

        console.log('CV extracted, length:', cvText.length);

        // Optimize
        const claudeAnalyzer = require('@/services/claudeAnalyzer');
        const result = await claudeAnalyzer.optimizeCV(jdText, cvText, analysisResults, level);

        // Cleanup
        try { await unlink(cvFilePath); } catch (e) { }

        console.log('Optimization done, expectedScore:', result.expectedScore);

        return NextResponse.json({
            success: true,
            optimizedCV: result.optimizedCV || '',
            changes: result.changes || [],
            expectedScore: result.expectedScore || 80,
            keywordsAdded: result.keywordsAdded || [],
            level: level
        });

    } catch (error: any) {
        console.error('Route error:', error.message);

        if (cvFilePath) {
            try { await unlink(cvFilePath); } catch (e) { }
        }

        return NextResponse.json({
            success: false,
            error: error.message || 'Optimization failed'
        }, { status: 500 });
    }
}