import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, Award, CheckCircle2, ChevronRight, X, Heart, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SwipeDeck({ jobs, onSwipe }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (currentIndex >= jobs.length) return;
      if (e.key === 'ArrowRight') {
        triggerSwipe('right');
      } else if (e.key === 'ArrowLeft') {
        triggerSwipe('left');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, jobs]);

  const activeJob = jobs[currentIndex];

  const triggerSwipe = (direction) => {
    if (currentIndex >= jobs.length) return;
    onSwipe(jobs[currentIndex].id, direction);
    
    if (direction === 'right') {
      // Trigger a mini colorful confetti on positive match!
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#00f2fe', '#4facfe', '#38ef7d']
      });
    }

    setCurrentIndex(prev => prev + 1);
  };

  const handleReset = () => {
    setCurrentIndex(0);
  };

  if (currentIndex >= jobs.length) {
    return (
      <div className="glass-card flex-center flex-col p-10 text-center max-w-md mx-auto" style={{ borderStyle: 'dashed', borderWidth: '2px' }}>
        <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-700 flex-center mb-6 text-cyan-400">
          <RefreshCw className="w-10 h-10 animate-spin" style={{ animationDuration: '3s' }} />
        </div>
        <h3 className="text-2xl font-bold mb-3">Feed Synced!</h3>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          You've reviewed all available jobs in our system. Recruiters are constantly posting new positions, or you can update your resume keywords to refresh matches!
        </p>
        <button onClick={handleReset} className="glow-btn-cyan py-3 px-6 rounded-xl flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Restart Feed
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md mx-auto h-[600px] flex-center">
      {jobs.slice(currentIndex, currentIndex + 2).reverse().map((job, idx, arr) => {
        const isTop = idx === arr.length - 1;
        return (
          <SwipeCard
            key={job.id}
            job={job}
            isTop={isTop}
            onSwipe={triggerSwipe}
          />
        );
      })}
    </div>
  );
}

function SwipeCard({ job, isTop, onSwipe }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Custom tilt transforms
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0.5, 1, 1, 1, 0.5]);
  const controls = useAnimation();

  // Dynamic stamps overlays
  const stampLikeOpacity = useTransform(x, [0, 100], [0, 1]);
  const stampNopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = async (event, info) => {
    if (!isTop) return;
    
    const threshold = 140;
    if (info.offset.x > threshold) {
      // Swipe Right
      await controls.start({ x: 500, opacity: 0, transition: { duration: 0.2 } });
      onSwipe('right');
    } else if (info.offset.x < -threshold) {
      // Swipe Left
      await controls.start({ x: -500, opacity: 0, transition: { duration: 0.2 } });
      onSwipe('left');
    } else {
      // Reset position
      controls.start({ x: 0, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  const getMatchColor = (percent) => {
    if (percent >= 80) return 'text-emerald-400 border-emerald-400/30 bg-emerald-500/10 shadow-[0_0_15px_rgba(56,239,125,0.15)]';
    if (percent >= 60) return 'text-purple-400 border-purple-400/30 bg-purple-500/10 shadow-[0_0_15px_rgba(161,140,209,0.15)]';
    return 'text-sky-400 border-sky-400/30 bg-sky-500/10 shadow-[0_0_15px_rgba(0,242,254,0.15)]';
  };

  return (
    <motion.div
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      style={{
        x,
        y: isTop ? y : 15,
        rotate: isTop ? rotate : 0,
        opacity: isTop ? opacity : 0.6,
        position: 'absolute',
        width: '100%',
        height: '100%',
        cursor: isTop ? 'grab' : 'auto',
        touchAction: 'none',
        zIndex: isTop ? 5 : 1,
        scale: isTop ? 1 : 0.96,
        pointerEvents: isTop ? 'auto' : 'none'
      }}
      className="glass-card flex flex-col justify-between p-6 shadow-2xl"
    >
      {/* If this is NOT the top card, render only a clean placeholder */}
      {!isTop ? (
        <div className="flex-center flex-col h-full text-center">
          <Briefcase className="w-12 h-12 text-slate-700 mb-3" />
          <span className="text-sm font-semibold text-slate-600">Next Job Recommendation</span>
        </div>
      ) : (
        <>
          {/* Visual Swipe Stamps */}
          <motion.div style={{ opacity: stampLikeOpacity }} className="swipe-indicator like">
            MATCH
          </motion.div>
          <motion.div style={{ opacity: stampNopeOpacity }} className="swipe-indicator nope">
            SKIP
          </motion.div>

          {/* Card Header */}
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-cyan-400 uppercase tracking-wider mb-2 inline-block">
                  {job.company}
                </span>
                <h2 className="text-xl font-bold leading-tight">{job.title}</h2>
              </div>

              {/* Compatibility score circle */}
              <div className={`flex-center flex-col border rounded-2xl p-2 w-16 h-16 ${getMatchColor(job.match_percentage)}`}>
                <span className="text-xs text-slate-400 font-medium">Match</span>
                <span className="text-base font-extrabold">{job.match_percentage}%</span>
              </div>
            </div>

            {/* Core Metadata */}
            <div className="space-y-2 mb-4 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>{job.salary || 'Competitive'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" />
                <span>{job.experience_level || "Any Experience"}</span>
              </div>
            </div>

            {/* Dynamic Skill Badges */}
            {job.skills && (
              <div className="flex flex-wrap gap-2 mb-4">
                {job.skills.split(/,\s*/).slice(0, 4).map((skill, index) => (
                  <span key={index} className="text-xs bg-slate-950/80 border border-slate-800 text-slate-300 py-1 px-2.5 rounded-lg flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                    {skill}
                  </span>
                ))}
              </div>
            )}

            <hr className="border-slate-800/80 mb-4" />

            {/* Job Description Summary */}
            <div>
              <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-1.5">Job Overview</h4>
              <p className="text-sm text-slate-300 leading-relaxed line-clamp-4">
                {job.description}
              </p>
            </div>
          </div>

          {/* Card Action Footer */}
          <div className="mt-6 flex justify-between items-center gap-4">
            {/* Swipe Left Button */}
            <button
              onClick={async () => {
                if (!isTop) return;
                await controls.start({ x: -500, opacity: 0, transition: { duration: 0.2 } });
                onSwipe('left');
              }}
              className="w-14 h-14 rounded-full border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/20 flex-center text-rose-500 transition-all shadow-[0_0_15px_rgba(239,68,68,0.05)] hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
            >
              <X className="w-6 h-6" />
            </button>

            <span className="text-xs text-slate-500 font-semibold tracking-widest uppercase flex items-center gap-1">
              Swipe Or Drag <ChevronRight className="w-3.5 h-3.5" />
            </span>

            {/* Swipe Right Button */}
            <button
              onClick={async () => {
                if (!isTop) return;
                await controls.start({ x: 500, opacity: 0, transition: { duration: 0.2 } });
                onSwipe('right');
              }}
              className="w-14 h-14 rounded-full border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/20 flex-center text-emerald-500 transition-all shadow-[0_0_15px_rgba(16,185,129,0.05)] hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              <Heart className="w-6 h-6 fill-current" />
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}
