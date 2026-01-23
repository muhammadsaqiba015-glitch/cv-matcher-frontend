import React from 'react';
import jsPDF from 'jspdf';

interface OptimizationSectionProps {
  optimizedCV: any;
  onReset: () => void;
}

export default function OptimizationSection({
  optimizedCV,
  onReset,
}: OptimizationSectionProps) {

  const handleDownloadPDF = () => {
    const cv = optimizedCV.optimizedCV;
    const doc = new jsPDF();

    let yPos = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    const lineHeight = 6;

    // Helper function to check if we need a new page
    const checkPageBreak = (requiredSpace: number) => {
      if (yPos + requiredSpace > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
        return true;
      }
      return false;
    };

    // Helper function to draw a horizontal line
    const drawLine = (y: number, color: string = '#3B82F6') => {
      doc.setDrawColor(color);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
    };

    // Helper function for section headers
    const addSectionHeader = (title: string) => {
      checkPageBreak(15);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246); // Blue color
      doc.text(title.toUpperCase(), margin, yPos);
      yPos += 3;
      drawLine(yPos, '#3B82F6');
      yPos += 8;
      doc.setTextColor(0, 0, 0); // Reset to black
    };

    // ============ HEADER - Name and Contact ============
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55); // Dark gray
    doc.text(cv.contactInfo.name, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;

    // Contact info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99); // Medium gray
    const contactLine = `${cv.contactInfo.email} | ${cv.contactInfo.phone}`;
    doc.text(contactLine, pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;

    // Horizontal line under header
    drawLine(yPos, '#E5E7EB');
    yPos += 10;

    // ============ PROFESSIONAL SUMMARY ============
    addSectionHeader('Professional Summary');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 65, 81);
    const summaryLines = doc.splitTextToSize(cv.summary, maxWidth);
    summaryLines.forEach((line: string) => {
      checkPageBreak(lineHeight);
      doc.text(line, margin, yPos);
      yPos += lineHeight;
    });
    yPos += 5;

    // ============ SKILLS ============
    if (cv.skills?.technical?.length > 0 || cv.skills?.soft?.length > 0) {
      addSectionHeader('Core Competencies');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      if (cv.skills.technical?.length > 0) {
        checkPageBreak(15);
        doc.setFont('helvetica', 'bold');
        doc.text('Technical Skills:', margin, yPos);
        yPos += lineHeight;

        doc.setFont('helvetica', 'normal');
        const techSkills = cv.skills.technical.join(' • ');
        const techLines = doc.splitTextToSize(techSkills, maxWidth - 5);
        techLines.forEach((line: string) => {
          checkPageBreak(lineHeight);
          doc.text(line, margin + 5, yPos);
          yPos += lineHeight;
        });
        yPos += 3;
      }

      if (cv.skills.soft?.length > 0) {
        checkPageBreak(15);
        doc.setFont('helvetica', 'bold');
        doc.text('Professional Skills:', margin, yPos);
        yPos += lineHeight;

        doc.setFont('helvetica', 'normal');
        const softSkills = cv.skills.soft.join(' • ');
        const softLines = doc.splitTextToSize(softSkills, maxWidth - 5);
        softLines.forEach((line: string) => {
          checkPageBreak(lineHeight);
          doc.text(line, margin + 5, yPos);
          yPos += lineHeight;
        });
      }

      yPos += 5;
    }

    // ============ PROFESSIONAL EXPERIENCE ============
    if (cv.experience?.length > 0) {
      addSectionHeader('Professional Experience');

      cv.experience.forEach((exp: any, index: number) => {
        checkPageBreak(30);

        // Job title and company
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(31, 41, 55);
        doc.text(exp.title, margin, yPos);
        yPos += lineHeight;

        // Company and duration
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(59, 130, 246); // Blue
        doc.text(exp.company, margin, yPos);

        doc.setFont('helvetica', 'italic');
        doc.setTextColor(107, 114, 128); // Gray
        doc.text(exp.duration, pageWidth - margin, yPos, { align: 'right' });
        yPos += lineHeight + 2;

        // Achievements
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(55, 65, 81);

        exp.achievements.forEach((achievement: string, achIndex: number) => {
          checkPageBreak(20);

          // Bullet point
          doc.setFontSize(12);
          doc.text('•', margin + 2, yPos);
          doc.setFontSize(10);

          // Achievement text
          const achievementLines = doc.splitTextToSize(achievement, maxWidth - 10);
          achievementLines.forEach((line: string, lineIndex: number) => {
            if (lineIndex > 0) checkPageBreak(lineHeight);
            doc.text(line, margin + 8, yPos);
            yPos += lineHeight;
          });
        });

        // Add spacing between jobs
        if (index < cv.experience.length - 1) {
          yPos += 5;
          // Light separator line
          doc.setDrawColor(229, 231, 235);
          doc.setLineWidth(0.3);
          doc.line(margin + 10, yPos, pageWidth - margin - 10, yPos);
          yPos += 5;
        }
      });

      yPos += 5;
    }

    // ============ EDUCATION ============
    if (cv.education?.length > 0) {
      addSectionHeader('Education');

      cv.education.forEach((edu: any, index: number) => {
        checkPageBreak(20);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(31, 41, 55);
        doc.text(edu.degree, margin, yPos);
        yPos += lineHeight;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(59, 130, 246);
        doc.text(edu.institution, margin, yPos);

        if (edu.year) {
          doc.setTextColor(107, 114, 128);
          doc.text(edu.year, pageWidth - margin, yPos, { align: 'right' });
        }

        if (index < cv.education.length - 1) {
          yPos += lineHeight + 3;
        } else {
          yPos += lineHeight;
        }
      });
    }

    // ============ CERTIFICATIONS (if exists) ============
    if (cv.certifications?.length > 0) {
      yPos += 5;
      addSectionHeader('Certifications');

      cv.certifications.forEach((cert: any) => {
        checkPageBreak(10);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(55, 65, 81);
        doc.text(`• ${cert}`, margin + 2, yPos);
        yPos += lineHeight;
      });
    }

    // ============ FOOTER ============
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.setFont('helvetica', 'italic');
      doc.text(
        `${cv.contactInfo.name} - Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Save the PDF
    doc.save(`${cv.contactInfo.name}_CV_Optimized.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Success Message */}
      <div className="relative glass-card rounded-3xl p-12 border-2 border-green-500/30 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-3xl"></div>

        <div className="relative text-center">
          <div className="inline-flex justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center animate-bounce shadow-2xl shadow-green-500/50">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h2 className="text-4xl font-black text-white mb-3">CV Optimized Successfully!</h2>
          <p className="text-gray-300 text-lg">
            Your CV has been tailored to match the job description perfectly
          </p>
        </div>
      </div>

      {/* Changes Made */}
      {optimizedCV.changesSummary && (
        <div className="glass-card rounded-2xl p-8 border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            Changes Made
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {optimizedCV.changesSummary.addedKeywords?.length > 0 && (
              <div className="glass rounded-xl p-5 border border-green-500/30 bg-gradient-to-br from-green-500/5 to-green-600/5">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-green-300 mb-2">Added Keywords</p>
                    <p className="text-sm text-gray-400">
                      {optimizedCV.changesSummary.addedKeywords.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {optimizedCV.changesSummary.emphasizedSkills?.length > 0 && (
              <div className="glass rounded-xl p-5 border border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-blue-600/5">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-300 mb-2">Emphasized Skills</p>
                    <p className="text-sm text-gray-400">
                      {optimizedCV.changesSummary.emphasizedSkills.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {optimizedCV.changesSummary.reorderedExperience && (
              <div className="glass rounded-xl p-5 border border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-purple-600/5">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-purple-300">
                      Reordered Experience
                    </p>
                    <p className="text-sm text-gray-400">Most relevant first</p>
                  </div>
                </div>
              </div>
            )}

            {optimizedCV.changesSummary.optimizedSummary && (
              <div className="glass rounded-xl p-5 border border-pink-500/30 bg-gradient-to-br from-pink-500/5 to-pink-600/5">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-5 h-5 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-pink-300">
                      Optimized Summary
                    </p>
                    <p className="text-sm text-gray-400">Professional summary enhanced</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-center">
              <div className="px-6 py-3 glass rounded-xl border border-white/20">
                <p className="text-sm font-bold text-white">
                  Total Changes: <span className="text-2xl gradient-text ml-2">{optimizedCV.changesSummary.totalChanges}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Download Actions */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={handleDownloadPDF}
          className="group px-10 py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300 btn-modern"
        >
          <span className="flex items-center justify-center">
            <svg className="w-6 h-6 mr-3 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Professional CV
          </span>
        </button>
        <button
          onClick={onReset}
          className="px-10 py-5 glass-card border-2 border-white/20 text-white font-bold text-lg rounded-2xl hover:bg-white/10 transition-all duration-300"
        >
          Analyze Another CV
        </button>
      </div>
    </div>
  );
}