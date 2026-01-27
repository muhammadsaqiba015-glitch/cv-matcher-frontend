'use client';

import React, { useState } from 'react';

interface StructuredCV {
  name: string;
  title: string;
  email: string;
  phone: string;
  linkedin: string;
  location: string;
  summary: string;
  experience: Array<{
    jobTitle: string;
    company: string;
    companyDescription?: string;
    duration: string;
    location: string;
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    school: string;
    year: string;
    location: string;
  }>;
  skills: string[];
}

interface OptimizationSectionProps {
  optimizedCV: {
    structured?: StructuredCV;
    optimizedCV: string;
    changes: string[];
    expectedScore: number;
    keywordsAdded: string[];
    honestAssessment?: string;
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

  const handleDownloadPDF = () => {
    const cv = optimizedCV.structured;

    if (!cv) {
      alert('CV data not available. Please try optimizing again.');
      return;
    }

    // Generate clean HTML for the CV
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cv.name || 'CV'} - Resume</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    @page { size: A4; margin: 0; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 10px;
      line-height: 1.4;
      color: #333;
      background: #f0f0f0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .cv-page {
      width: 210mm;
      min-height: 297mm;
      margin: 20px auto;
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      display: grid;
      grid-template-columns: 1fr 200px;
    }
    
    @media print {
      body { background: white; }
      .cv-page { margin: 0; box-shadow: none; }
      .no-print { display: none !important; }
    }
    
    /* Left Column */
    .main { padding: 30px 25px 30px 30px; }
    
    /* Right Column */
    .sidebar {
      background: #f8f9fa;
      padding: 30px 20px;
      border-left: 3px solid #0ea5e9;
    }
    
    /* Header */
    .name {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 4px;
    }
    
    .title {
      font-size: 12px;
      font-weight: 600;
      color: #0ea5e9;
      margin-bottom: 10px;
    }
    
    .contact {
      font-size: 9px;
      color: #666;
      margin-bottom: 20px;
      line-height: 1.6;
    }
    
    .contact a {
      color: #0ea5e9;
      text-decoration: none;
    }
    
    .contact a:hover {
      text-decoration: underline;
    }
    
    .divider {
      border-bottom: 1px solid #e0e0e0;
      margin-bottom: 20px;
    }
    
    /* Sections */
    .section { margin-bottom: 20px; }
    
    .section-title {
      font-size: 11px;
      font-weight: 700;
      color: #1a1a1a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 2px solid #0ea5e9;
    }
    
    /* Summary */
    .summary {
      font-size: 10px;
      color: #444;
      line-height: 1.6;
    }
    
    /* Experience */
    .job {
      margin-bottom: 16px;
      page-break-inside: avoid;
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
      margin-bottom: 6px;
    }
    
    .job-desc {
      font-size: 9px;
      color: #666;
      font-style: italic;
      margin-bottom: 6px;
    }
    
    .bullets {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .bullets li {
      position: relative;
      padding-left: 12px;
      font-size: 9px;
      color: #444;
      margin-bottom: 4px;
      line-height: 1.5;
    }
    
    .bullets li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #0ea5e9;
      font-weight: bold;
    }
    
    /* Sidebar */
    .sidebar-section { margin-bottom: 20px; }
    
    .sidebar-title {
      font-size: 10px;
      font-weight: 700;
      color: #1a1a1a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 2px solid #0ea5e9;
    }
    
    /* Education */
    .edu-item { margin-bottom: 12px; }
    .edu-degree { font-size: 10px; font-weight: 700; color: #1a1a1a; }
    .edu-school { font-size: 9px; font-weight: 600; color: #0ea5e9; }
    .edu-meta { font-size: 8px; color: #888; margin-top: 2px; }
    
    /* Skills */
    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }
    
    .skill {
      background: white;
      border: 1px solid #ddd;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 8px;
      color: #333;
    }
    
    /* Print Button */
    .print-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #1a1a1a;
      padding: 12px 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 15px;
      z-index: 1000;
    }
    
    .print-btn {
      background: #0ea5e9;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .print-btn:hover { background: #0284c7; }
    
    .print-info {
      color: #aaa;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="print-bar no-print">
    <button class="print-btn" onclick="window.print()">
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
      </svg>
      Save as PDF
    </button>
    <span class="print-info">Select "Save as PDF" as destination in the print dialog</span>
  </div>
  
  <div class="cv-page" style="margin-top: 70px;">
    <div class="main">
      <h1 class="name">${cv.name?.toUpperCase() || ''}</h1>
      <p class="title">${cv.title || ''}</p>
      
      <div class="contact">
        ${cv.phone ? `<span>${cv.phone}</span>` : ''}
        ${cv.phone && cv.email ? ' &nbsp;•&nbsp; ' : ''}
        ${cv.email ? `<a href="mailto:${cv.email}">${cv.email}</a>` : ''}
        ${(cv.phone || cv.email) && cv.linkedin ? '<br>' : ''}
        ${cv.linkedin ? `<a href="${cv.linkedin.startsWith('http') ? cv.linkedin : 'https://linkedin.com/in/' + cv.linkedin}" target="_blank">LinkedIn: ${cv.linkedin.replace('https://linkedin.com/in/', '').replace('https://www.linkedin.com/in/', '')}</a>` : ''}
        ${cv.linkedin && cv.location ? ' &nbsp;•&nbsp; ' : ''}
        ${cv.location ? `<span>${cv.location}</span>` : ''}
      </div>
      
      <div class="divider"></div>
      
      ${cv.summary ? `
        <div class="section">
          <h2 class="section-title">Professional Summary</h2>
          <p class="summary">${cv.summary}</p>
        </div>
      ` : ''}
      
      ${cv.experience && cv.experience.length > 0 ? `
        <div class="section">
          <h2 class="section-title">Professional Experience</h2>
          ${cv.experience.map(job => `
            <div class="job">
              <p class="job-title">${job.jobTitle || ''}</p>
              <p class="job-company">${job.company || ''}</p>
              <p class="job-meta">${job.duration || ''}${job.duration && job.location ? ' • ' : ''}${job.location || ''}</p>
              ${job.companyDescription ? `<p class="job-desc">${job.companyDescription}</p>` : ''}
              ${job.bullets && job.bullets.length > 0 ? `
                <ul class="bullets">
                  ${job.bullets.map(b => `<li>${b}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
    
    <div class="sidebar">
      ${cv.education && cv.education.length > 0 ? `
        <div class="sidebar-section">
          <h2 class="sidebar-title">Education</h2>
          ${cv.education.map(edu => `
            <div class="edu-item">
              <p class="edu-degree">${edu.degree || ''}</p>
              <p class="edu-school">${edu.school || ''}</p>
              <p class="edu-meta">${edu.year || ''}${edu.year && edu.location ? ' • ' : ''}${edu.location || ''}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      ${cv.skills && cv.skills.length > 0 ? `
        <div class="sidebar-section">
          <h2 class="sidebar-title">Skills</h2>
          <div class="skills-list">
            ${cv.skills.map(s => `<span class="skill">${s}</span>`).join('')}
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
          Expected Score: {optimizedCV.expectedScore || 70}%
        </span>
      </div>

      {/* Honest Assessment */}
      {optimizedCV.honestAssessment && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <h4 className="text-lg font-semibold text-yellow-400 mb-2 flex items-center">
            <span className="mr-2">💡</span>
            Honest Assessment
          </h4>
          <p className="text-gray-300 text-sm">{optimizedCV.honestAssessment}</p>
        </div>
      )}

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
          disabled={!optimizedCV.structured}
          className={`flex-1 min-w-[200px] py-4 font-bold rounded-xl transition-all duration-300 flex items-center justify-center ${!optimizedCV.structured
            ? 'bg-gray-600 cursor-not-allowed text-gray-400'
            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
            }`}
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