import { Link } from 'react-router-dom'

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <img src="/logo.png" alt="TalentSync AI" style={{ height: '36px', width: 'auto' }} />
    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-primary-dark)' }}>TalentSync AI</span>
  </div>
)

const features = [
  { icon: '🎯', title: 'Precision ATS Scoring', desc: '7-category analysis covering keywords, structure, action verbs, quantified achievements, and more.' },
  { icon: '🧠', title: 'Smart AI Reports', desc: 'Our custom ATS engine generates personalised section feedback, rewrite suggestions, and career tips — no external API.' },
  { icon: '🔑', title: 'Keyword Gap Analysis', desc: 'Instantly see which keywords from the job description are missing from your resume.' },
  { icon: '📝', title: 'Rewrite Suggestions', desc: 'Get before/after bullet point rewrites to make your experience stand out.' },
  { icon: '📄', title: 'All File Formats', desc: 'Upload PDF, DOCX, DOC, ODT, TXT, RTF — we parse them all using Apache Tika.' },
  { icon: '📊', title: 'Download PDF Reports', desc: 'Save and share your full ATS report as a clean PDF with one click.' },
]

const steps = [
  { num: '01', title: 'Upload Your Resume', desc: 'Drag & drop any resume format. We support PDF, DOCX, and more.', color: '#4338CA' },
  { num: '02', title: 'Add Job Description', desc: 'Paste the job description for hyper-accurate keyword matching.', color: '#7C3AED' },
  { num: '03', title: 'Get Your AI Report', desc: 'Receive your ATS score + full in-house AI analysis in seconds — instant, private, and free.', color: '#0EA5E9' },
]

const stats = [
  { value: '90%', label: 'of resumes fail ATS screening' },
  { value: '6s', label: 'average recruiter scan time' },
  { value: '3×', label: 'more interviews with ATS-optimized resume' },
]

export default function Landing() {
  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh' }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: '68px', boxShadow: 'var(--shadow-sm)',
      }}>
        <Logo />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started Free →</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        background: 'var(--gradient-hero)',
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden', paddingTop: '68px',
      }}>
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
        {/* Blobs */}
        <div style={{ position: 'absolute', top: '10%', right: '10%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(124,58,237,0.3)', filter: 'blur(100px)', animation: 'float 6s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '5%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(14,165,233,0.25)', filter: 'blur(80px)', animation: 'float 8s ease-in-out infinite reverse' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '60px 24px' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
            {/* Label */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '999px', padding: '6px 18px', fontSize: '0.8rem', fontWeight: 600, color: '#E0E7FF', marginBottom: '24px', letterSpacing: '0.05em' }}>
              ✨ Powered by TalentSync AI Engine
            </div>

            <h1 style={{ color: '#FFFFFF', marginBottom: '20px', textShadow: '0 2px 20px rgba(0,0,0,0.15)' }}>
              Beat the ATS.<br />
              <span style={{ background: 'linear-gradient(90deg, #A5B4FC, #67E8F9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Land the Interview.</span>
            </h1>

            <p style={{ fontSize: '1.15rem', color: '#C7D2FE', marginBottom: '36px', lineHeight: '1.7', maxWidth: '560px', margin: '0 auto 36px' }}>
              TalentSync AI gives your resume an ATS score and a full AI-powered report — with keyword gaps, rewrite suggestions, and career recommendations — in under 30 seconds.
            </p>

            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '48px' }}>
              <Link to="/register" className="btn btn-white btn-xl" style={{ color: 'var(--color-primary-dark)', fontWeight: 800 }}>
                Check My Resume Score →
              </Link>
              <Link to="/login" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)' }}>
                Sign In
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {stats.map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '14px 20px', textAlign: 'center', minWidth: '140px' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.75rem', color: '#E0E7FF' }}>{s.value}</div>
                  <div style={{ fontSize: '0.72rem', color: '#A5B4FC', lineHeight: '1.4' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 80" style={{ display: 'block', width: '100%' }}>
            <path fill="#FFFFFF" d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" />
          </svg>
        </div>
      </section>

      {/* ── Stats Banner ── */}
      <section style={{ background: '#fff', padding: '40px 0', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {['PDF ✓', 'DOCX ✓', 'DOC ✓', 'ODT ✓', 'TXT ✓', 'RTF ✓'].map(f => (
              <span key={f} style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-border-2)', borderRadius: '999px', padding: '6px 16px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)' }}>{f}</span>
            ))}
            <span style={{ color: 'var(--color-text-faint)', fontSize: '0.85rem', marginLeft: '8px' }}>All resume formats supported</span>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="section" style={{ background: 'var(--color-bg)' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '56px' }}>
            <div className="section-label">⚡ Simple 3-Step Process</div>
            <h2>How TalentSync AI Works</h2>
            <p className="text-muted mt-4" style={{ maxWidth: '500px', margin: '16px auto 0', fontSize: '1.05rem' }}>From upload to full AI report in under 30 seconds.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '28px' }}>
            {steps.map((step, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '32px 24px', background: '#fff', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${step.color}, ${i === 2 ? '#7C3AED' : step.color}99)` }} />
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: `${step.color}15`, border: `2px solid ${step.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.2rem', color: step.color }}>{step.num}</div>
                <h3 style={{ marginBottom: '10px', fontSize: '1.1rem' }}>{step.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '56px' }}>
            <div className="section-label">🚀 Everything You Need</div>
            <h2>Features Built for Job Seekers</h2>
            <p className="text-muted mt-4" style={{ maxWidth: '500px', margin: '16px auto 0', fontSize: '1.05rem' }}>Everything you need to optimize your resume and land more interviews.</p>
          </div>

          <div className="grid-3">
            {features.map((f, i) => (
              <div key={i} className="feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="feature-icon">{f.icon}</div>
                <h3 style={{ marginBottom: '10px', fontSize: '1.05rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: 'var(--gradient-hero)', padding: '80px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', filter: 'blur(60px)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ color: '#fff', marginBottom: '16px', fontSize: 'clamp(1.8rem,4vw,2.5rem)' }}>
            Ready to Get Hired Faster?
          </h2>
          <p style={{ color: '#C7D2FE', marginBottom: '36px', fontSize: '1.05rem', lineHeight: '1.7' }}>
            Join thousands of job seekers who use TalentSync AI to optimize their resumes and land more interviews.
          </p>
          <Link to="/register" className="btn btn-white btn-xl" style={{ color: 'var(--color-primary-dark)', fontWeight: 800 }}>
            Get Your Free ATS Score →
          </Link>
          <p style={{ color: '#A5B4FC', marginTop: '14px', fontSize: '0.8rem' }}>No credit card required · Free forever</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#fff', borderTop: '1px solid var(--color-border)', padding: '28px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
          <img src="/logo.png" alt="TalentSync AI" style={{ height: '24px' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-primary-dark)' }}>TalentSync AI</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-faint)' }}>© 2026 TalentSync AI. Beat the ATS. Land the Interview.</p>
      </footer>
    </div>
  )
}
