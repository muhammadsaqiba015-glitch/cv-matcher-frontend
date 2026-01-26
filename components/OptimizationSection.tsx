'use client';

import React, { useState } from 'react';

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

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedCV.optimizedCV || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parse CV text into structured sections
  const parseCV = (text: string) => {
    const lines = text.split('\n').map(l => l.trim());

    let name = '';
    let title = '';
    let contact: string[] = [];
    let summary = '';
    let experience: Array<{ jobTitle: string; company: string; date: string; location: string; description: string; bullets: string[] }> = [];
    let education: Array<{ degree: string; school: string; details: string }> = [];
    let skills: string[] = [];

    let currentSection = '';
    let currentExp: any = null;
    let currentEdu: any = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      const lineLower = line.toLowerCase();

      // Detect section headers
      if (/^(professional\s+)?summary$/i.test(line) || /^(career\s+)?objective$/i.test(line) || /^profile$/i.test(line)) {
        if (currentExp) { experience.push(currentExp); currentExp = null; }
        if (currentEdu) { education.push(currentEdu); currentEdu = null; }
        currentSection = 'summary';
        continue;
      }
      if (/^(professional\s+)?experience$/i.test(line) || /^work\s+(history|experience)$/i.test(line) || /^employment$/i.test(line)) {
        if (currentExp) { experience.push(currentExp); currentExp = null; }
        if (currentEdu) { education.push(currentEdu); currentEdu = null; }
        currentSection = 'experience';
        continue;
      }
      if (/^education$/i.test(line) || /^academic/i.test(line)) {
        if (currentExp) { experience.push(currentExp); currentExp = null; }
        if (currentEdu) { education.push(currentEdu); currentEdu = null; }
        currentSection = 'education';
        continue;
      }
      if (/^(technical\s+)?skills$/i.test(line) || /^competencies$/i.test(line) || /^expertise$/i.test(line)) {
        if (currentExp) { experience.push(currentExp); currentExp = null; }
        if (currentEdu) { education.push(currentEdu); currentEdu = null; }
        currentSection = 'skills';
        continue;
      }

      // Parse header (before any section)
      if (!currentSection) {
        if (!name && line.length > 2 && line.length < 50 && !line.includes('@') && !/^\+?\d/.test(line)) {
          name = line;
          continue;
        }
        if (name && !title && line.length > 2 && line.length < 80 && !line.includes('@') && !/^\+?\d/.test(line)) {
          title = line;
          continue;
        }
        if (line.includes('@') || /\+?\d{10,}/.test(line.replace(/[\s\-]/g, '')) || lineLower.includes('linkedin')) {
          contact.push(line);
          continue;
        }
      }

      // Parse sections
      if (currentSection === 'summary') {
        summary += (summary ? ' ' : '') + line;
      } else if (currentSection === 'experience') {
        const isBullet = /^[•\-\*–◦]/.test(line);
        const hasDate = /\d{4}|present/i.test(line);

        if (isBullet) {
          if (currentExp) {
            currentExp.bullets.push(line.replace(/^[•\-\*–◦]\s*/, ''));
          }
        } else if (hasDate && line.includes('|')) {
          // Line with date and pipe - likely "Company | Date"
          if (currentExp && currentExp.jobTitle) {
            experience.push(currentExp);
          }
          currentExp = { jobTitle: '', company: line, date: '', location: '', description: '', bullets: [] };
        } else if (currentExp && !currentExp.jobTitle) {
          currentExp.jobTitle = line;
        } else if (!currentExp) {
          currentExp = { jobTitle: line, company: '', date: '', location: '', description: '', bullets: [] };
        } else if (currentExp && !currentExp.company) {
          currentExp.company = line;
        } else if (currentExp && line.length > 30 && !isBullet) {
          // Likely a description line
          currentExp.description = line;
        }
      } else if (currentSection === 'education') {
        if (!currentEdu) {
          currentEdu = { degree: line, school: '', details: '' };
        } else if (!currentEdu.school) {
          currentEdu.school = line;
        } else {
          currentEdu.details += (currentEdu.details ? ' | ' : '') + line;
        }
      } else if (currentSection === 'skills') {
        const skillItems = line.split(/[,|•;]/).map(s => s.trim().replace(/^[\-\*]\s*/, '')).filter(s => s.length > 1 && s.length < 50);
        skills.push(...skillItems);
      }
    }

    // Save last items
    if (currentExp && currentExp.jobTitle) experience.push(currentExp);
    if (currentEdu && currentEdu.degree) education.push(currentEdu);

    return { name, title, contact, summary, experience, education, skills };
  };

  const handleDownloadPDF = () => {
    const cvText = optimizedCV.optimizedCV || '';
    const cv = parseCV(cvText);

    // Generate professional HTML
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cv.name || 'CV'} - Resume</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: A4;
      margin: 0;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11px;
      line-height: 1.5;
      color: #333;
      background: #f5f5f5;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .cv-container {
      max-width: 210mm;
      min-height: 297mm;
      margin: 20px auto;
      background: white;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      display: grid;
      grid-template-columns: 1fr 220px;
    }
    
    @media print {
      body {
        background: white;
      }
      .cv-container {
        margin: 0;
        box-shadow: none;
        max-width: none;
      }
      .print-btn {
        display: none !important;
      }
    }
    
    /* Left Column - Main Content */
    .main-content {
      padding: 35px 30px 35px 35px;
    }
    
    /* Right Column - Sidebar */
    .sidebar {
      background: #f8fafc;
      padding: 35px 25px;
      border-left: 3px solid #0ea5e9;
    }
    
    /* Header */
    .name {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a1a;
      letter-spacing: -0.5px;
      margin-bottom: 4px;
    }
    
    .title {
      font-size: 13px;
      font-weight: 600;
      color: #0ea5e9;
      margin-bottom: 12px;
    }
    
    .contact-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 9px;
      color: #666;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #e5e5e5;
    }
    
    .contact-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    /* Section Headers */
    .section-title {
      font-size: 11px;
      font-weight: 700;
      color: #1a1a1a;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 2px solid #0ea5e9;
    }
    
    .sidebar .section-title {
      font-size: 10px;
    }
    
    /* Summary */
    .summary {
      font-size: 10px;
      color: #444;
      line-height: 1.6;
      margin-bottom: 25px;
    }
    
    /* Experience */
    .experience-section {
      margin-bottom: 20px;
    }
    
    .job {
      margin-bottom: 18px;
    }
    
    .job-title {
      font-size: 11px;
      font-weight: 700;
      color: #1a1a1a;
    }
    
    .job-company {
      font-size: 10px;
      font-weight: 600;
      color: #0ea5e9;
      margin: 2px 0;
    }
    
    .job-meta {
      font-size: 9px;
      color: #888;
      margin-bottom: 8px;
    }
    
    .job-description {
      font-size: 9px;
      color: #555;
      font-style: italic;
      margin-bottom: 8px;
    }
    
    .job-bullets {
      list-style: none;
      padding: 0;
    }
    
    .job-bullets li {
      position: relative;
      padding-left: 14px;
      font-size: 9px;
      color: #444;
      margin-bottom: 5px;
      line-height: 1.5;
    }
    
    .job-bullets li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #0ea5e9;
      font-weight: bold;
    }
    
    /* Sidebar - Education */
    .education-item {
      margin-bottom: 15px;
    }
    
    .edu-degree {
      font-size: 10px;
      font-weight: 700;
      color: #1a1a1a;
    }
    
    .edu-school {
      font-size: 9px;
      font-weight: 600;
      color: #0ea5e9;
    }
    
    .edu-details {
      font-size: 8px;
      color: #888;
    }
    
    /* Sidebar - Skills */
    .skills-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    
    .skill-tag {
      background: white;
      border: 1px solid #ddd;
      padding: 4px 10px;
      border-radius: 3px;
      font-size: 8px;
      font-weight: 500;
      color: #333;
    }
    
    /* Print Button */
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #0ea5e9, #0284c7);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
      display: flex;
      align-items: center;
      gap: 8px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .print-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(14, 165, 233, 0.5);
    }
    
    .instructions {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #1a1a1a;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 12px;
      text-align: center;
    }
    
    @media print {
      .instructions {
        display: none;
      }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
    </svg>
    Save as PDF
  </button>
  
  <div class="instructions">
    💡 Click "Save as PDF" → In print dialog, select "Save as PDF" as destination → Click Save
  </div>
  
  <div class="cv-container">
    <!-- Main Content -->
    <div class="main-content">
      ${cv.name ? `<h1 class="name">${cv.name.toUpperCase()}</h1>` : ''}
      ${cv.title ? `<p class="title">${cv.title}</p>` : ''}
      
      ${cv.contact.length > 0 ? `
        <div class="contact-row">
          ${cv.contact.map(c => `<span class="contact-item">${c}</span>`).join('')}
        </div>
      ` : ''}
      
      ${cv.summary ? `
        <div class="summary-section">
          <h2 class="section-title">Professional Summary</h2>
          <p class="summary">${cv.summary}</p>
        </div>
      ` : ''}
      
      ${cv.experience.length > 0 ? `
        <div class="experience-section">
          <h2 class="section-title">Professional Experience</h2>
          ${cv.experience.map(exp => `
            <div class="job">
              <p class="job-title">${exp.jobTitle}</p>
              ${exp.company ? `<p class="job-company">${exp.company}</p>` : ''}
              ${exp.description ? `<p class="job-description">${exp.description}</p>` : ''}
              ${exp.bullets.length > 0 ? `
                <ul class="job-bullets">
                  ${exp.bullets.map(b => `<li>${b}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
    
    <!-- Sidebar -->
    <div class="sidebar">
      ${cv.education.length > 0 ? `
        <div class="education-section" style="margin-bottom: 25px;">
          <h2 class="section-title">Education</h2>
          ${cv.education.map(edu => `
            <div class="education-item">
              <p class="edu-degree">${edu.degree}</p>
              ${edu.school ? `<p class="edu-school">${edu.school}</p>` : ''}
              ${edu.details ? `<p class="edu-details">${edu.details}</p>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      ${cv.skills.length > 0 ? `
        <div class="skills-section">
          <h2 class="section-title">Skills</h2>
          <div class="skills-grid">
            ${cv.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  </div>
</body>
</html>`;

    // Open in new window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
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
          className="flex-1 min-w-[200px] py-4 font-bold rounded-xl transition-all duration-300 flex items-center justify-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download PDF
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