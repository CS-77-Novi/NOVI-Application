'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, Trash2, CheckCircle, FileDigit, AlertTriangle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const DownloadReport = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // 1. Load the history on page open
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('novi_report_history') || '[]');
    setReports(history);
  }, []);

  // 2. Function to delete one specific report
  const deleteReport = (id: string) => {
    if (window.confirm("Are you sure you want to delete this specific report?")) {
      const updated = reports.filter(r => r.id !== id);
      setReports(updated);
      localStorage.setItem('novi_report_history', JSON.stringify(updated));
    }
  };

  // 3. Function to clear everything
  const clearAllHistory = () => {
    if (window.confirm("CRITICAL: This will delete ALL archived reports from your browser memory. This cannot be undone. Proceed?")) {
      localStorage.removeItem('novi_report_history');
      setReports([]);
    }
  };

  const downloadPDF = async (report: any) => {
    setIsGenerating(true);
    const element = document.getElementById(`pdf-template-${report.id}`);
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(report.name.replace('.csv', '.pdf'));
    setIsGenerating(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-end bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-[#4B1B7D]">Archived Sessions</h2>
          <p className="text-slate-500 mt-1">Sessions are automatically synced and stored here for your review.</p>
        </div>
        {reports.length > 0 && (
          <button 
            onClick={clearAllHistory}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-500 rounded-2xl text-xs font-black hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest"
          >
            <AlertTriangle size={16} /> Wipe All Data
          </button>
        )}
      </div>

      <div className="grid gap-4">
        {reports.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center">
            <FileText size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium italic">Your archive is empty. Completed sessions will appear here automatically.</p>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
              <div className="flex items-center gap-5">
                <div className="bg-gradient-to-br from-[#FC96FF] to-[#5F83C4] p-4 rounded-2xl text-white shadow-md">
                  <FileText size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg group-hover:text-[#7E43BC] transition-colors">{report.name}</h4>
                  <div className="flex gap-3 mt-2">
                    <span className="text-[10px] bg-purple-100 text-[#7E43BC] px-3 py-1 rounded-full font-black uppercase tracking-wider">
                      {report.studentCount || '0'} Students
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                      <CheckCircle size={12} className="text-green-500" /> {report.date}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* PDF Button */}
                <button 
                  onClick={() => downloadPDF(report)}
                  className="bg-slate-50 text-slate-600 px-5 py-3 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-slate-100 transition-all border border-slate-100"
                >
                  <FileDigit size={16} /> PDF
                </button>
                
                {/* CSV Button */}
                <a 
                  href={encodeURI(report.content)} 
                  download={report.name}
                  className="bg-[#7E43BC] text-white px-5 py-3 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-[#4B1B7D] transition-all shadow-md shadow-purple-100"
                >
                  <Download size={16} /> CSV
                </a>

                {/* DELETE SINGLE BUTTON */}
                <button 
                  onClick={() => deleteReport(report.id)}
                  className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all ml-2"
                  title="Delete this report"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              {/* HIDDEN PDF TEMPLATE FOR jspdf */}
              <div className="absolute left-[-9999px]">
                <div id={`pdf-template-${report.id}`} className="p-16 bg-white w-[800px] text-slate-900 font-sans">
                  <div className="border-b-8 border-[#7E43BC] pb-8 mb-8">
                    <h1 className="text-5xl font-black text-[#7E43BC] tracking-tighter italic">NOVI ANALYTICS</h1>
                    <p className="text-slate-400 mt-2 font-bold tracking-[0.3em] uppercase">Session Summary Document</p>
                  </div>
                  <div className="flex justify-between mb-12 bg-slate-50 p-6 rounded-2xl">
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400">Date Generated</p>
                      <p className="font-bold">{report.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-black text-slate-400">Total Participants</p>
                      <p className="font-bold">{report.studentCount} Students</p>
                    </div>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        <th className="py-4 font-black uppercase text-xs text-slate-500">Student ID</th>
                        <th className="py-4 font-black uppercase text-xs text-slate-500">Focus Score</th>
                        <th className="py-4 font-black uppercase text-xs text-slate-500">Events</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.rawPayload?.map((s: any, i: number) => (
                        <tr key={i} className="border-b border-slate-100">
                          <td className="py-4 font-bold text-slate-700">{s.participant_id}</td>
                          <td className="py-4 font-black text-[#5F83C4]">{s.average_attention_score}%</td>
                          <td className="py-4 text-slate-500">{s.distraction_events} Distractions</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DownloadReport;