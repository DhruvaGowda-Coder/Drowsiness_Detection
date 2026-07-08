import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  BellRing,
  BrainCircuit,
  Camera,
  ChevronRight,
  Eye,
  Gauge,
  Lock,
  Settings2,
  ShieldCheck,
  Timer
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as any }
  })
};

const features = [
  {
    icon: Eye,
    title: 'Eye aspect ratio',
    desc: 'Uses facial landmarks to estimate eyelid closure and detect prolonged eye fatigue.'
  },
  {
    icon: Activity,
    title: 'Mouth movement signal',
    desc: 'Tracks mouth aspect ratio alongside eye signals for a clearer drowsiness picture.'
  },
  {
    icon: BellRing,
    title: 'Progressive alerts',
    desc: 'Moves from warning to drowsy to emergency states with sound and voice alert options.'
  },
  {
    icon: BarChart3,
    title: 'Session summary',
    desc: 'Stores local session history with blinks, warnings, emergency stops, and duration.'
  },
  {
    icon: Lock,
    title: 'Browser-first privacy',
    desc: 'Runs the face model in the browser, keeping video processing on the device.'
  },
  {
    icon: Settings2,
    title: 'Tunable detection',
    desc: 'Includes camera selection, EAR threshold tuning, and alert preferences.'
  }
];

const stats = [
  { value: '478', label: 'Face landmarks', icon: BrainCircuit },
  { value: 'Live', label: 'Detection loop', icon: Gauge },
  { value: 'Local', label: 'History storage', icon: Lock },
  { value: 'Webcam', label: 'Input device', icon: Camera }
];

export const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen app-shell">
      <nav className="fixed top-0 z-50 w-full border-b border-white/8 bg-[#07111f]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-3" aria-label="DrowseGuard home">
            <img src="/logo.png" alt="" className="h-10 w-10 rounded-lg ring-1 ring-white/10" />
            <span className="text-lg font-bold tracking-tight text-white">
              Drowse<span className="text-cyan-300">Guard</span>
            </span>
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-primary compact-btn">
            <span>Open Dashboard</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </nav>

      <main>
        <section className="relative min-h-[92vh] overflow-hidden px-5 pt-32 pb-14 sm:px-8">
          <div className="absolute inset-0 hero-field" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent" />

          <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_0.92fr]">
            <motion.div initial="hidden" animate="visible" className="max-w-3xl">
              <motion.div custom={0} variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/8 px-4 py-2 text-sm font-semibold text-cyan-100">
                <ShieldCheck size={16} />
                Real-time driver drowsiness detection
              </motion.div>

              <motion.h1 custom={1} variants={fadeUp} className="mt-8 max-w-4xl text-5xl font-black leading-[1.02] tracking-normal text-white sm:text-6xl lg:text-7xl">
                AI-powered fatigue monitoring, built for a real webcam demo.
              </motion.h1>

              <motion.p custom={2} variants={fadeUp} className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                DrowseGuard uses MediaPipe face landmarks to track eye closure, warning states, alerts, and session history directly in the browser.
              </motion.p>

              <motion.div custom={3} variants={fadeUp} className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button onClick={() => navigate('/dashboard')} className="btn-primary hero-btn">
                  <Camera size={20} />
                  <span>Start Monitoring</span>
                </button>
                <button onClick={() => navigate('/dashboard')} className="btn-ghost hero-btn">
                  <Gauge size={20} />
                  <span>View Live Dashboard</span>
                </button>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.15 }} className="dashboard-preview">
              <div className="preview-topbar">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Live status</p>
                  <p className="mt-1 text-2xl font-black text-emerald-300">AWAKE</p>
                </div>
                <span className="live-pill"><span /> Face locked</span>
              </div>
              <div className="preview-camera">
                <div className="face-frame">
                  <Eye size={54} />
                </div>
              </div>
              <div className="preview-grid">
                {stats.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="preview-stat">
                      <Icon size={18} />
                      <strong>{item.value}</strong>
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-y border-white/8 bg-white/[0.025] px-5 py-10 sm:px-8">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="metric-tile">
                  <Icon size={20} />
                  <div className="text-3xl font-black text-white">{s.value}</div>
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{s.label}</div>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">Project stack</p>
              <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Focused features, polished execution.</h2>
              <p className="mt-4 text-base leading-7 text-slate-400">
                The app keeps the scope tight: detection, alerts, settings, and local history. The interface is built to make those pieces feel credible during a college demo or resume walkthrough.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div key={feature.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} className="feature-tile">
                    <div className="feature-icon"><Icon size={22} /></div>
                    <h3>{feature.title}</h3>
                    <p>{feature.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-5 pb-16 sm:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-lg border border-white/8 bg-cyan-300/[0.035] p-6 sm:p-8 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-cyan-300">
                <Timer size={16} />
                Demo ready
              </div>
              <h2 className="mt-3 text-2xl font-black text-white">Open the dashboard and test the live detector.</h2>
            </div>
            <button onClick={() => navigate('/dashboard')} className="btn-primary hero-btn">
              <span>Launch Dashboard</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
