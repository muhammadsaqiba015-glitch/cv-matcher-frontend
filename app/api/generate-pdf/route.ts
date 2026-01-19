import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { unlink } from 'fs/promises';

export async function POST(request: NextRequest) {
    let tempPdfPath: string | null = null;

    try {
        const body = await request.json();
        const { optimizedCV } = body;

        if (!optimizedCV) {
            return NextResponse.json(
                { success: false, error: 'Optimized CV data is required' },
                { status: 400 }
            );
        }

        // Import service
        const pdfGenerator = require('@/services/pdfGenerator');

        // Generate PDF
        const uploadDir = path.join(process.cwd(), 'uploads');

        // Ensure upload directory exists
        const fs = require('fs');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        tempPdfPath = path.join(uploadDir, `cv_${Date.now()}.pdf`);
        await pdfGenerator.generatePDF(optimizedCV, tempPdfPath);

        // Read the PDF file
        const pdfBuffer = fs.readFileSync(tempPdfPath);

        // Clean up
        await unlink(tempPdfPath);

        // Return PDF as download
        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="Optimized_CV.pdf"',
            },
        });

    } catch (error: any) {
        // Clean up on error
        if (tempPdfPath) {
            try {
                await unlink(tempPdfPath);
            } catch (e) {
                console.error('Failed to delete PDF:', e);
            }
        }

        console.error('PDF generation error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}