const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * PDF Generator Service
 * Creates clean, ATS-friendly PDF CVs
 */
class PDFGenerator {

    /**
     * Generate PDF from optimized CV data
     * @param {object} cvData - Optimized CV data
     * @param {string} outputPath - Where to save the PDF
     * @returns {Promise<string>} - Path to generated PDF
     */
    async generatePDF(cvData, outputPath) {
        return new Promise((resolve, reject) => {
            try {
                // Create PDF document
                const doc = new PDFDocument({
                    size: 'A4',
                    margins: {
                        top: 50,
                        bottom: 50,
                        left: 50,
                        right: 50
                    }
                });

                // Pipe to file
                const stream = fs.createWriteStream(outputPath);
                doc.pipe(stream);

                // Build the PDF
                this.buildPDF(doc, cvData);

                // Finalize
                doc.end();

                stream.on('finish', () => {
                    resolve(outputPath);
                });

                stream.on('error', (error) => {
                    reject(error);
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Build the PDF content
     */
    buildPDF(doc, cvData) {
        const cv = cvData.optimizedCV || cvData;

        // Colors
        const primaryColor = '#2C3E50';
        const secondaryColor = '#34495E';
        const accentColor = '#3498DB';

        // Header - Name and Contact
        doc.fontSize(24)
            .fillColor(primaryColor)
            .font('Helvetica-Bold')
            .text(cv.contactInfo.name, { align: 'center' });

        doc.moveDown(0.3);

        // Contact info
        const contactParts = [];
        if (cv.contactInfo.email) contactParts.push(cv.contactInfo.email);
        if (cv.contactInfo.phone) contactParts.push(cv.contactInfo.phone);
        if (cv.contactInfo.location) contactParts.push(cv.contactInfo.location);

        doc.fontSize(10)
            .fillColor(secondaryColor)
            .font('Helvetica')
            .text(contactParts.join('  |  '), { align: 'center' });

        if (cv.contactInfo.linkedin || cv.contactInfo.github) {
            doc.moveDown(0.2);
            const links = [];
            if (cv.contactInfo.linkedin) links.push(cv.contactInfo.linkedin);
            if (cv.contactInfo.github) links.push(cv.contactInfo.github);
            doc.fontSize(9)
                .fillColor(accentColor)
                .text(links.join('  |  '), { align: 'center', link: cv.contactInfo.linkedin || cv.contactInfo.github });
        }

        doc.moveDown(1);
        this.addLine(doc);
        doc.moveDown(0.5);

        // Professional Summary
        this.addSection(doc, 'PROFESSIONAL SUMMARY', primaryColor);
        doc.fontSize(10)
            .fillColor('#000000')
            .font('Helvetica')
            .text(cv.summary, {
                align: 'justify',
                lineGap: 2
            });

        doc.moveDown(1);

        // Skills
        if (cv.skills && (cv.skills.technical?.length > 0 || cv.skills.soft?.length > 0)) {
            this.addSection(doc, 'SKILLS', primaryColor);

            if (cv.skills.technical?.length > 0) {
                doc.fontSize(10)
                    .fillColor('#000000')
                    .font('Helvetica-Bold')
                    .text('Technical: ', { continued: true })
                    .font('Helvetica')
                    .text(cv.skills.technical.join(', '));
                doc.moveDown(0.3);
            }

            if (cv.skills.soft?.length > 0) {
                doc.fontSize(10)
                    .fillColor('#000000')
                    .font('Helvetica-Bold')
                    .text('Soft Skills: ', { continued: true })
                    .font('Helvetica')
                    .text(cv.skills.soft.join(', '));
            }

            doc.moveDown(1);
        }

        // Professional Experience
        this.addSection(doc, 'PROFESSIONAL EXPERIENCE', primaryColor);

        cv.experience.forEach((exp, index) => {
            // Job title and company
            doc.fontSize(11)
                .fillColor(primaryColor)
                .font('Helvetica-Bold')
                .text(exp.title, { continued: true })
                .fillColor(secondaryColor)
                .text(` | ${exp.company}`);

            // Duration and location
            doc.fontSize(9)
                .fillColor(secondaryColor)
                .font('Helvetica-Oblique')
                .text(`${exp.duration}${exp.location ? '  |  ' + exp.location : ''}`);

            doc.moveDown(0.3);

            // Achievements
            exp.achievements.forEach(achievement => {
                doc.fontSize(10)
                    .fillColor('#000000')
                    .font('Helvetica')
                    .text('• ', { continued: true })
                    .text(achievement, {
                        indent: 15,
                        align: 'left',
                        lineGap: 1
                    });
                doc.moveDown(0.2);
            });

            if (index < cv.experience.length - 1) {
                doc.moveDown(0.5);
            }
        });

        doc.moveDown(1);

        // Education
        if (cv.education?.length > 0) {
            this.addSection(doc, 'EDUCATION', primaryColor);

            cv.education.forEach((edu, index) => {
                doc.fontSize(11)
                    .fillColor(primaryColor)
                    .font('Helvetica-Bold')
                    .text(edu.degree, { continued: true })
                    .fillColor(secondaryColor)
                    .font('Helvetica')
                    .text(` | ${edu.institution}`);

                if (edu.year) {
                    doc.fontSize(9)
                        .fillColor(secondaryColor)
                        .font('Helvetica-Oblique')
                        .text(edu.year);
                }

                if (edu.details) {
                    doc.fontSize(9)
                        .fillColor('#000000')
                        .font('Helvetica')
                        .text(edu.details);
                }

                if (index < cv.education.length - 1) {
                    doc.moveDown(0.5);
                }
            });

            doc.moveDown(1);
        }

        // Projects
        if (cv.projects?.length > 0) {
            this.addSection(doc, 'PROJECTS', primaryColor);

            cv.projects.forEach((project, index) => {
                doc.fontSize(11)
                    .fillColor(primaryColor)
                    .font('Helvetica-Bold')
                    .text(project.name);

                doc.fontSize(10)
                    .fillColor('#000000')
                    .font('Helvetica')
                    .text(project.description, { lineGap: 1 });

                if (project.technologies?.length > 0) {
                    doc.fontSize(9)
                        .fillColor(secondaryColor)
                        .font('Helvetica-Oblique')
                        .text(`Technologies: ${project.technologies.join(', ')}`);
                }

                if (index < cv.projects.length - 1) {
                    doc.moveDown(0.5);
                }
            });

            doc.moveDown(1);
        }

        // Certifications
        if (cv.certifications?.length > 0) {
            this.addSection(doc, 'CERTIFICATIONS', primaryColor);

            cv.certifications.forEach(cert => {
                doc.fontSize(10)
                    .fillColor('#000000')
                    .font('Helvetica')
                    .text('• ', { continued: true })
                    .text(cert);
                doc.moveDown(0.2);
            });
        }
    }

    /**
     * Add section header
     */
    addSection(doc, title, color) {
        doc.fontSize(13)
            .fillColor(color)
            .font('Helvetica-Bold')
            .text(title.toUpperCase());

        this.addLine(doc, color);
        doc.moveDown(0.5);
    }

    /**
     * Add horizontal line
     */
    addLine(doc, color = '#CCCCCC') {
        const y = doc.y;
        doc.strokeColor(color)
            .lineWidth(0.5)
            .moveTo(50, y)
            .lineTo(545, y)
            .stroke();
        doc.moveDown(0.3);
    }

    /**
     * Get suggested filename
     */
    getSuggestedFilename(cvData) {
        const cv = cvData.optimizedCV || cvData;
        const name = cv.contactInfo.name.replace(/\s+/g, '_');
        const date = new Date().toISOString().split('T')[0];
        return `${name}_CV_Optimized_${date}.pdf`;
    }
}

module.exports = new PDFGenerator();