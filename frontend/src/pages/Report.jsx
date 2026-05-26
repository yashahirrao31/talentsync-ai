import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getScan } from '../api/client'
import { useAuth } from '../context/AuthContext'

/* ─── Animated Score Ring ────────────────────────────────────────────────────── */
function ScoreRing({ score }) {
  const radius = 90
  const stroke = 12
  const norm = radius - stroke / 2
  const circ = 2 * Math.PI * norm
  const [offset, setOffset] = useState(circ)
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setOffset(circ - (score / 100) * circ), 300)
    let count = 0
    const counter = setInterval(() => {
      count += Math.ceil(score / 40)
      if (count >= score) { setDisplayed(score); clearInterval(counter) }
      else setDisplayed(count)
    }, 30)
    return () => { clearTimeout(timer); clearInterval(counter) }
  }, [score, circ])

  const color = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  const glow = score >= 70 ? '0 0 30px rgba(16,185,129,0.4)' : score >= 50 ? '0 0 30px rgba(245,158,11,0.4)' : '0 0 30px rgba(239,68,68,0.4)'

  return (
    <div style={{ position: 'relative', width: radius*2, height: radius*2, flexShrink: 0 }}>
      <svg width={radius*2} height={radius*2} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={radius} cy={radius} r={norm} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={radius} cy={radius} r={norm} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={`${circ} ${circ}`} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(${glow})` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 900, color, lineHeight: 1 }}>{displayed}</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>out of 100</div>
      </div>
    </div>
  )
}

/* ─── Category Bar ───────────────────────────────────────────────────────────── */
function CategoryBar({ name, score, maxScore, feedback }) {
  const pct = Math.round((score / maxScore) * 100)
  const color = pct >= 70 ? 'var(--color-success)' : pct >= 50 ? 'var(--color-warning)' : 'var(--color-danger)'
  const [width, setWidth] = useState(0)
  useEffect(() => { const t = setTimeout(() => setWidth(pct), 500); return () => clearTimeout(t) }, [pct])
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{name}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 700, color, fontFamily: 'var(--font-display)', fontSize: '0.95rem' }}>{score}/{maxScore}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-faint)', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', padding: '1px 6px' }}>{pct}%</span>
        </div>
      </div>
      <div style={{ height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${width}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: '999px', transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)', boxShadow: `0 0 8px ${color}66` }} />
      </div>
      {feedback && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: '1.4' }}>{feedback}</div>}
    </div>
  )
}

/* ─── Accordion ──────────────────────────────────────────────────────────────── */
function Accordion({ title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderRadius: '10px', border: '1px solid var(--color-border)', marginBottom: '8px', overflow: 'hidden' }}>
      <div onClick={() => setOpen(!open)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', cursor: 'pointer', background: open ? 'rgba(255,255,255,0.04)' : 'transparent', transition: 'background 0.2s' }}>
        <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{title}</span>
        <span style={{ transition: 'transform 0.25s', transform: open ? 'rotate(180deg)' : 'none', color: 'var(--color-text-muted)' }}>▾</span>
      </div>
      {open && <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)', fontSize: '0.875rem', lineHeight: '1.7', color: 'var(--color-text-muted)' }}>{children}</div>}
    </div>
  )
}

/* ─── Tip Card ───────────────────────────────────────────────────────────────── */
function TipCard({ icon, text, index }) {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '14px', borderRadius: '10px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', marginBottom: '10px' }}>
      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>{index + 1}</div>
      <span style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--color-text)' }}>{text}</span>
    </div>
  )
}

/* ─── Main Report Page ───────────────────────────────────────────────────────── */
export default function Report() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)
  const reportRef = useRef(null)

  useEffect(() => {
    getScan(id)
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load report. It may have been deleted.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDownloadPDF = () => {
    setDownloading(true)
    window.print()
    setTimeout(() => setDownloading(false), 1500)
  }

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', border: '3px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'var(--color-text-muted)' }}>Loading your report...</p>
    </div>
  )

  if (error) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', textAlign: 'center', padding: '24px' }}>
      <div style={{ fontSize: '3rem' }}>⚠️</div>
      <h3>{error}</h3>
      <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
    </div>
  )

  const report = data?.report || {}
  const breakdown = data?.scoreBreakdown || {}
  const score = data?.atsScore || 0
  const verdict = report?.verdict || (score >= 70 ? 'Strong' : score >= 50 ? 'Average' : 'Needs Work')
  const verdictEmoji = verdict === 'Strong' ? '🏆' : verdict === 'Average' ? '📈' : '⚠️'
  const verdictColor = verdict === 'Strong' ? 'var(--color-success)' : verdict === 'Average' ? 'var(--color-warning)' : 'var(--color-danger)'
  const recommendations = report?.recommendations || []
  const strengths = report?.strengths || []
  const weaknesses = report?.weaknesses || []
  const missingKeywords = report?.missingKeywords || []
  const rewriteSuggestions = report?.rewriteSuggestions || []
  const sectionFeedback = report?.sectionFeedback || {}

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .card { background: white !important; border: 1px solid #eee !important; box-shadow: none !important; }
          .print-header { display: block !important; }
        }
        @media screen { .print-header { display: none; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ minHeight: '100vh', paddingTop: '72px', paddingBottom: '60px' }} ref={reportRef}>
        {/* Navbar */}
        <nav className="navbar no-print">
          <div className="navbar-brand">
            <img src="/logo.png" alt="TalentSync AI" />
            TalentSync AI
          </div>
          <div className="navbar-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>← History</button>
            <button
              id="download-pdf-btn"
              className="btn btn-outline btn-sm"
              onClick={handleDownloadPDF}
              disabled={downloading}
              style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
            >
              {downloading ? '⏳ Preparing...' : '⬇ Download PDF'}
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/analyze')}>+ New Scan</button>
            <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
          </div>
        </nav>

        {/* Print Header */}
        <div className="print-header" style={{ padding: '20px', borderBottom: '2px solid #eee', marginBottom: '20px' }}>
          <h1 style={{ margin: 0 }}>✦ ResumeATS — Analysis Report</h1>
          <p style={{ margin: '4px 0 0', color: '#666' }}>{data?.resumeFilename} · {data?.jobTitle}</p>
        </div>

        <div className="container" style={{ maxWidth: '960px' }}>

          {/* ── HERO: Score + Verdict ── */}
          <div className="card animate-fade-in" style={{
            background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)',
            border: '1px solid var(--color-border-2)',
            marginBottom: '24px',
            padding: '36px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
              <ScoreRing score={score} />

              <div style={{ flex: 1, minWidth: '220px' }}>
                <div style={{ marginBottom: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `${verdictColor}22`, border: `1px solid ${verdictColor}66`, borderRadius: '999px', padding: '5px 16px', fontSize: '0.95rem', fontWeight: 700, color: verdictColor }}>
                    {verdictEmoji} {verdict} Resume
                  </span>
                  {score >= 80 && (
                    <span style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '999px', padding: '4px 12px', fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600 }}>
                      ✅ ATS Ready
                    </span>
                  )}
                </div>

                <h2 style={{ marginBottom: '6px', fontSize: '1.4rem', wordBreak: 'break-word' }}>{data?.resumeFilename}</h2>
                {data?.jobTitle && (
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                    🎯 Analyzed for: <strong style={{ color: 'var(--color-text)' }}>{data.jobTitle}</strong>
                  </p>
                )}
                {report?.overallTips && (
                  <p style={{ fontSize: '0.875rem', lineHeight: '1.7', borderLeft: '3px solid var(--color-primary)', paddingLeft: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                    {report.overallTips}
                  </p>
                )}
              </div>
            </div>

            {/* Quick stat pills */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '28px', flexWrap: 'wrap' }}>
              {[
                { label: 'Strengths', value: strengths.length, color: 'var(--color-success)' },
                { label: 'Improvements', value: weaknesses.length, color: 'var(--color-warning)' },
                { label: 'Missing Keywords', value: missingKeywords.length, color: 'var(--color-danger)' },
                { label: 'Recommendations', value: recommendations.length, color: 'var(--color-primary)' },
              ].map(stat => (
                <div key={stat.label} style={{ flex: 1, minWidth: '100px', textAlign: 'center', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── ROW: Score Breakdown + Strengths & Weaknesses ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>

            {/* Score Breakdown */}
            <div className="card animate-fade-in">
              <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📊</span> Score Breakdown
              </h3>
              {Object.entries(breakdown).map(([key, cat]) => (
                <CategoryBar key={key} name={cat.category} score={cat.score} maxScore={cat.maxScore} feedback={cat.feedback} />
              ))}
            </div>

            {/* Strengths & Weaknesses */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="card animate-fade-in" style={{ borderColor: 'rgba(16,185,129,0.25)', flex: 1 }}>
                <h3 style={{ marginBottom: '14px', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>✅</span> Strengths
                </h3>
                {strengths.length > 0 ? (
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {strengths.map((s, i) => (
                      <li key={i} style={{ fontSize: '0.875rem', display: 'flex', gap: '10px', alignItems: 'flex-start', lineHeight: '1.5' }}>
                        <span style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: '2px' }}>●</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p style={{ fontSize: '0.875rem', color: 'var(--color-text-faint)' }}>No strengths detected.</p>}
              </div>

              <div className="card animate-fade-in" style={{ borderColor: 'rgba(245,158,11,0.25)', flex: 1 }}>
                <h3 style={{ marginBottom: '14px', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>⚠️</span> Areas to Improve
                </h3>
                {weaknesses.length > 0 ? (
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {weaknesses.map((w, i) => (
                      <li key={i} style={{ fontSize: '0.875rem', display: 'flex', gap: '10px', alignItems: 'flex-start', lineHeight: '1.5' }}>
                        <span style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: '2px' }}>●</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p style={{ fontSize: '0.875rem', color: 'var(--color-text-faint)' }}>No major issues found.</p>}
              </div>
            </div>
          </div>

          {/* ── AI Recommendations ── */}
          {recommendations.length > 0 && (
            <div className="card animate-fade-in" style={{ marginBottom: '20px', borderColor: 'rgba(139,92,246,0.3)', background: 'linear-gradient(135deg, rgba(139,92,246,0.05), transparent)' }}>
              <h3 style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>💡</span> AI Recommendations
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 600 }}>Powered by Gemini AI</span>
              </h3>
              {recommendations.map((rec, i) => <TipCard key={i} icon="💡" text={rec} index={i} />)}
            </div>
          )}

          {/* ── Missing Keywords ── */}
          {missingKeywords.length > 0 && (
            <div className="card animate-fade-in" style={{ marginBottom: '20px', borderColor: 'rgba(239,68,68,0.2)' }}>
              <h3 style={{ marginBottom: '8px', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🔑</span> Missing Keywords
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-faint)', marginBottom: '14px' }}>Add these keywords from the job description to your resume:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {missingKeywords.map((kw, i) => (
                  <span key={i} style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: 'var(--color-danger)', borderRadius: '999px', padding: '4px 14px', fontSize: '0.8rem', fontWeight: 500 }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Section Feedback ── */}
          {Object.keys(sectionFeedback).length > 0 && (
            <div className="card animate-fade-in" style={{ marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📝</span> Section-by-Section Feedback
              </h3>
              {Object.entries(sectionFeedback).map(([section, feedback]) => (
                <Accordion key={section} title={`${section}`}>{feedback}</Accordion>
              ))}
            </div>
          )}

          {/* ── Rewrite Suggestions ── */}
          {rewriteSuggestions.length > 0 && (
            <div className="card animate-fade-in" style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✏️</span> Rewrite Suggestions
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-faint)', marginBottom: '18px' }}>
                Copy-paste these improved bullet points directly into your resume:
              </p>
              {rewriteSuggestions.map((sug, i) => (
                <div key={i} style={{ marginBottom: '20px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                  <div style={{ background: 'rgba(239,68,68,0.08)', padding: '10px 14px', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-danger)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>❌ Before</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>{sug.original}</div>
                  </div>
                  <div style={{ background: 'rgba(16,185,129,0.08)', padding: '10px 14px' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-success)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>✅ After</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text)', lineHeight: '1.5', fontWeight: 500 }}>{sug.suggested}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Action Buttons ── */}
          <div className="no-print" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', paddingTop: '8px' }}>
            <button
              className="btn btn-primary btn-lg"
              style={{ minWidth: '200px' }}
              onClick={handleDownloadPDF}
              disabled={downloading}
            >
              {downloading ? '⏳ Preparing PDF...' : '⬇ Download Full Report'}
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => navigate('/analyze')}>
              ✦ Analyze Another Resume
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => navigate('/dashboard')}>
              View History
            </button>
          </div>

        </div>
      </div>
    </>
  )
}
