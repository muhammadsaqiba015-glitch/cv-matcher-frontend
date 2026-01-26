'use client';

import React, { useState, useRef } from 'react';

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
  const cvRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedCV.optimizedCV || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate Professional PDF using html2pdf
  const handleDownloadProfessionalPDF = async () => {
    const cv = optimizedCV.structuredCV;

    if (!cv) {
      alert('Structured CV data not available. Please try the Simple Text option.');
      return;
    }

    setIsGenerating(true);

    try {
      // Dynamically import html2pdf
      const html2pdf = (await import('html2pdf.js')).default;

      // Create HTML content
      const htmlContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; width: 210mm; min-height: 297mm; padding: 0; margin: 0; background: white; display: grid; grid-template-columns: 1fr 200px;">
          
          <!-- Left Column -->
          <div style="padding: 30px 25px 30px 30px;">
            <!-- Header -->
            <h1 style="font-size: 26px; font-weight: 700; color: #1a1a1a; margin: 0 0 4px 0; letter-spacing: 0.5px;">${cv.name.toUpperCase()}</h1>
            <p style="font-size: 14px; color: #0ea5e9; font-weight: 600; margin: 0 0 12px 0;">${cv.title}</p>
            
            <!-- Contact Row -->
            <div style="font-size: 10px; color: #555; margin-bottom: 20px; line-height: 1.6;">
              ${cv.contact.phone ? `<span style="margin-right: 15px;">📞 ${cv.contact.phone}</span>` : ''}
              ${cv.contact.email ? `<span style="margin-right: 15px;">✉️ ${cv.contact.email}</span>` : ''}
              <br/>
              ${cv.contact.linkedin ? `<span style="margin-right: 15px;">🔗 ${cv.contact.linkedin}</span>` : ''}
              ${cv.contact.location ? `<span>📍 ${cv.contact.location}</span>` : ''}
            </div>
            
            <!-- Summary -->
            <div style="margin-bottom: 20px;">
              <h2 style="font-size: 13px; font-weight: 700; color: #1a1a1a; margin: 0 0 8px 0; padding-bottom: 6px; border-bottom: 2px solid #0ea5e9; text-transform: uppercase; letter-spacing: 1px;">Summary</h2>
              <p style="font-size: 11px; color: #444; line-height: 1.6; margin: 0;">${cv.summary}</p>
            </div>
            
            <!-- Experience -->
            <div>
              <h2 style="font-size: 13px; font-weight: 700; color: #1a1a1a; margin: 0 0 12px 0; padding-bottom: 6px; border-bottom: 2px solid #0ea5e9; text-transform: uppercase; letter-spacing: 1px;">Experience</h2>
              
              ${cv.experience.map(exp => `
                <div style="margin-bottom: 16px;">
                  <p style="font-size: 12px; font-weight: 700; color: #1a1a1a; margin: 0;">${exp.title}</p>
                  <p style="font-size: 11px; font-weight: 600; color: #0ea5e9; margin: 2px 0;">${exp.company}</p>
                  <p style="font-size: 9px; color: #777; margin: 4px 0 8px 0;">📅 ${exp.date} &nbsp;&nbsp; 📍 ${exp.location}</p>
                  <ul style="margin: 0; padding-left: 16px;">
                    ${exp.bullets.map(bullet => `
                      <li style="font-size: 10px; color: #444; line-height: 1.5; margin-bottom: 4px;">${bullet}</li>
                    `).join('')}
                  </ul>
                </div>
              `).join('')}
            </div>
          </div>
          
          <!-- Right Column -->
          <div style="background: #f8fafc; padding: 30px 20px;">
            <!-- Education -->
            <div style="margin-bottom: 25px;">
              <h2 style="font-size: 12px; font-weight: 700; color: #1a1a1a; margin: 0 0 12px 0; padding-bottom: 6px; border-bottom: 2px solid #0ea5e9; text-transform: uppercase; letter-spacing: 1px;">Education</h2>
              
              ${cv.education.map(edu => `
                <div style="margin-bottom: 12px;">
                  <p style="font-size: 11px; font-weight: 700; color: #1a1a1a; margin: 0;">${edu.degree}</p>
                  <p style="font-size: 10px; font-weight: 600; color: #0ea5e9; margin: 2px 0;">${edu.school}</p>
                  <p style="font-size: 9px; color: #777; margin: 2px 0;">
                    ${edu.date ? `📅 ${edu.date}` : ''}
                    ${edu.location ? `&nbsp; 📍 ${edu.location}` : ''}
                  </p>
                </div>
              `).join('')}
            </div>
            
            <!-- Skills -->
            <div>
              <h2 style="font-size: 12px; font-weight: 700; color: #1a1a1a; margin: 0 0 12px 0; padding-bottom: 6px; border-bottom: 2px solid #0ea5e9; text-transform: uppercase; letter-spacing: 1px;">Skills</h2>
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                ${cv.skills.map(skill => `
                  <span style="background: white; border: 1px solid #ddd; color: #1a1a1a; padding: 4px 10px; border-radius: 3px; font-size: 9px; font-weight: 500;">${skill}</span>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      `;

      // Create temporary element
      const element = document.createElement('div');
      element.innerHTML = htmlContent;
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      document.body.appendChild(element);

      // PDF options
      const opt = {
        margin: 0,
        filename: `${cv.name.replace(/\s+/g, '_')}_CV_Professional.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        }
      };

      // Generate PDF
      await html2pdf().set(opt).from(element).save();

      // Cleanup
      document.body.removeChild(element);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Simple Text PDF
  const handleDownloadSimplePDF = async () => {
    const cv = optimizedCV.structuredCV;
    const cvText = optimizedCV.optimizedCV || '';

    setIsGenerating(true);

    try {
      const html2pdf = (await import('html2pdf.js')).default;

      // Create simple HTML content
      const htmlContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; width: 210mm; min-height: 297mm; padding: 30px 40px; background: white;">
          ${cv ? `
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #0ea5e9;">
              <h1 style="font-size: 24px; font-weight: 700; color: #1a1a1a; margin: 0 0 4px 0;">${cv.name.toUpperCase()}</h1>
              <p style="font-size: 14px; color: #0ea5e9; font-weight: 600; margin: 0 0 10px 0;">${cv.title}</p>
              <p style="font-size: 10px; color: #666; margin: 0;">
                ${cv.contact.phone ? `${cv.contact.phone}` : ''} 
                ${cv.contact.phone && cv.contact.email ? ' | ' : ''}
                ${cv.contact.email ? `${cv.contact.email}` : ''}
                ${(cv.contact.phone || cv.contact.email) && cv.contact.linkedin ? ' | ' : ''}
                ${cv.contact.linkedin ? `${cv.contact.linkedin}` : ''}
                ${(cv.contact.phone || cv.contact.email || cv.contact.linkedin) && cv.contact.location ? ' | ' : ''}
                ${cv.contact.location ? `${cv.contact.location}` : ''}
              </p>
            </div>
          ` : ''}
          
          <!-- CV Content -->
          <div style="font-size: 11px; color: #333; line-height: 1.7; white-space: pre-wrap;">${cvText.replace(/\n/g, '<br/>')}</div>
          
          <!-- Footer -->
          <div style="position: fixed; bottom: 20px; left: 0; right: 0; text-align: center;">
            <p style="font-size: 8px; color: #999;">Generated by Rate Your CV</p>
          </div>
        </div>
      `;

      const element = document.createElement('div');
      element.innerHTML = htmlContent;
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      document.body.appendChild(element);

      const opt = {
        margin: 0,
        filename: cv ? `${cv.name.replace(/\s+/g, '_')}_CV_Simple.pdf` : `Optimized_CV_${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
      document.body.removeChild(element);
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

      {/* Download Options */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-4">Download Your CV:</h4>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Professional Template */}
          <button
            onClick={handleDownloadProfessionalPDF}
            disabled={isGenerating || !optimizedCV.structuredCV}
            className={`p-5 text-white font-bold rounded-xl transition-all duration-300 flex flex-col items-center justify-center ${isGenerating || !optimizedCV.structuredCV
              ? 'bg-gray-600 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
              }`}
          >
            {isGenerating ? (
              <svg className="animate-spin w-8 h-8 mb-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            <span className="text-base">Professional Template</span>
            <span className="text-xs opacity-75 mt-1">Two-column modern design</span>
          </button>

          {/* Simple Text */}
          <button
            onClick={handleDownloadSimplePDF}
            disabled={isGenerating}
            className={`p-5 text-white font-bold rounded-xl transition-all duration-300 flex flex-col items-center justify-center ${isGenerating
              ? 'bg-gray-600 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
              }`}
          >
            {isGenerating ? (
              <svg className="animate-spin w-8 h-8 mb-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            )}
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