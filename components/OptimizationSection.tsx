'use client';

import React, { useState } from 'react';
import jsPDF from 'jspdf';

interface OptimizationSectionProps {
  optimizedCV: {
    structuredCV?: any;
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

  // Parse plain text CV into sections
  const parseCV = (text: string) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);

    let name = '';
    let title = '';
    let contactInfo: string[] = [];
    let summary = '';
    let experience: Array<{ title: string; company: string; date: string; bullets: string[] }> = [];
    let education: Array<{ degree: string; school: string; details: string }> = [];
    let skills: string[] = [];

    let currentSection = '';
    let currentExp: { title: string; company: string; date: string; bullets: string[] } | null = null;
    let currentEdu: { degree: string; school: string; details: string } | null = null;

    const sectionHeaders = ['summary', 'professional summary', 'objective', 'profile', 'about', 'experience', 'professional experience', 'work experience', 'work history', 'employment', 'education', 'academic', 'qualifications', 'skills', 'technical skills', 'core competencies', 'expertise', 'technologies'];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineLower = line.toLowerCase().replace(/[^a-z\s]/g, '');

      // Check if this is a section header
      const isHeader = sectionHeaders.some(h => {
        const headerWords = h.split(' ');
        return headerWords.every(word => lineLower.includes(word)) && line.length < 40;
      });

      if (isHeader) {
        // Save current experience/education if any
        if (currentExp && currentExp.title) {
          experience.push(currentExp);
          currentExp = null;
        }
        if (currentEdu && currentEdu.degree) {
          education.push(currentEdu);
          currentEdu = null;
        }

        if (lineLower.includes('summary') || lineLower.includes('objective') || lineLower.includes('profile') || lineLower.includes('about')) {
          currentSection = 'summary';
        } else if (lineLower.includes('experience') || lineLower.includes('employment') || lineLower.includes('work')) {
          currentSection = 'experience';
        } else if (lineLower.includes('education') || lineLower.includes('academic') || lineLower.includes('qualification')) {
          currentSection = 'education';
        } else if (lineLower.includes('skill') || lineLower.includes('competenc') || lineLower.includes('expertise') || lineLower.includes('technolog')) {
          currentSection = 'skills';
        }
        continue;
      }

      // If no section yet, try to get name and contact
      if (!currentSection && i < 10) {
        if (!name && line.length > 2 && line.length < 50 && !line.includes('@') && !line.includes('+') && !/^\d/.test(line)) {
          name = line;
          continue;
        }
        if (name && !title && line.length > 2 && line.length < 60 && !line.includes('@') && !line.includes('+') && !/^\d/.test(line)) {
          title = line;
          continue;
        }
        if (line.includes('@') || line.includes('+') || lineLower.includes('linkedin') || lineLower.includes('phone') || lineLower.includes('email') || /\d{10,}/.test(line.replace(/\D/g, ''))) {
          contactInfo.push(line);
          continue;
        }
      }

      // Process based on current section
      if (currentSection === 'summary') {
        summary += (summary ? ' ' : '') + line;
      } else if (currentSection === 'experience') {
        const hasDate = /\d{4}|present|current|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i.test(line);
        const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.startsWith('–') || line.startsWith('◦');

        if (isBullet) {
          if (currentExp) {
            currentExp.bullets.push(line.replace(/^[•\-\*–◦]\s*/, ''));
          }
        } else if (!currentExp) {
          currentExp = { title: line, company: '', date: '', bullets: [] };
        } else if (!currentExp.company && !hasDate) {
          currentExp.company = line;
        } else if (hasDate) {
          if (!currentExp.date) {
            currentExp.date = line;
          } else {
            // New job entry
            experience.push(currentExp);
            currentExp = { title: line, company: '', date: '', bullets: [] };
          }
        }
      } else if (currentSection === 'education') {
        if (!currentEdu) {
          currentEdu = { degree: line, school: '', details: '' };
        } else if (!currentEdu.school && line.length > 3) {
          currentEdu.school = line;
        } else if (line.length > 2) {
          currentEdu.details += (currentEdu.details ? ' | ' : '') + line;
        }
      } else if (currentSection === 'skills') {
        // Split by common delimiters
        const skillItems = line.split(/[,|•·;]/);
        skillItems.forEach(s => {
          const skill = s.trim().replace(/^[\-\*]\s*/, '');
          if (skill && skill.length > 1 && skill.length < 50) {
            skills.push(skill);
          }
        });
      }
    }

    // Save last items
    if (currentExp && currentExp.title) {
      experience.push(currentExp);
    }
    if (currentEdu && currentEdu.degree) {
      education.push(currentEdu);
    }

    return { name, title, contactInfo, summary, experience, education, skills };
  };

  const handleDownloadPDF = () => {
    setIsGenerating(true);

    try {
      const cvText = optimizedCV.optimizedCV || '';
      const parsed = parseCV(cvText);

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Colors
      const accentColor: [number, number, number] = [14, 165, 233];
      const darkText: [number, number, number] = [26, 26, 26];
      const grayText: [number, number, number] = [100, 100, 100];
      const bodyText: [number, number, number] = [55, 55, 55];

      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let y = 20;

      // ========== NAME ==========
      if (parsed.name) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(...darkText);
        doc.text(parsed.name.toUpperCase(), margin, y);
        y += 7;
      }

      // ========== TITLE ==========
      if (parsed.title) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...accentColor);
        doc.text(parsed.title, margin, y);
        y += 6;
      }

      // ========== CONTACT INFO ==========
      if (parsed.contactInfo.length > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...grayText);
        const contactLine = parsed.contactInfo.join('  •  ');
        const contactLines = doc.splitTextToSize(contactLine, contentWidth);
        doc.text(contactLines, margin, y);
        y += contactLines.length * 4 + 4;
      }

      // Divider line
      y += 2;
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      // ========== SUMMARY ==========
      if (parsed.summary) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...darkText);
        doc.text('PROFESSIONAL SUMMARY', margin, y);
        y += 1;

        doc.setDrawColor(...accentColor);
        doc.setLineWidth(0.6);
        doc.line(margin, y, margin + 50, y);
        y += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...bodyText);
        const summaryLines = doc.splitTextToSize(parsed.summary, contentWidth);
        doc.text(summaryLines, margin, y);
        y += summaryLines.length * 4 + 8;
      }

      // ========== EXPERIENCE ==========
      if (parsed.experience.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...darkText);
        doc.text('PROFESSIONAL EXPERIENCE', margin, y);
        y += 1;

        doc.setDrawColor(...accentColor);
        doc.setLineWidth(0.6);
        doc.line(margin, y, margin + 55, y);
        y += 6;

        for (const exp of parsed.experience) {
          if (y > pageHeight - 50) {
            doc.addPage();
            y = 20;
          }

          // Job title
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(...darkText);
          doc.text(exp.title, margin, y);
          y += 5;

          // Company and date
          if (exp.company || exp.date) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(...accentColor);
            let companyLine = exp.company;
            if (exp.date) {
              companyLine += companyLine ? '  |  ' + exp.date : exp.date;
            }
            const companyLines = doc.splitTextToSize(companyLine, contentWidth);
            doc.text(companyLines, margin, y);
            y += companyLines.length * 4 + 2;
          }

          // Bullets
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(...bodyText);

          for (const bullet of exp.bullets) {
            if (y > pageHeight - 20) {
              doc.addPage();
              y = 20;
            }

            const bulletText = '•  ' + bullet;
            const bulletLines = doc.splitTextToSize(bulletText, contentWidth - 5);
            doc.text(bulletLines, margin + 2, y);
            y += bulletLines.length * 4 + 1;
          }

          y += 5;
        }
      }

      // ========== EDUCATION ==========
      if (parsed.education.length > 0) {
        if (y > pageHeight - 40) {
          doc.addPage();
          y = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...darkText);
        doc.text('EDUCATION', margin, y);
        y += 1;

        doc.setDrawColor(...accentColor);
        doc.setLineWidth(0.6);
        doc.line(margin, y, margin + 30, y);
        y += 6;

        for (const edu of parsed.education) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(...darkText);
          doc.text(edu.degree, margin, y);
          y += 5;

          if (edu.school) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(...accentColor);
            doc.text(edu.school, margin, y);
            y += 4;
          }

          if (edu.details) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(...grayText);
            doc.text(edu.details, margin, y);
            y += 4;
          }

          y += 3;
        }
      }

      // ========== SKILLS ==========
      if (parsed.skills.length > 0) {
        if (y > pageHeight - 30) {
          doc.addPage();
          y = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...darkText);
        doc.text('SKILLS', margin, y);
        y += 1;

        doc.setDrawColor(...accentColor);
        doc.setLineWidth(0.6);
        doc.line(margin, y, margin + 20, y);
        y += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...bodyText);

        const skillsText = parsed.skills.join('  •  ');
        const skillLines = doc.splitTextToSize(skillsText, contentWidth);
        doc.text(skillLines, margin, y);
      }

      // Save
      const fileName = parsed.name
        ? `${parsed.name.replace(/\s+/g, '_')}_CV.pdf`
        : `Optimized_CV_${Date.now()}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
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