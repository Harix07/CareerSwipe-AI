import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import {
  PlusCircle, Briefcase, Users, FileText, CheckCircle2, ChevronRight, MapPin,
  DollarSign, Sparkles, Send, ExternalLink, RefreshCw, AlertCircle, Award
} from 'lucide-react';

export default function RecruiterDashboard({ onNavigate }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('postings'); // 'postings' | 'new-job' | 'applicants'

  // Input states for new job
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [skills, setSkills] = useState('');
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Mid-level');
  const [applyUrl, setApplyUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [postedJobs, setPostedJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);

  // Inspecting specific applicant
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const loadPostedJobs = async () => {
    try {
      const res = await fetch(`${API_URL}/recruiter/jobs`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('careerswipe_token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPostedJobs(data);
      }
    } catch (err) {
      console.error("Failed to load recruiter postings:", err);
    }
  };

  const loadApplicants = async () => {
    try {
      const res = await fetch(`${API_URL}/recruiter/applicants`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('careerswipe_token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setApplicants(data);
      }
    } catch (err) {
      console.error("Failed to load applicants:", err);
    }
  };

  useEffect(() => {
    loadPostedJobs();
    loadApplicants();
  }, []);

  const handlePostJob = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback('');

    if (!title || !company || !description) {
      setFeedback('Job title, company name, and description are required.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/recruiter/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('careerswipe_token')}`
        },
        body: JSON.stringify({
          title,
          company,
          description,
          requirements,
          skills,
          salary,
          location,
          experience_level: experienceLevel,
          apply_url: applyUrl
        })
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback('Job listing published successfully!');
        setTitle('');
        setCompany('');
        setDescription('');
        setRequirements('');
        setSkills('');
        setSalary('');
        setLocation('');
        setApplyUrl('');

        loadPostedJobs();
        setTimeout(() => setActiveTab('postings'), 1500);
      } else {
        setFeedback(data.message || 'Failed to publish job opening.');
      }
    } catch (err) {
      setFeedback('Failed to post job listing.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/recruiter/applicants/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('careerswipe_token')}`
        },
        body: JSON.stringify({ application_id: appId, status: newStatus })
      });
      if (res.ok) {
        loadApplicants();
        // Update selected applicant state in case it's currently open
        if (selectedApplicant && selectedApplicant.application_id === appId) {
          setSelectedApplicant(prev => ({
            ...prev,
            application_status: newStatus
          }));
        }
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const getCircleColor = (score) => {
    if (score >= 80) return 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
    if (score >= 60) return 'border-purple-500/20 text-purple-400 bg-purple-500/5 shadow-[0_0_15px_rgba(161,140,209,0.1)]';
    return 'border-sky-500/20 text-sky-400 bg-sky-500/5 shadow-[0_0_15px_rgba(0,242,254,0.1)]';
  };

  return (
    <div className="min-h-screen relative dots-grid pb-20">
      {/* Dashboard Nav */}
      <header className="w-full z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto glass-card flex justify-between items-center px-6 py-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
            {/* <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex-center text-white font-extrabold text-lg shadow-[0_0_15px_rgba(255,0,127,0.3)]">
              CS
            </div> */}
            <span className="font-display font-extrabold text-lg tracking-tight hidden sm:inline">CareerSwipe Recruiter</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-xs text-slate-400 font-semibold bg-slate-900 border border-slate-800 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              Company: {user?.full_name}
            </span>
            <button onClick={logout} className="outline-btn py-1.5 px-4 rounded-lg text-xs font-semibold">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 mt-8">
        {/* Navigation Tabs */}
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
            onClick={() => {
              setActiveTab('postings');
              setSelectedApplicant(null);
            }}
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
              border: activeTab === 'postings' ? '1px solid rgba(168,85,247,0.4)' : '1px solid transparent',
              background: activeTab === 'postings' ? 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.15))' : 'transparent',
              color: activeTab === 'postings' ? '#ffffff' : '#94a3b8',
              boxShadow: activeTab === 'postings' ? '0 0 20px rgba(168,85,247,0.15), inset 0 1px 0 rgba(255,255,255,0.05)' : 'none',
              outline: 'none',
            }}
            onMouseEnter={(e) => { if (activeTab !== 'postings') e.currentTarget.style.background = 'rgba(30,41,59,0.5)'; }}
            onMouseLeave={(e) => { if (activeTab !== 'postings') e.currentTarget.style.background = 'transparent'; }}
          >
            <Briefcase style={{ width: '18px', height: '18px' }} /> Company Postings ({postedJobs.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('new-job');
              setSelectedApplicant(null);
            }}
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
              border: activeTab === 'new-job' ? '1px solid rgba(168,85,247,0.4)' : '1px solid transparent',
              background: activeTab === 'new-job' ? 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.15))' : 'transparent',
              color: activeTab === 'new-job' ? '#ffffff' : '#94a3b8',
              boxShadow: activeTab === 'new-job' ? '0 0 20px rgba(168,85,247,0.15), inset 0 1px 0 rgba(255,255,255,0.05)' : 'none',
              outline: 'none',
            }}
            onMouseEnter={(e) => { if (activeTab !== 'new-job') e.currentTarget.style.background = 'rgba(30,41,59,0.5)'; }}
            onMouseLeave={(e) => { if (activeTab !== 'new-job') e.currentTarget.style.background = 'transparent'; }}
          >
            <PlusCircle style={{ width: '18px', height: '18px' }} /> Publish New Vacancy
          </button>
          <button
            onClick={() => setActiveTab('applicants')}
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
              border: activeTab === 'applicants' ? '1px solid rgba(168,85,247,0.4)' : '1px solid transparent',
              background: activeTab === 'applicants' ? 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.15))' : 'transparent',
              color: activeTab === 'applicants' ? '#ffffff' : '#94a3b8',
              boxShadow: activeTab === 'applicants' ? '0 0 20px rgba(168,85,247,0.15), inset 0 1px 0 rgba(255,255,255,0.05)' : 'none',
              outline: 'none',
            }}
            onMouseEnter={(e) => { if (activeTab !== 'applicants') e.currentTarget.style.background = 'rgba(30,41,59,0.5)'; }}
            onMouseLeave={(e) => { if (activeTab !== 'applicants') e.currentTarget.style.background = 'transparent'; }}
          >
            <Users style={{ width: '18px', height: '18px' }} /> Talent Pipeline ({applicants.length})
          </button>
        </div>

        {/* Tab 1: Company Postings */}
        {activeTab === 'postings' && (
          <div className="space-y-6">
            {postedJobs.length === 0 ? (
              <div className="glass-card flex-center flex-col p-12 text-center h-[350px]">
                <Briefcase className="w-12 h-12 text-slate-600 mb-4" />
                <h3 className="text-lg font-bold mb-2">No Vacancies Published</h3>
                <p className="text-slate-400 text-sm max-w-sm mb-6">
                  You haven't posted any jobs under this account yet. Click "Publish New Vacancy" to begin receiving resume matches.
                </p>
                <button onClick={() => setActiveTab('new-job')} className="glow-btn-purple py-2.5 px-5 rounded-xl text-xs flex items-center gap-1.5">
                  <PlusCircle className="w-4.5 h-4.5" /> Post Job Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {postedJobs.map((job) => (
                  <div key={job.id} className="glass-card p-6 border-l-4 border-purple-500/80">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-lg text-white">{job.title}</h4>
                        <span className="text-xs text-slate-500 font-semibold">{job.company}</span>
                      </div>
                      <span className="text-xs bg-slate-900 border border-slate-800 text-purple-400 px-3 py-1 rounded-full uppercase tracking-wider font-bold">
                        Active
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-slate-400 mb-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-purple-400" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> {job.salary}
                      </span>
                    </div>

                    {job.skills && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {job.skills.split(/,\s*/).map((s, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-950 border border-slate-800/80 text-slate-300 py-0.5 px-2 rounded-md">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    <hr className="border-slate-850/80 mb-4" />

                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Description</span>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                        {job.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Publish New Vacancy */}
        {activeTab === 'new-job' && (
          <div className="glass-card p-8 max-w-2xl mx-auto border-t border-slate-850">
            <div className="flex items-center gap-2 mb-6 text-purple-400">
              <PlusCircle className="w-6 h-6" />
              <h3 className="font-display font-bold text-lg">Publish a New Vacancy</h3>
            </div>

            {feedback && (
              <div className="mb-6 bg-slate-900 border border-slate-800 text-purple-400 text-xs py-3 px-4 rounded-xl text-center leading-relaxed">
                {feedback}
              </div>
            )}

            <form onSubmit={handlePostJob} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="custom-label">Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Backend Engineer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="custom-input"
                    required
                  />
                </div>
                <div>
                  <label className="custom-label">Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. CareerSwipe Inc."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="custom-input"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="custom-label">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="custom-input"
                  />
                </div>
                <div>
                  <label className="custom-label">Salary Range</label>
                  <input
                    type="text"
                    placeholder="e.g. $120,000 - $140,000"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="custom-input"
                  />
                </div>
                <div>
                  <label className="custom-label">Experience Bracket</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="custom-input bg-slate-950 text-slate-300"
                  >
                    <option value="Junior (1-3 yrs)">Junior (1-3 yrs)</option>
                    <option value="Mid-level">Mid-level</option>
                    <option value="Senior (5+ yrs)">Senior (5+ yrs)</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="custom-label">Core Technical Tags (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, PostgreSQL, System Design"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="custom-input"
                />
              </div>

              <div>
                <label className="custom-label">Job Application Link (Optional Website URL)</label>
                <input
                  type="url"
                  placeholder="e.g. https://careers.company.com/jobs/123"
                  value={applyUrl}
                  onChange={(e) => setApplyUrl(e.target.value)}
                  className="custom-input"
                />
              </div>

              <div>
                <label className="custom-label">Detailed Job Description</label>
                <textarea
                  placeholder="Describe day-to-day duties, culture, and project objectives..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="5"
                  className="custom-input text-sm leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="custom-label">Key Requirements</label>
                <textarea
                  placeholder="Minimum degree criteria, required certificates, or tech stack exposure..."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows="3"
                  className="custom-input text-sm leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold flex-center glow-btn-purple text-sm mt-6 disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Publish Job Vacancy'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Talent Pipeline */}
        {activeTab === 'applicants' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Applicant List */}
            <div className={`glass-card p-6 h-fit ${selectedApplicant ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
              <h3 className="font-display font-bold text-sm mb-4 border-b border-slate-900 pb-2">Seekers Pipeline</h3>

              {applicants.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No applications received yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {applicants.map((app) => (
                    <div
                      key={app.application_id}
                      onClick={() => setSelectedApplicant(app)}
                      className={`p-4 rounded-xl border border-slate-850 cursor-pointer transition-all flex justify-between items-center ${selectedApplicant?.application_id === app.application_id
                          ? 'bg-purple-500/10 border-purple-500'
                          : 'bg-slate-950/40 hover:bg-slate-900/60'
                        }`}
                    >
                      <div>
                        <h4 className="font-bold text-sm text-white">{app.applicant.name}</h4>
                        <span className="text-[11px] text-slate-400 block mb-1">Applied: {app.job.title}</span>
                        <span className="text-[10px] text-slate-500 block">Date: {new Date(app.applied_at).toLocaleDateString()}</span>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${getCircleColor(app.applicant.compatibility)}`}>
                          {app.applicant.compatibility}% Match
                        </span>
                        <span className="text-[9px] uppercase font-extrabold text-slate-400">
                          {app.application_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Seeker Details Inspector */}
            {selectedApplicant && (
              <div className="lg:col-span-2 glass-card p-6 space-y-6">
                <div className="flex justify-between items-start border-b border-slate-900 pb-4">
                  <div>
                    <h3 className="font-display font-extrabold text-xl text-white">{selectedApplicant.applicant.name}</h3>
                    <span className="text-xs text-slate-400">{selectedApplicant.applicant.email}</span>
                  </div>


                </div>

                {/* Relational Stats cards */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                    <span className="text-[10px] text-slate-400 block mb-1">JOB ACCURACY</span>
                    <span className="font-display font-extrabold text-base text-cyan-400">{selectedApplicant.applicant.compatibility}%</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                    <span className="text-[10px] text-slate-400 block mb-1">ATS INDEX</span>
                    <span className="font-display font-extrabold text-base text-purple-400">{selectedApplicant.applicant.ats_score}%</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                    <span className="text-[10px] text-slate-400 block mb-1">CLARITY SCORE</span>
                    <span className="font-display font-extrabold text-base text-emerald-400">{selectedApplicant.applicant.analysis?.clarity_score || 70}%</span>
                  </div>
                </div>

                {/* Candidate Resume Text */}
                <div>
                  <h4 className="font-display font-bold text-xs uppercase text-slate-500 tracking-wider mb-2">Resume Extract</h4>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 text-xs font-mono max-h-40 overflow-y-auto leading-relaxed text-slate-400">
                    {selectedApplicant.applicant.resume_text || "No resume text content uploaded."}
                  </div>
                </div>

                {/* Resume Analysis Details */}
                {selectedApplicant.applicant.analysis && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Skills Detected */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                      <span className="text-[10px] text-emerald-400 font-bold block mb-2 uppercase">Core Skills Found</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedApplicant.applicant.analysis.keyword_matching.skills_found.map((s, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 py-0.5 px-2 rounded-md">
                            {s}
                          </span>
                        ))}
                        {selectedApplicant.applicant.analysis.keyword_matching.skills_found.length === 0 && (
                          <span className="text-xs text-slate-500">None detected.</span>
                        )}
                      </div>
                    </div>

                    {/* ATS Priority Check */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                      <span className="text-[10px] text-purple-400 font-bold block mb-2 uppercase">Format & Length Check</span>
                      <div className="space-y-1 text-xs text-slate-400">
                        <div className="flex justify-between">
                          <span>Word Count:</span>
                          <span className="text-white font-bold">{selectedApplicant.applicant.analysis.length_analysis.word_count} words</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Chronology:</span>
                          <span className="text-white font-bold">{selectedApplicant.applicant.analysis.consistency_check.rating}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Layout quality:</span>
                          <span className="text-white font-bold">{selectedApplicant.applicant.analysis.font_formatting.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
