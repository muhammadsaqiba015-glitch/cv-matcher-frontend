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
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);

    // Name
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(cv.contactInfo.name, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;

    // Contact Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const contactLine = `${cv.contactInfo.email} | ${cv.contactInfo.phone}`;
    doc.text(contactLine, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Summary
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PROFESSIONAL SUMMARY', margin, yPos);
    yPos += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(cv.summary, maxWidth);
    doc.text(summaryLines, margin, yPos);
    yPos += (summaryLines.length * 5) + 8;

    // Skills
    if (cv.skills?.technical?.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('SKILLS', margin, yPos);
      yPos += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Technical: ${cv.skills.technical.join(', ')}`, margin, yPos);
      yPos += 10;
    }

    // Experience
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PROFESSIONAL EXPERIENCE', margin, yPos);
    yPos += 6;

    cv.experience.forEach((exp: any) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${exp.title} | ${exp.company}`, margin, yPos);
      yPos += 5;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text(exp.duration, margin, yPos);
      yPos += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      exp.achievements.forEach((achievement: string) => {
        const lines = doc.splitTextToSize(`• ${achievement}`, maxWidth - 5);
        doc.text(lines, margin + 5, yPos);
        yPos += (lines.length * 5);
      });
      yPos += 5;
    });

    // Education
    if (cv.education?.length > 0 && yPos < 250) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('EDUCATION', margin, yPos);
      yPos += 6;

      cv.education.forEach((edu: any) => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${edu.degree} | ${edu.institution}`, margin, yPos);
        yPos += 5;

        if (edu.year) {
          doc.setFont('helvetica', 'italic');
          doc.text(edu.year, margin, yPos);
          yPos += 6;
        }
      });
    }

    doc.save(`Optimized_CV_${Date.now()}.pdf`);
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
            Download Optimized CV
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