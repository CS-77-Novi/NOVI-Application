'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, Trash2, CheckCircle, FileDigit, AlertTriangle, User } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface DownloadReportProps {
  type?: 'teacher' | 'individual';
}

const DownloadReport = ({ type = 'teacher' }: DownloadReportProps) => {
  const [reports, setReports] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // We use different storage keys to keep Individual and Teacher archives separate
    const storageKey = type === 'teacher' ? 'novi_report_history' : 'novi_individual_history';
    const history = JSON.parse(localStorage.getItem(storageKey) || '[]');
    setReports(history);
  }, [type]);

  const deleteReport = (id: string) => {
    if (window.confirm("Are you sure you want to delete this specific report?")) {
      const storageKey = type === 'teacher' ? 'novi_report_history' : 'novi_individual_history';
      const updated = reports.filter(r => r.id !== id);
      setReports(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
  };

  const clearAllHistory = () => {
    if (window.confirm("CRITICAL: This will delete ALL archived reports. Proceed?")) {
      const storageKey = type === 'teacher' ? 'novi_report_history' : 'novi_individual_history';
      localStorage.removeItem(storageKey);
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
      
      {/* Header Section */}
      <div className="flex justify-between items-end bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-[#4B1B7D]">
            {type === 'teacher' ? 'Classroom Archives' : 'My Study History'}
          </h2>
          <p className="text-slate-500 mt-1">
            {type === 'teacher' 
              ? 'Group sessions and student rosters are stored here.' 
              : 'Your personal study session analytics and focus reports.'}
          </p>
        </div>
        {reports.length > 0 && (
          <button 
            onClick={clearAllHistory}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-500 rounded-2xl text-xs font-black hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest"
          >
            <AlertTriangle size={16} /> Wipe History
          </button>
        )}
      </div>

      {/* Reports List */}
      <div className="grid gap-4">
        {reports.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center">
            <FileText size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium italic">No archived reports found.</p>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all relative">
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl text-white shadow-md bg-gradient-to-br ${type === 'teacher' ? 'from-[#FC96FF] to-[#5F83C4]' : 'from-[#7E43BC] to-[#4B1B7D]'}`}>
                  {type === 'teacher' ? <FileText size={24} /> : <User size={24} />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg group-hover:text-[#7E43BC] transition-colors">{report.name}</h4>
                  <div className="flex gap-3 mt-2">
                    <span className="text-[10px] bg-purple-100 text-[#7E43BC] px-3 py-1 rounded-full font-black uppercase tracking-wider">
                      {type === 'teacher' ? `${report.studentCount || '0'} Students` : 'Individual Session'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                      <CheckCircle size={12} className="text-green-500" /> {report.date}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => downloadPDF(report)}
                  className="bg-slate-50 text-slate-600 px-5 py-3 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-slate-100 transition-all border border-slate-100"
                  disabled={isGenerating}
                >
                  <FileDigit size={16} /> {isGenerating ? '...' : 'PDF'}
                </button>
                
                <a 
                  href={encodeURI(report.content)} 
                  download={report.name}
                  className="bg-[#7E43BC] text-white px-5 py-3 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-[#4B1B7D] transition-all shadow-md shadow-purple-100"
                >
                  <Download size={16} /> CSV
                </a>

                <button 
                  onClick={() => deleteReport(report.id)}
                  className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all ml-2"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              {/* PDF TEMPLATE */}
              <div className="absolute left-[-9999px]">
                <div id={`pdf-template-${report.id}`} className="p-16 bg-white w-[800px] text-slate-900 font-sans">
                  <div className="border-b-8 border-[#7E43BC] pb-8 mb-8">
                    <h1 className="text-5xl font-black text-[#7E43BC] tracking-tighter italic">NOVI ANALYTICS</h1>
                    <p className="text-slate-400 mt-2 font-bold tracking-[0.3em] uppercase">
                      {type === 'teacher' ? 'Classroom Performance Report' : 'Personal Focus Report'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-12 bg-slate-50 p-8 rounded-3xl">
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Session Date</p>
                      <p className="font-bold text-xl">{report.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Session Type</p>
                      <p className="font-bold text-xl capitalize">{type} Session</p>
                    </div>
                  </div>

                  {/* Conditional PDF Content */}
                  {type === 'teacher' ? (
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
                  ) : (
                    // Individual Layout: Highlighting the single session metrics
                    <div className="space-y-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-6 border-2 border-slate-100 rounded-2xl text-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase">Attention Score</p>
                          <p className="text-4xl font-black text-[#7E43BC]">{report.rawPayload?.[0]?.average_attention_score || report.average_attention_score || '_'}%</p>
                        </div>
                        <div className="p-6 border-2 border-slate-100 rounded-2xl text-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase">Distractions</p>
                          <p className="text-4xl font-black text-slate-800">{report.rawPayload?.[0]?.distraction_events || report.distraction_events || '_'}</p>
                        </div>
                        <div className="p-6 border-2 border-slate-100 rounded-2xl text-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase">Duration</p>
                          <p className="text-xl font-black text-slate-800">{report.rawPayload?.[0]?.total_duration || '_'}s</p>
                        </div>
                      </div>
                      <div className="p-8 bg-purple-50 rounded-3xl border border-purple-100">
                         <h5 className="font-black text-[#7E43BC] mb-2 uppercase text-xs tracking-widest">Performance Summary</h5>
                         <p className="text-slate-600 leading-relaxed">
                            This report confirms that the participant completed the session on {report.date}. 
                            The detected attention levels reached an average of {report.rawPayload?.[0]?.average_attention_score || '_'}%.
                         </p>
                      </div>
                    </div>
                  )}
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