import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, FileText, LayoutGrid, CheckCircle, AlertTriangle, ListChecks,
  MapPin, DollarSign, Award, Download, UploadCloud, Heart, X, CheckCircle2, ChevronRight, BarChart3, AlertCircle,
  ExternalLink, Loader2
} from 'lucide-react';
import SwipeDeck from '../components/SwipeDeck';

export default function SeekerDashboard({ onNavigate }) {
  const { user, logout, resumeData, uploadResume, uploadResumeFile } = useAuth();
  const [activeTab, setActiveTab] = useState('resume'); // 'resume' | 'swipe' | 'applications'

  // Upload and parsing state variables
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('idle'); // 'idle' | 'reading' | 'scanning' | 'compiling' | 'done'
  const [isDragActive, setIsDragActive] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [swipeJobs, setSwipeJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [applications, setApplications] = useState([]);
  const [selectedAppToTrack, setSelectedAppToTrack] = useState(null);
  const [isSyncingPipeline, setIsSyncingPipeline] = useState(false);
  const [syncLogs, setSyncLogs] = useState([]);

  // Visit external Greenhouse/apply site
  const handleVisitExternalSite = (app) => {
    console.log("User officially clicked to visit external Greenhouse portal for:", app.company);
  };

  // Sync / Simulate tracking updates in real-time
  const triggerSimulationSync = async (appId, targetApp = null) => {
    const app = targetApp || selectedAppToTrack;
    setIsSyncingPipeline(true);
    setSyncLogs([
      `Initializing Auto-Apply Agent for ${app?.company || 'Company'}...`,
      `Connecting to official portal: ${app?.apply_url || 'ATS System'}...`
    ]);
    
    setTimeout(() => {
      setSyncLogs(prev => [...prev, "Bypassing security checks & establishing secure session..."]);
    }, 1200);

    setTimeout(() => {
      setSyncLogs(prev => [...prev, "Auto-filling parsed resume data and candidate profile..."]);
    }, 2400);

    setTimeout(() => {
      setSyncLogs(prev => [...prev, "Submitting application payload directly to company database..."]);
    }, 3600);

    setTimeout(async () => {
      try {
        const token = localStorage.getItem('careerswipe_token');
        const res = await fetch('/api/jobs/applications/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ application_id: appId })
        });
        
        if (res.ok) {
          const data = await res.json();
          // Update local application status
          setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: data.newStatus } : a));
          setSelectedAppToTrack(prev => prev && prev.id === appId ? { ...prev, status: data.newStatus } : prev);
          setSyncLogs(prev => [...prev, `Success! Application officially received and processed. Status: "${data.newStatus.toUpperCase()}"`]);
        } else {
          setSyncLogs(prev => [...prev, "Failed to connect with Company API. Sync timed out."]);
        }
      } catch (err) {
        setSyncLogs(prev => [...prev, "Network handshake failure. Please retry."]);
      } finally {
        setIsSyncingPipeline(false);
      }
    }, 5000);
  };


  // Fetch job feed for seeker
  const loadJobFeed = async () => {
    if (!resumeData) {
      setSwipeJobs([]);
      return;
    }
    setLoadingJobs(true);
    try {
      const res = await fetch('/api/jobs/swipe-feed', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('careerswipe_token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSwipeJobs(data);
      }
    } catch (err) {
      console.error("Failed to load swipe jobs:", err);
    } finally {
      setLoadingJobs(false);
    }
  };

  // Fetch applied jobs list
  const loadApplications = async () => {
    if (!resumeData) {
      setApplications([]);
      return;
    }
    try {
      const res = await fetch('/api/jobs/applications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('careerswipe_token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    }
  };

  useEffect(() => {
    if (resumeData) {
      setResumeText(resumeData.raw_text || '');
      setUploadStage('done');
    }
    loadJobFeed();
    loadApplications();
  }, [resumeData]);

  // File Drag Actions
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (selectedFile) => {
    setFile(selectedFile);
    setUploadStage('reading');
    setUploadProgress(15);
    setFeedbackMsg('');
    setAnalyzing(true);

    // Simulated parsing progress
    let progress = 15;
    const interval = setInterval(async () => {
      progress += 15;
      if (progress >= 45 && progress < 80) {
        setUploadStage('scanning');
      } else if (progress >= 80 && progress < 100) {
        setUploadStage('compiling');
      }

      if (progress >= 100) {
        clearInterval(interval);
        setUploadProgress(100);
        setUploadStage('done');

        try {
          const result = await uploadResumeFile(selectedFile);
          if (result.success) {
            setFeedbackMsg(`Successfully scanned & synchronized "${selectedFile.name}"! Jobs are now ranked by sector alignment and match percentage.`);
            loadJobFeed();
          } else {
            setFeedbackMsg(result.message || 'Failed to parse file metrics.');
            setUploadStage('idle');
            setUploadProgress(0);
          }
        } catch (err) {
          setFeedbackMsg('Failed to process parsed resume.');
          setUploadStage('idle');
          setUploadProgress(0);
        } finally {
          setAnalyzing(false);
        }
      } else {
        setUploadProgress(progress);
      }
    }, 200);
  };

  const handleSwipe = async (jobId, direction) => {
    try {
      const res = await fetch('/api/jobs/swipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('careerswipe_token')}`
        },
        body: JSON.stringify({ job_id: jobId, direction })
      });
      if (res.ok) {
        // Reload applications list if swiped right
        if (direction === 'right') {
          loadApplications();
        }
      }
    } catch (err) {
      console.error("Failed to record swipe:", err);
    }
  };

  const exportReport = () => {
    if (!resumeData) return;
    const reportStr = `CAREER_SWIPE - ATS SCORE REPORT\n` +
      `==============================\n` +
      `Name: ${user.full_name}\n` +
      `Email: ${user.email}\n` +
      `Overall ATS Compatibility Score: ${resumeData.analysis.ats_score}%\n\n` +
      `SECTION BREAKDOWN:\n` +
      Object.entries(resumeData.analysis.section_breakdown)
        .map(([name, score]) => ` - ${name}: ${score}%`)
        .join('\n') + '\n\n' +
      `PRIORITY RECOMMENDATIONS:\n` +
      resumeData.analysis.priority_recommendations
        .map((p, idx) => `${idx + 1}. [${p.priority}] ${p.item}: ${p.details}`)
        .join('\n') + '\n';

    const blob = new Blob([reportStr], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CareerSwipe_ATS_Report_${user.full_name.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Status mapping colors for application tags
  const getStatusBadge = (status) => {
    switch (status) {
      case 'applied': return 'border-slate-500/20 text-slate-400 bg-slate-500/10';
      case 'interview': return 'border-purple-500/20 text-purple-400 bg-purple-500/10';
      case 'rejected': return 'border-pink-500/20 text-pink-400 bg-pink-500/10';
      case 'accepted': return 'border-emerald-500/20 text-emerald-400 bg-emerald-500/10';
      default: return 'border-slate-500/20 text-slate-400 bg-slate-500/10';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'applied': return 'Awaiting Response';
      case 'interview': return 'Interview Requested';
      case 'rejected': return 'Not Selected';
      case 'accepted': return 'Hired';
      default: return 'Saved';
    }
  };

  const getCircleColor = (score) => {
    if (score >= 80) return '#10b981'; // emerald
    if (score >= 60) return '#a78bfa'; // violet
    return '#38bdf8'; // sky
  };

  return (
    <div className="min-h-screen relative dots-grid pb-20">
      {/* Dashboard Nav */}
      <header className="w-full z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto glass-card flex justify-between items-center px-6 py-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
            {/* <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 flex-center text-black font-extrabold text-lg shadow-[0_0_15px_rgba(0,242,254,0.3)]">
              CS
            </div> */}
            <span className="font-display font-extrabold text-lg tracking-tight hidden sm:inline">CareerSwipe Seeker</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-xs text-slate-400 font-semibold bg-slate-900 border border-slate-800 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Logged: {user?.full_name}
            </span>
            <button onClick={logout} className="outline-btn py-1.5 px-4 rounded-lg text-xs font-semibold">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 mt-8" style={{ position: 'relative', zIndex: 40 }}>
        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '6px',
          background: 'rgba(15,23,42,0.6)',
          border: '1px solid rgba(51,65,85,0.5)',
          borderRadius: '16px',
          padding: '6px',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          position: 'relative',
          zIndex: 999,
          marginBottom: '2rem',
          width: 'fit-content',
        }}>
          <button
            onClick={() => setActiveTab('resume')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '12px',
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              border: activeTab === 'resume' ? '1px solid rgba(6,182,212,0.4)' : '1px solid transparent',
              background: activeTab === 'resume' ? 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(59,130,246,0.15))' : 'transparent',
              color: activeTab === 'resume' ? '#ffffff' : '#94a3b8',
              boxShadow: activeTab === 'resume' ? '0 0 20px rgba(6,182,212,0.15), inset 0 1px 0 rgba(255,255,255,0.05)' : 'none',
              outline: 'none',
            }}
            onMouseEnter={(e) => { if (activeTab !== 'resume') e.currentTarget.style.background = 'rgba(30,41,59,0.5)'; }}
            onMouseLeave={(e) => { if (activeTab !== 'resume') e.currentTarget.style.background = 'transparent'; }}
          >
            <FileText style={{ width: '18px', height: '18px' }} /> Resume Optimizer
          </button>
          <button
            onClick={() => setActiveTab('swipe')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '12px',
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              border: activeTab === 'swipe' ? '1px solid rgba(6,182,212,0.4)' : '1px solid transparent',
              background: activeTab === 'swipe' ? 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(59,130,246,0.15))' : 'transparent',
              color: activeTab === 'swipe' ? '#ffffff' : '#94a3b8',
              boxShadow: activeTab === 'swipe' ? '0 0 20px rgba(6,182,212,0.15), inset 0 1px 0 rgba(255,255,255,0.05)' : 'none',
              outline: 'none',
            }}
            onMouseEnter={(e) => { if (activeTab !== 'swipe') e.currentTarget.style.background = 'rgba(30,41,59,0.5)'; }}
            onMouseLeave={(e) => { if (activeTab !== 'swipe') e.currentTarget.style.background = 'transparent'; }}
          >
            <LayoutGrid style={{ width: '18px', height: '18px' }} /> Swipe Matching Deck
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '12px',
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              border: activeTab === 'applications' ? '1px solid rgba(6,182,212,0.4)' : '1px solid transparent',
              background: activeTab === 'applications' ? 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(59,130,246,0.15))' : 'transparent',
              color: activeTab === 'applications' ? '#ffffff' : '#94a3b8',
              boxShadow: activeTab === 'applications' ? '0 0 20px rgba(6,182,212,0.15), inset 0 1px 0 rgba(255,255,255,0.05)' : 'none',
              outline: 'none',
            }}
            onMouseEnter={(e) => { if (activeTab !== 'applications') e.currentTarget.style.background = 'rgba(30,41,59,0.5)'; }}
            onMouseLeave={(e) => { if (activeTab !== 'applications') e.currentTarget.style.background = 'transparent'; }}
          >
            <ListChecks style={{ width: '18px', height: '18px' }} /> Swiped Right Applications ({applications.length})
          </button>
        </div>

        {/* Tab 1: Resume Analyzer */}
        {activeTab === 'resume' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Form Card */}
            <div className="glass-card p-6 h-fit lg:col-span-1 border-t border-slate-800">
              <div className="flex items-center gap-2 mb-4 text-cyan-400">
                <UploadCloud className="w-6 h-6" />
                <h3 className="font-display font-bold text-lg">Optimize Your Resume</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Upload your resume file (.txt, .pdf, .docx) to compute your ATS compatibility, missing keyword density checks, and before/after layout fixes.
              </p>

              {/* Drag and Drop dropzone */}
              <div
                className={`upload-dropzone ${isDragActive ? 'active' : ''} mb-6`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('resume-file-input').click()}
              >
                <input
                  id="resume-file-input"
                  type="file"
                  onChange={handleFileChange}
                  accept=".txt,.pdf,.docx"
                  className="hidden"
                />

                <UploadCloud className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-float" style={{ animationDuration: '3s' }} />

                {file ? (
                  <div>
                    <span className="text-sm font-bold text-white block mb-1 truncate">{file.name}</span>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">&nbsp; {Math.round(file.size / 1024)} KB</span>
                  </div>
                ) : resumeData ? (
                  <div>
                    <span className="text-sm font-bold text-white block mb-1">Active Resume Synced</span>
                    <span className="text-xs text-emerald-400 font-semibold">&nbsp; Drop a new file to override</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-sm font-bold text-slate-200 block mb-1">Drag & Drop Resume File</span>
                    <span className="text-xs text-slate-500">&nbsp; or click to browse files</span>
                  </div>
                )}
              </div>

              {/* Visual Scanning Progress Bar */}
              {uploadStage !== 'idle' && uploadStage !== 'done' && (
                <div className="mb-6 bg-slate-950 p-4 rounded-xl border border-slate-900 text-center">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block mb-2 animate-pulse">
                    {uploadStage === 'reading' && 'Reading File structure...'}
                    {uploadStage === 'scanning' && 'Optical ATS Text Scanning...'}
                    {uploadStage === 'compiling' && 'Compiling NLP Keywords matching...'}
                  </span>

                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 font-mono font-bold">{uploadProgress}% Complete</span>
                </div>
              )}

              {feedbackMsg && (
                <div className="mb-6 bg-slate-900 border border-slate-800 text-cyan-400 text-xs py-3 px-4 rounded-xl leading-relaxed text-center font-bold">
                  {feedbackMsg}
                </div>
              )}

              {file && uploadStage === 'done' && (
                <div className="text-center text-xs text-slate-500">
                  <span>Need to update? Drop a new file above to refresh matches.</span>
                </div>
              )}
            </div>

            {/* Analysis Dashboard Card */}
            <div className="lg:col-span-2 space-y-6">
              {!resumeData ? (
                <div className="glass-card flex-center flex-col p-12 text-center h-[500px]">
                  <BarChart3 className="w-16 h-16 text-slate-600 mb-4 animate-float" style={{ animationDuration: '4s' }} />
                  <h3 className="text-xl font-bold mb-2">No Analysis Available</h3>
                  <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                    Upload your resume file (.txt, .pdf, or .docx) in the optimizer panel to generate your comprehensive ATS scorecard and compatible job matches.
                  </p>
                </div>
              ) : (
                <>
                  {/* Summary Metric Header */}
                  <div className="glass-card p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                    <div className="md:col-span-1 flex-center flex-col border-r border-slate-800/80 pr-6">
                      <div className="relative w-24 h-24 flex-center">
                        <svg className="absolute w-24 h-24 transform -rotate-90">
                          <circle cx="48" cy="48" r="40" stroke="#1e293b" strokeWidth="6" fill="transparent" />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke={getCircleColor(resumeData.analysis.ats_score)}
                            strokeWidth="6"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 40}
                            strokeDashoffset={2 * Math.PI * 40 * (1 - resumeData.analysis.ats_score / 100)}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="font-display font-extrabold text-2xl">{resumeData.analysis.ats_score}%</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase mt-3">ATS Score</span>
                    </div>

                    <div className="md:col-span-3 grid grid-cols-3 gap-4 text-center">
                      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3.5">
                        <span className="text-xs text-slate-400 block mb-1">Clarity &nbsp;</span>
                        <span className="font-display font-bold text-lg text-white">{resumeData.analysis.clarity_score}/100</span>
                      </div>
                      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3.5">
                        <span className="text-xs text-slate-400 block mb-1">Format &nbsp;</span>
                        <span className="font-display font-bold text-lg text-white">{resumeData.analysis.font_formatting.score}%</span>
                      </div>
                      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3.5">
                        <span className="text-xs text-slate-400 block mb-1">Consistency &nbsp;</span>
                        <span className="font-display font-bold text-lg text-white">{resumeData.analysis.consistency_check.score}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Section Breakdown Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Keyword Match Card */}
                    <div className="glass-card p-6">
                      <h4 className="font-display font-bold text-sm border-b border-slate-850 pb-2 mb-4 flex justify-between">
                        <span>Keyword Alignment Score</span>
                        <span className="text-cyan-400">{resumeData.analysis.keyword_matching.score}%</span>
                      </h4>
                      <div className="text-xs text-slate-400 mb-3 leading-relaxed">
                        Density: {resumeData.analysis.keyword_matching.density} check of standard sector terms.
                      </div>

                      <div className="space-y-3">
                        <div>
                          <span className="text-[10px] text-emerald-400 font-bold block mb-1">FOUND IN RESUME ({resumeData.analysis.keyword_matching.skills_found.length})</span>
                          <div className="flex flex-wrap gap-1.5">
                            {resumeData.analysis.keyword_matching.skills_found.slice(0, 10).map((s, idx) => (
                              <span key={idx} className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                                {s}
                              </span>
                            ))}
                            {resumeData.analysis.keyword_matching.skills_found.length === 0 && <span className="text-slate-500">None detected yet.</span>}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-rose-400 font-bold block mb-1">MISSING FROM RESUME ({resumeData.analysis.keyword_matching.skills_missing.length})</span>
                          <div className="flex flex-wrap gap-1.5">
                            {resumeData.analysis.keyword_matching.skills_missing.map((s, idx) => (
                              <span key={idx} className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section Checker Card */}
                    <div className="glass-card p-6">
                      <h4 className="font-display font-bold text-sm border-b border-slate-850 pb-2 mb-4">Section Check (Organization)</h4>
                      <div className="space-y-2">
                        {Object.entries(resumeData.analysis.section_breakdown).map(([sec, val], idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">{sec}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${val}%` }} />
                              </div>
                              <span className="font-mono text-[10px] font-bold w-6 text-right">{val}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Priority Recommendations */}
                  <div className="glass-card p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-display font-bold text-sm">Priority Fix Recommendations</h4>
                      <button onClick={exportReport} className="outline-btn py-1.5 px-3 rounded-lg text-xs flex items-center gap-1.5">
                        <Download className="w-3.5 h-3.5" /> Export Report
                      </button>
                    </div>

                    <div className="space-y-3">
                      {resumeData.analysis.priority_recommendations.map((rec, idx) => (
                        <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex gap-3.5">
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded h-fit ${rec.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                            {rec.priority}
                          </span>
                          <div>
                            <h5 className="text-xs font-bold mb-1">{rec.item}</h5>
                            <p className="text-slate-400 text-xs leading-relaxed">{rec.details}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Grammar Spelling & Font Check */}
                  <div className="glass-card p-6">
                    <h4 className="font-display font-bold text-sm mb-4">Formatting & Writing Audits</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-400">
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
                        <span className="text-[10px] text-cyan-400 font-bold block mb-1">STYLE & FONT LAYOUT</span>
                        <div className="flex justify-between items-start text-xs">
                          <span className="shrink-0 text-slate-400">Hierarchy:</span>
                          <span className="text-white font-bold text-right ml-4">{resumeData.analysis.font_formatting.rating}</span>
                        </div>
                        <div className="flex justify-between items-start text-xs">
                          <span className="shrink-0 text-slate-400">Chronology:</span>
                          <span className="text-white font-bold text-right ml-4">{resumeData.analysis.consistency_check.rating}</span>
                        </div>
                        <div className="flex justify-between items-start text-xs">
                          <span className="shrink-0 text-slate-400">Length analysis:</span>
                          <span className="text-white font-bold text-right ml-4">{resumeData.analysis.length_analysis.rating}</span>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
                        <span className="text-[10px] text-indigo-400 font-bold block mb-1">GRAMMAR & Spelling ALERTS</span>

                        {resumeData.analysis.grammar_spelling.issues.length === 0 ? (
                          <div className="text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4" /> Perfect. No passive or grammar issues found.
                          </div>
                        ) : (
                          resumeData.analysis.grammar_spelling.issues.map((iss, idx) => (
                            <div key={idx} className="flex gap-2 text-[11px] leading-relaxed">
                              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                              <div>
                                <span className="text-amber-400 font-bold block">{iss.error}</span>
                                <span className="text-slate-400">&nbsp;{iss.suggestion}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Comparative Before/After Suggestions */}
                  <div className="glass-card p-6">
                    <h4 className="font-display font-bold text-sm mb-4">Quantitative Before/After Suggestions</h4>
                    <div className="space-y-4">
                      {resumeData.analysis.before_after_suggestions.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                          <div className="bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg">
                            <span className="text-[9px] text-rose-500 font-bold block mb-1">BEFORE (WEAK ACHIEVEMENT)</span>
                            <span className="text-slate-400">"{item.before}"</span>
                          </div>
                          <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg">
                            <span className="text-[9px] text-emerald-500 font-bold block mb-1">AFTER (QUANTIFIABLE IMPACT)</span>
                            <span className="text-slate-200">"{item.after}"</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Match & Swipe Deck */}
        {activeTab === 'swipe' && (
          <div className="py-6 flex flex-col items-center w-full">
            {!resumeData ? (
              <div className="glass-card flex-center flex-col p-12 text-center h-[400px] max-w-2xl w-full border border-slate-800">
                <Sparkles className="w-16 h-16 text-cyan-500/60 mb-4 animate-float" style={{ animationDuration: '4s' }} />
                <h3 className="text-xl font-bold mb-2">Swipe Matching Deck Locked</h3>
                <p className="text-slate-400 text-sm max-w-md leading-relaxed mb-6">
                  Please upload your resume in the **Resume Optimizer** first. Once uploaded, we will parse your skills and match you with tailored jobs in real-time.
                </p>
                <button
                  onClick={() => setActiveTab('resume')}
                  className="glow-btn py-2.5 px-6 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:opacity-90"
                >
                  Go to Resume Optimizer
                </button>
              </div>
            ) : loadingJobs ? (
              <div className="h-64 flex-center">
                <span className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <SwipeDeck jobs={swipeJobs} onSwipe={handleSwipe} />
            )}
          </div>
        )}

        {/* Tab 3: Swiped Right Applications */}
        {activeTab === 'applications' && (
          <div className="glass-card p-6 border border-slate-800">
            <h3 className="font-display font-bold text-lg mb-6">Submitted Swiped Applications</h3>

            {!resumeData ? (
              <div className="py-20 text-center text-slate-500 flex flex-col items-center">
                <ListChecks className="w-12 h-12 mb-3 text-slate-700" />
                <p className="text-sm font-bold text-slate-400 mb-1">Applications Feature Locked</p>
                <p className="text-xs text-slate-600 mt-1 mb-6">You need to upload a resume first before you can match and apply to jobs.</p>
                <button
                  onClick={() => setActiveTab('resume')}
                  className="glow-btn py-2.5 px-6 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:opacity-90"
                >
                  Go to Resume Optimizer
                </button>
              </div>
            ) : applications.length === 0 ? (
              <div className="py-20 text-center text-slate-500 flex flex-col items-center">
                <Award className="w-12 h-12 mb-3 text-slate-700" />
                <p className="text-sm">You haven't swiped right on any jobs yet.</p>
                <p className="text-xs text-slate-600 mt-1">Visit the Swipe Deck to find jobs matched to your resume.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">Job Listing</th>
                      <th className="pb-3">Location</th>
                      <th className="pb-3">Salary Bracket</th>
                      <th className="pb-3">Compatibility</th>
                      <th className="pb-3">Apply Link</th>
                      <th className="pb-3 text-right">Saved Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-slate-300 divide-y divide-slate-900/60">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-950/20 transition-colors">
                        <td className="py-4">
                          <div>
                            <span className="font-bold text-white block">{app.title}</span>
                            <span className="text-xs text-slate-400">&nbsp;{app.company}</span>
                          </div>
                        </td>
                        <td className="py-4 text-xs text-slate-400">{app.location}</td>
                        <td className="py-4 text-xs text-emerald-400">{app.salary}</td>
                        <td className="py-4">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400">
                            {app.match_percentage}% Match
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            {app.apply_url ? (
                              <a
                                href={app.apply_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => handleVisitExternalSite(app)}
                                className="px-3 py-1.5 text-xs font-bold rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 transition-all flex items-center gap-1 cursor-pointer"
                              >
                                Apply Officially <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <span className="text-xs text-slate-500 italic">No external link</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 text-xs text-slate-500 text-right">
                          {new Date(app.applied_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
