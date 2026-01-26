'use client';

import React, { useState } from 'react';
import jsPDF from 'jspdf';

interface StructuredCV {
  name: string;
  title: string;
  contact: {
    phone: string;
    email: string;
    linkedin: string;
    location: string;
  };
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    date: string;
    location: string;
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    school: string;
    date: string;
    location: string;
  }>;
  skills: string[];
}

interface OptimizationSectionProps {
  optimizedCV: {
    structuredCV?: StructuredCV;
    optimizedCV: string;
    changes: string[];
    expectedScore: number;
    keywordsAdded: string[];
  };
  onReset: () => void;
}

export default function OptimizationSection({
  optimizedCV,
  onReset,
}: OptimizationSectionProps) {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedCV.optimizedCV || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    const cv = optimizedCV.structuredCV;

    if (!cv) {
      // Fallback: just use plain text
      downloadSimplePDF();
      return;
    }

    setIsGenerating(true);

    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Colors
      const accentColor: [number, number, number] = [14, 165, 233]; // #0ea5e9
      const darkText: [number, number, number] = [26, 26, 26];
      const grayText: [number, number, number] = [100, 100, 100];
      const bodyText: [number, number, number] = [68, 68, 68];

      // Layout
      const leftMargin = 15;
      const rightColStart = 140;
      const rightColWidth = 55;
      const leftColWidth = 120;

      let y = 15;

      // ========== NAME ==========
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(...darkText);
      doc.text(cv.name.toUpperCase(), leftMargin, y);
      y += 7;

      // ========== TITLE ==========
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...accentColor);
      doc.text(cv.title, leftMargin, y);
      y += 6;

      // ========== CONTACT INFO ==========
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...grayText);

      const contactItems = [];
      if (cv.contact.phone) contactItems.push(cv.contact.phone);
      if (cv.contact.email) contactItems.push(cv.contact.email);
      if (cv.contact.linkedin) contactItems.push(cv.contact.linkedin);
      if (cv.contact.location) contactItems.push(cv.contact.location);

      const contactLine = contactItems.join('  |  ');
      const contactLines = doc.splitTextToSize(contactLine, leftColWidth + 30);
      doc.text(contactLines, leftMargin, y);
      y += contactLines.length * 4 + 6;

      // ========== SUMMARY SECTION ==========
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...darkText);
      doc.text('SUMMARY', leftMargin, y);
      y += 1;

      // Underline
      doc.setDrawColor(...accentColor);
      doc.setLineWidth(0.5);
      doc.line(leftMargin, y, leftMargin + 30, y);
      y += 5;

      // Summary text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...bodyText);
      const summaryLines = doc.splitTextToSize(cv.summary, leftColWidth);
      doc.text(summaryLines, leftMargin, y);
      y += summaryLines.length * 4 + 6;

      // ========== EXPERIENCE SECTION ==========
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...darkText);
      doc.text('EXPERIENCE', leftMargin, y);
      y += 1;

      doc.setDrawColor(...accentColor);
      doc.line(leftMargin, y, leftMargin + 40, y);
      y += 5;

      // Experience items
      for (const exp of cv.experience) {
        // Check page break
        if (y > pageHeight - 40) {
          doc.addPage();
          y = 15;
        }

        // Job title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...darkText);
        doc.text(exp.title, leftMargin, y);
        y += 4;

        // Company
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...accentColor);
        doc.text(exp.company, leftMargin, y);
        y += 4;

        // Date & Location
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...grayText);
        doc.text(`${exp.date}  |  ${exp.location}`, leftMargin, y);
        y += 5;

        // Bullets
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...bodyText);

        for (const bullet of exp.bullets) {
          if (y > pageHeight - 20) {
            doc.addPage();
            y = 15;
          }

          const bulletLines = doc.splitTextToSize(`•  ${bullet}`, leftColWidth - 5);
          doc.text(bulletLines, leftMargin + 2, y);
          y += bulletLines.length * 3.5 + 1;
        }

        y += 4;
      }

      // ========== RIGHT COLUMN ==========
      let rightY = 15;

      // Light gray background for right column
      doc.setFillColor(248, 250, 252);
      doc.rect(rightColStart - 5, 0, rightColWidth + 15, pageHeight, 'F');

      // ========== EDUCATION ==========
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...darkText);
      doc.text('EDUCATION', rightColStart, rightY);
      rightY += 1;

      doc.setDrawColor(...accentColor);
      doc.line(rightColStart, rightY, rightColStart + 35, rightY);
      rightY += 5;

      for (const edu of cv.education) {
        // Degree
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...darkText);
        const degreeLines = doc.splitTextToSize(edu.degree, rightColWidth);
        doc.text(degreeLines, rightColStart, rightY);
        rightY += degreeLines.length * 3.5;

        // School
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...accentColor);
        const schoolLines = doc.splitTextToSize(edu.school, rightColWidth);
        doc.text(schoolLines, rightColStart, rightY);
        rightY += schoolLines.length * 3.5;

        // Date & Location
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...grayText);
        if (edu.location) {
          doc.text(edu.location, rightColStart, rightY);
          rightY += 3;
        }
        if (edu.date) {
          doc.text(edu.date, rightColStart, rightY);
          rightY += 3;
        }

        rightY += 4;
      }

      rightY += 4;

      // ========== SKILLS ==========
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...darkText);
      doc.text('SKILLS', rightColStart, rightY);
      rightY += 1;

      doc.setDrawColor(...accentColor);
      doc.line(rightColStart, rightY, rightColStart + 25, rightY);
      rightY += 5;

      // Skills as wrapped text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...darkText);

      const skillsText = cv.skills.join('  •  ');
      const skillLines = doc.splitTextToSize(skillsText, rightColWidth);
      doc.text(skillLines, rightColStart, rightY);

      // Save PDF
      const fileName = `${cv.name.replace(/\s+/g, '_')}_CV.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadSimplePDF = () => {
    const cvText = optimizedCV.optimizedCV || '';

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;

    let y = 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(14, 165, 233);
    doc.text('Optimized CV', pageWidth / 2, y, { align: 'center' });
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);

    const lines = doc.splitTextToSize(cvText, maxWidth);

    for (const line of lines) {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += 5;
    }

    doc.save(`Optimized_CV_${Date.now()}.pdf`);
  };

  return (
    <div className="glass-card rounded-2xl p-8 border border-green-500/30 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h3 className="text-2xl font-bold text-white flex items-center">
          <span className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center mr-3">
            ✨
          </span>
          Optimized CV
        </h3>
        <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg font-medium">
          Expected Score: {optimizedCV.expectedScore || 85}%
        </span>
      </div>

      {/* Changes Made */}
      {optimizedCV.changes && optimizedCV.changes.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3">Changes Made:</h4>
          <ul className="space-y-2">
            {optimizedCV.changes.map((change: string, index: number) => (
              <li key={index} className="flex items-start text-gray-300">
                <span className="text-green-400 mr-2 flex-shrink-0">✓</span>
                {change}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Keywords Added */}
      {optimizedCV.keywordsAdded && optimizedCV.keywordsAdded.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3">Keywords Added:</h4>
          <div className="flex flex-wrap gap-2">
            {optimizedCV.keywordsAdded.map((keyword: string, index: number) => (
              <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                + {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CV Preview */}
      <div className="bg-white/5 rounded-xl p-6 max-h-96 overflow-y-auto mb-6">
        <pre className="text-gray-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">
          {optimizedCV.optimizedCV}
        </pre>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className={`flex-1 min-w-[200px] py-4 font-bold rounded-xl transition-all duration-300 flex items-center justify-center ${isGenerating
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
            }`}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin w-5 h-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </>
          )}
        </button>

        <button
          onClick={handleCopy}
          className="flex-1 min-w-[150px] py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center"
        >
          {copied ? (
            <>
              <svg className="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Text
            </>
          )}
        </button>

        <button
          onClick={onReset}
          className="flex-1 min-w-[150px] py-4 border border-white/20 text-white font-bold rounded-xl hover:bg-white/10 transition-all duration-300"
        >
          Analyze Another CV
        </button>
      </div>
    </div>
  );
}