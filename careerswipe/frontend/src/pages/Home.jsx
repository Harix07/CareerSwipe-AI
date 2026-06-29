import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, CheckCircle2, ChevronDown, Award, Briefcase, Zap, Shield, MessageSquare } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';
import { API_URL } from '../context/AuthContext';

export default function Home({ onNavigate }) {
  const [activeFaq, setActiveFaq] = useState(null);

  const [customTestimonials, setCustomTestimonials] = useState([
    {
      quote: "CareerSwipe totally reinvented my job hunt. The resume analysis gave me clear items to fix. In 2 weeks of right-swiping, I landed three interviews!",
      author: "Alex Rivers",
      role: "Senior React Engineer",
      company: "Stripe",
      avatar: "AR"
    },
    {
      quote: "As a recruiter, finding candidates who fit our criteria used to take hours of manual filtering. CareerSwipe's ATS alignment matches them automatically.",
      author: "Sarah Jenkins",
      role: "Director of Talent Acquisition",
      company: "Linear",
      avatar: "SJ"
    },
    {
      quote: "The interface is addictive and efficient. Swiping on matching cards is so much faster than scrolling endless pages of job boards.",
      author: "Marcus Chen",
      role: "Machine Learning Graduate",
      company: "Anthropic",
      avatar: "MC"
    }
  ]);

  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newQuote, setNewQuote] = useState('');

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch(`${API_URL}/feedback`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setCustomTestimonials(data);
        }
      }
    } catch (err) {
      console.error("Failed to load feedbacks:", err);
    }
  };

  const handleAddFeedback = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newQuote.trim()) return;
    const initials = newName.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'CS';
    const newFeedback = {
      quote: newQuote,
      author: newName,
      role: newRole || 'Professional',
      company: newCompany || 'Tech Corp',
      avatar: initials
    };

    try {
      const res = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(newFeedback)
      });
      if (res.ok) {
        fetchFeedbacks();
        setNewName('');
        setNewRole('');
        setNewCompany('');
        setNewQuote('');
      } else {
        console.error("Failed to save feedback");
      }
    } catch (err) {
      console.error("Failed to add feedback:", err);
    }
  };

  const faqs = [
    {
      question: "How does the AI-powered resume analysis work?",
      answer: "When you upload your resume text or draft, our backend parses key attributes: keyword density, professional section organization, grammar errors, font spacing, and impact sentences. It cross-references your profile against standard hiring indexes to output a complete ATS score, detailed priority recommendations, and real before/after formatting examples."
    },
    {
      question: "Are the matches real, and can I actually submit applications?",
      answer: "Yes! CareerSwipe aggregates real-time vacancies from active recruiters. When you swipe right on a card, the application is instantly created. Recruiter dashboards show applicant profiles dynamically grouped by their match percentage, allowing companies to short-list or schedule interviews instantly."
    },
    {
      question: "What is the differences between seeker and recruiter roles?",
      answer: "Job seekers upload their resumes, review detailed ATS scorecards, access role recommendations, and swipe on compatible job openings. Recruiters post vacancies, specify key technical requirements, and access an organized talent portal to review applicants' scores and invite them for interviews."
    },
    {
      question: "Is there an export tool for the resume report?",
      answer: "Yes! In your seeker dashboard, once your resume has been analyzed, you can export a complete PDF summary detailing your priority suggestions, before/after fixes, and formatting scores."
    }
  ];

  const handleToggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="relative min-h-screen overflow-hidden dots-grid">
      <ParticleBackground />

      {/* Navigation Header */}
      <header className="fixed top-0 left-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto glass-card flex justify-between items-center px-6 py-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
            {/* <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 flex-center text-black font-extrabold text-xl shadow-[0_0_15px_rgba(0,242,254,0.3)]">
              CS
            </div> */}
            <span className="font-display font-extrabold text-xl tracking-tight">CareerSwipe</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-cyan-400 transition-colors">Testimonials</a>
            <a href="#faq" className="hover:text-cyan-400 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('login')} className="outline-btn py-2 px-5 rounded-xl text-sm">
              Log In
            </button>
            <button onClick={() => onNavigate('login')} className="glow-btn-cyan py-2 px-5 rounded-xl text-sm">
              Register Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 text-center max-w-5xl mx-auto relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 mb-6 text-cyan-400 font-medium text-xs tracking-wider uppercase animate-bounce" style={{ animationDuration: '3s' }}>
          <Sparkles className="w-4.5 h-4.5 text-cyan-400" />
          AI-Powered Job Recommendation System
        </div>

        <h1 className="font-display font-extrabold text-5xl md:text-7xl leading-tight mb-6">
          Swipe Right on Your <br />
          <span className="text-gradient-cyan">Future Career</span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          The ultimate double-sided job portal. Upload your resume to receive a comprehensive ATS checkup, matching keyword recommendations, and a swipe deck that finds jobs tailored to your skills.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <button onClick={() => onNavigate('login')} className="glow-btn-cyan py-4 px-8 rounded-xl flex items-center justify-center gap-2 text-base">
            Get Started As Seeker <ArrowRight className="w-5 h-5" />
          </button>
          <button onClick={() => onNavigate('login')} className="outline-btn py-4 px-8 rounded-xl flex items-center justify-center gap-2 text-base">
            Recruiter Portal <Briefcase className="w-5 h-5" />
          </button>
        </div>

        {/* Floating Preview Graphic */}
        <div className="w-full max-w-4xl glass-card p-4 relative shadow-[0_20px_50px_rgba(0,242,254,0.1)]">
          <div className="w-full h-8 flex items-center gap-2 px-4 border-b border-slate-800/80 bg-slate-950/60 rounded-t-xl mb-4">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-500 ml-4 font-mono">Working Mechanism</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
            <div className="glass-card bg-slate-950/30 p-5 text-left border-dashed border-cyan-500/20">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 uppercase tracking-wider mb-2 inline-block">Step 1</span>
              <h4 className="font-bold mb-1">ATS Scanner</h4>
              <p className="text-xs text-slate-400">Paste your resume to compute your compatibility index and receive priority fixes.</p>
              <div className="mt-4 bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono text-cyan-400 flex justify-between items-center">
                <span>ATS COMPATIBILITY:</span>
                <span className="font-bold text-emerald-400">89%</span>
              </div>
            </div>

            <div className="glass-card bg-slate-950/30 p-5 text-left border-dashed border-cyan-500/20">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 uppercase tracking-wider mb-2 inline-block">Step 2</span>
              <h4 className="font-bold mb-1">Swiping</h4>
              <p className="text-xs text-slate-400">Swipe cards representing real-time vacancies matched to your precise skills.</p>
              <div className="mt-4 flex gap-2 justify-center">
                <span className="px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-bold">LEFT = SKIP</span>
                <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold">RIGHT = APPLY</span>
              </div>
            </div>

            <div className="glass-card bg-slate-950/30 p-5 text-left border-dashed border-cyan-500/20">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 uppercase tracking-wider mb-2 inline-block">Step 3</span>
              <h4 className="font-bold mb-1">Direct Match</h4>
              <p className="text-xs text-slate-400">Recruiters see your ATS metrics directly in their pipeline when you apply.</p>
              <div className="mt-4 bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono text-indigo-400 flex justify-between items-center">
                <span>RECRUITERS LINKED:</span>
                <span className="font-bold text-white">45 Active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto relative z-10">
        <h2 className="text-3xl md:text-5xl font-display font-extrabold text-center mb-16">
          Equipped with <span className="text-gradient-cyan">Elite Features</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card p-6 flex flex-col justify-between">
            <div>
              <Zap className="w-10 h-10 text-cyan-400 mb-4" />
              <h3 className="text-lg font-bold mb-2">Keyword Density Matching</h3>
              <p className="text-sm text-slate-400">Examines standard job tags and lists specific missing skills to add.</p>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between">
            <div>
              <Award className="w-10 h-10 text-purple-400 mb-4" />
              <h3 className="text-lg font-bold mb-2">Formatting & Spelling</h3>
              <p className="text-sm text-slate-400">Reviews layout structures, fonts, and spelling to perfect professional styling.</p>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between">
            <div>
              <Shield className="w-10 h-10 text-emerald-400 mb-4" />
              <h3 className="text-lg font-bold mb-2">Impact Statements</h3>
              <p className="text-sm text-slate-400">Identifies quantitative descriptions and highlights before/after improvement suggestions.</p>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col justify-between">
            <div>
              <MessageSquare className="w-10 h-10 text-indigo-400 mb-4" />
              <h3 className="text-lg font-bold mb-2">Recruiter Pipeline</h3>
              <p className="text-sm text-slate-400">Enables recruitment offices to construct listings, trace swipe metrics, and filter applicant scores.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 bg-slate-950/40 border-y border-slate-900 relative z-10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-display font-extrabold text-center mb-16">
            Loved by <span className="text-gradient-purple">Tech Professionals</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {customTestimonials.map((t, idx) => (
              <div key={idx} className="glass-card p-8 flex flex-col justify-between hover:-translate-y-2 transition-transform border border-slate-800">
                <p className="text-slate-300 italic mb-6 leading-relaxed">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex-center font-bold text-cyan-400">
                    {t.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{t.author}</h4>
                    <span className="text-xs text-slate-400">{t.role} @ {t.company}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Feedback Form Card */}
          <div className="glass-card p-8 max-w-2xl mx-auto border border-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
            <h3 className="font-display font-bold text-xl text-center mb-2 text-white">Share Your Feedback</h3>
            <p className="text-xs text-slate-400 text-center mb-6 max-w-md mx-auto">
              We would love to hear about your experience with CareerSwipe. Leave your comment below to show up on our homepage wall!
            </p>

            <form onSubmit={handleAddFeedback} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Role / Profession</label>
                  <input
                    type="text"
                    placeholder="e.g. UI Designer"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Company / Team</label>
                  <input
                    type="text"
                    placeholder="e.g. Google"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Comment / Feedback</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Tell us what you think of CareerSwipe's AI resume optimization and job deck features..."
                  value={newQuote}
                  onChange={(e) => setNewQuote(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50 resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                Submit Feedback
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6 max-w-4xl mx-auto relative z-10">
        <h2 className="text-3xl md:text-5xl font-display font-extrabold text-center mb-16">
          Frequently Asked <span className="text-gradient-cyan">Questions</span>
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="glass-card overflow-hidden">
                <button
                  onClick={() => handleToggleFaq(idx)}
                  className="w-full py-5 px-6 flex justify-between items-center text-left text-base font-bold bg-transparent border-none text-white cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-cyan-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 text-slate-400 text-sm leading-relaxed border-t border-slate-900/60 bg-slate-950/20">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-900 text-center text-slate-500 text-xs relative z-10">
        <p className="mb-4">CareerSwipe AI job recommendation system.</p>
        <p>© 2026. All rights reserved.</p>
      </footer>
    </div>
  );
}
