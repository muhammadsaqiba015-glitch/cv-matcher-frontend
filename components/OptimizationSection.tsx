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

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedCV.optimizedCV || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Professional Two-Column PDF (Template 1)
  const handleDownloadProfessionalPDF = () => {
    const cv = optimizedCV.structuredCV;

    if (!cv) {
      // Fallback to simple PDF if no structured data
      handleDownloadSimplePDF();
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Layout settings
    const leftColX = 15;
    const leftColWidth = 125;
    const rightColX = 145;
    const rightColWidth = 50;
    const accentColor: [number, number, number] = [14, 165, 233]; // #0ea5e9

    let leftY = 20;
    let rightY = 20;

    // ============ LEFT COLUMN ============

    // Name
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 26, 26);
    doc.text(cv.name.toUpperCase(), leftColX, leftY);
    leftY += 7;

    // Title
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text(cv.title, leftColX, leftY);
    leftY += 8;

    // Contact Row
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);

    const contactParts = [];
    if (cv.contact.phone) contactParts.push(`📞 ${cv.contact.phone}`);
    if (cv.contact.email) contactParts.push(`✉ ${cv.contact.email}`);
    if (cv.contact.linkedin) contactParts.push(`🔗 ${cv.contact.linkedin}`);
    if (cv.contact.location) contactParts.push(`📍 ${cv.contact.location}`);

    const contactLine = contactParts.join('  |  ');
    const contactLines = doc.splitTextToSize(contactLine, leftColWidth);
    doc.text(contactLines, leftColX, leftY);
    leftY += contactLines.length * 4 + 8;

    // SUMMARY Section
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 26, 26);
    doc.text('SUMMARY', leftColX, leftY);
    leftY += 2;

    // Underline
    doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setLineWidth(0.5);
    doc.line(leftColX, leftY, leftColX + leftColWidth, leftY);
    leftY += 6;

    // Summary text
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(68, 68, 68);
    const summaryLines = doc.splitTextToSize(cv.summary, leftColWidth);
    doc.text(summaryLines, leftColX, leftY);
    leftY += summaryLines.length * 4 + 8;

    // EXPERIENCE Section
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 26, 26);
    doc.text('EXPERIENCE', leftColX, leftY);
    leftY += 2;

    // Underline
    doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.line(leftColX, leftY, leftColX + leftColWidth, leftY);
    leftY += 6;

    // Experience items
    cv.experience.forEach((exp) => {
      // Check if we need a new page
      if (leftY > pageHeight - 40) {
        doc.addPage();
        leftY = 20;
      }

      // Job title
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 26, 26);
      doc.text(exp.title, leftColX, leftY);
      leftY += 4;

      // Company
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text(exp.company, leftColX, leftY);
      leftY += 4;

      // Date & Location
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`📅 ${exp.date}    📍 ${exp.location}`, leftColX, leftY);
      leftY += 5;

      // Bullets
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(68, 68, 68);

      exp.bullets.forEach((bullet) => {
        if (leftY > pageHeight - 20) {
          doc.addPage();
          leftY = 20;
        }

        const bulletLines = doc.splitTextToSize(`• ${bullet}`, leftColWidth - 5);
        doc.text(bulletLines, leftColX + 3, leftY);
        leftY += bulletLines.length * 3.5 + 1;
      });

      leftY += 4;
    });

    // ============ RIGHT COLUMN ============

    // EDUCATION Section
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 26, 26);
    doc.text('EDUCATION', rightColX, rightY);
    rightY += 2;

    // Underline
    doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.line(rightColX, rightY, rightColX + rightColWidth, rightY);
    rightY += 6;

    // Education items
    cv.education.forEach((edu) => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 26, 26);
      const degreeLines = doc.splitTextToSize(edu.degree, rightColWidth);
      doc.text(degreeLines, rightColX, rightY);
      rightY += degreeLines.length * 3.5;

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      const schoolLines = doc.splitTextToSize(edu.school, rightColWidth);
      doc.text(schoolLines, rightColX, rightY);
      rightY += schoolLines.length * 3.5;

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      if (edu.date) doc.text(`📅 ${edu.date}`, rightColX, rightY);
      rightY += 3;
      if (edu.location) doc.text(`📍 ${edu.location}`, rightColX, rightY);
      rightY += 6;
    });

    rightY += 4;

    // SKILLS Section
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 26, 26);
    doc.text('SKILLS', rightColX, rightY);
    rightY += 2;

    // Underline
    doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.line(rightColX, rightY, rightColX + rightColWidth, rightY);
    rightY += 6;

    // Skills as wrapped text
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(26, 26, 26);

    let skillX = rightColX;
    let skillY = rightY;
    const skillGapX = 2;
    const skillGapY = 5;

    cv.skills.forEach((skill) => {
      const skillWidth = doc.getTextWidth(skill) + 6;

      // Check if skill fits on current line
      if (skillX + skillWidth > rightColX + rightColWidth) {
        skillX = rightColX;
        skillY += skillGapY;
      }

      // Check if we need new page
      if (skillY > pageHeight - 20) {
        doc.addPage();
        skillY = 20;
        skillX = rightColX;
      }

      // Draw skill tag
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(skillX, skillY - 3, skillWidth, 5, 1, 1, 'FD');
      doc.setTextColor(26, 26, 26);
      doc.text(skill, skillX + 3, skillY);

      skillX += skillWidth + skillGapX;
    });

    // Save
    doc.save(`${cv.name.replace(/\s+/g, '_')}_CV_Professional.pdf`);
  };

  // Simple Text PDF
  const handleDownloadSimplePDF = () => {
    const cvText = optimizedCV.optimizedCV || '';
    const cv = optimizedCV.structuredCV;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let yPos = 20;

    // If we have structured data, use name for title
    if (cv) {
      // Name
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 26, 26);
      doc.text(cv.name.toUpperCase(), pageWidth / 2, yPos, { align: 'center' });
      yPos += 6;

      // Title
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(14, 165, 233);
      doc.text(cv.title, pageWidth / 2, yPos, { align: 'center' });
      yPos += 6;

      // Contact line
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const contactParts = [];
      if (cv.contact.phone) contactParts.push(cv.contact.phone);
      if (cv.contact.email) contactParts.push(cv.contact.email);
      if (cv.contact.linkedin) contactParts.push(cv.contact.linkedin);
      if (cv.contact.location) contactParts.push(cv.contact.location);
      doc.text(contactParts.join(' | '), pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      // Divider
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;
    } else {
      // Title if no structured data
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(14, 165, 233);
      doc.text('Optimized CV', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;
    }

    // CV Content
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);

    const lines = doc.splitTextToSize(cvText, maxWidth);

    lines.forEach((line: string) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
      }

      // Check if line is a section header (all caps)
      if (line === line.toUpperCase() && line.length > 3 && line.length < 30 && /^[A-Z\s]+$/.test(line.trim())) {
        yPos += 4;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(26, 26, 26);
        doc.text(line, margin, yPos);
        yPos += 2;
        doc.setDrawColor(14, 165, 233);
        doc.setLineWidth(0.3);
        doc.line(margin, yPos, margin + doc.getTextWidth(line), yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
      } else {
        doc.text(line, margin, yPos);
        yPos += 5;
      }
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Generated by Rate Your CV', pageWidth / 2, pageHeight - 10, { align: 'center' });

    const fileName = cv ? `${cv.name.replace(/\s+/g, '_')}_CV_Simple.pdf` : `Optimized_CV_${Date.now()}.pdf`;
    doc.save(fileName);
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

      {/* Download Options */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-4">Download Your CV:</h4>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Professional Template */}
          <button
            onClick={handleDownloadProfessionalPDF}
            className="p-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 flex flex-col items-center justify-center"
          >
            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-base">Professional Template</span>
            <span className="text-xs opacity-75 mt-1">Two-column modern design</span>
          </button>

          {/* Simple Text */}
          <button
            onClick={handleDownloadSimplePDF}
            className="p-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 flex flex-col items-center justify-center"
          >
            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <span className="text-base">Simple Text</span>
            <span className="text-xs opacity-75 mt-1">Clean single-column format</span>
          </button>
        </div>
      </div>

      {/* Other Actions */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleCopy}
          className="flex-1 min-w-[150px] py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center"
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
          className="flex-1 min-w-[150px] py-3 border border-white/20 text-white font-bold rounded-xl hover:bg-white/10 transition-all duration-300"
        >
          Analyze Another CV
        </button>
      </div>
    </div>
  );
}