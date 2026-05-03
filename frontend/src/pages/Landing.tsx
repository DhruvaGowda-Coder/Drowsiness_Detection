import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  })
};

const features = [
  { icon: '👁️', title: 'Eye Aspect Ratio', desc: 'Tracks precise eyelid movements using 6-point landmark geometry at 30+ FPS.', border: 'border-blue-500/20' },
  { icon: '🫦', title: 'Yawn Detection', desc: 'Measures mouth opening ratio to catch yawning as an early fatigue signal.', border: 'border-violet-500/20' },
  { icon: '🔔', title: 'Smart Alerts', desc: 'Progressive voice & sound warnings with emergency protocol on repeated failures.', border: 'border-amber-500/20' },
  { icon: '📊', title: 'Session Analytics', desc: 'Logs blinks, warnings, and drowsy events to a database for post-trip review.', border: 'border-emerald-500/20' },
  { icon: '🧠', title: 'Edge AI', desc: '100% in-browser via WebAssembly. No cloud, zero latency, total privacy.', border: 'border-rose-500/20' },
  { icon: '⚙️', title: 'Configurable', desc: 'Tune EAR thresholds, toggle alerts, and test alarms from a settings panel.', border: 'border-slate-400/20' },
];

const stats = [
  { value: '478', label: 'Landmarks' },
  { value: '30+', label: 'FPS' },
  { value: '0ms', label: 'Latency' },
  { value: '100%', label: 'Privacy' },
];

export const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen noise-bg" style={{ background: '#050810' }}>
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50" style={{ background: 'rgba(5,8,16,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="DrowseGuard" className="w-10 h-10 rounded-lg" />
            <span className="text-xl font-bold tracking-tight">
              Drowse<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Guard</span>
            </span>
          </div>
          <button onClick={() => navigate('/dashboard')} className="btn-primary text-base py-3 px-8">
            Open Dashboard →
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-gradient grid-pattern relative pt-40 pb-28 px-6 min-h-[90vh] flex flex-col items-center justify-center text-center">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />

        <motion.div initial="hidden" animate="visible" className="relative z-10 max-w-4xl mx-auto">
          <motion.div custom={0} variants={fadeUp}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-blue-500/20 bg-blue-500/5 mb-10">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-blue-300 font-bold">Real-time Edge AI Detection</span>
          </motion.div>

          <motion.h1 custom={1} variants={fadeUp}
            className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[1.1] mb-10">
            Stay awake.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 glow-text">
              Stay alive.
            </span>
          </motion.h1>

          <motion.p custom={2} variants={fadeUp}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            Production-grade drowsiness detection powered by MediaPipe Face Mesh.
            Tracks 478 facial landmarks in real-time — entirely in your browser.
          </motion.p>

          <motion.div custom={3} variants={fadeUp} className="flex flex-col sm:flex-row gap-5 justify-center">
            <button onClick={() => navigate('/dashboard')} className="btn-primary text-lg py-4 px-12">
              ▶ Start Monitoring
            </button>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="btn-ghost text-lg py-4 px-12">
              View Source
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/5" style={{ background: 'rgba(17,24,39,0.4)', padding: '60px 0' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 32px' }} className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-1">{s.value}</div>
              <div className="text-xs text-slate-500 font-semibold tracking-widest uppercase">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '100px 32px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center" style={{ marginBottom: '60px', paddingTop: '20px' }}>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ marginBottom: '16px' }}>
              Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">real safety</span>
            </h2>
            <p className="text-base text-slate-400 leading-relaxed" style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
              Not a proof of concept. A production-grade system with a modern tech stack.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3" style={{ gap: '24px' }}>
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className={`glass-card rounded-2xl border ${f.border} flex flex-col items-center text-center`} style={{ padding: '32px' }}>
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold mb-2 text-white">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative" style={{ padding: '80px 32px' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />
        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative z-10 text-center" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 className="text-3xl font-bold mb-4">Ready to try it?</h2>
          <p className="text-base text-slate-400 mb-8">All you need is a webcam. No installation, no downloads, no cloud.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary text-base py-4 px-12">
            Launch Dashboard →
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-8" style={{ padding: '40px 32px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }} className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <img src="/logo.png" alt="" className="w-5 h-5 rounded opacity-60" />
            <span>DrowseGuard — Resume-level production project.</span>
          </div>
          <div className="text-slate-600 text-xs font-semibold tracking-wider">
            MEDIAPIPE · REACT · NODE.JS · SQLITE
          </div>
        </div>
      </footer>
    </div>
  );
};
