import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHistory, getAdminDashboard } from '../api/client'
import { useAuth } from '../context/AuthContext'

const scoreColor = (s) => s >= 70 ? 'var(--color-success)' : s >= 50 ? 'var(--color-warning)' : 'var(--color-danger)'
const scoreLabel = (s) => s >= 70 ? 'Strong' : s >= 50 ? 'Average' : 'Needs Work'
const scoreBadgeClass = (s) => s >= 70 ? 'badge-success' : s >= 50 ? 'badge-warning' : 'badge-danger'

function ScoreMini({ score }) {
  const color = scoreColor(score)
  const r = 22, stroke = 4, circ = 2 * Math.PI * (r - stroke / 2)
  const offset = circ - (score / 100) * circ
  return (
    <div style={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
      <svg width={48} height={48} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={24} cy={24} r={r - stroke / 2} fill="none" stroke="var(--color-border)" strokeWidth={stroke} />
        <circle cx={24} cy={24} r={r - stroke / 2} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${circ} ${circ}`} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.75rem', color }}>{score}</div>
    </div>
  )
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    getHistory().then(r => setScans(r.data || [])).catch(() => setScans([])).finally(() => setLoading(false))
    // Silently check admin access — backend controls this via ADMIN_EMAIL in .env
    getAdminDashboard().then(() => setIsAdmin(true)).catch(() => setIsAdmin(false))
  }, [])

  const avgScore = scans.length ? Math.round(scans.reduce((a, s) => a + s.atsScore, 0) / scans.length) : 0
  const bestScore = scans.length ? Math.max(...scans.map(s => s.atsScore)) : 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingTop: '68px' }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <img src="/logo.png" alt="TalentSync AI" />
          TalentSync AI
        </div>
        <div className="navbar-actions">
          {isAdmin && (
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin')} style={{ fontSize: '0.8rem' }}>⚙️ Admin</button>
          )}
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/analyze')}>+ New Scan</button>
          <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="container" style={{ maxWidth: '900px', padding: '32px 24px' }}>

        {/* Greeting */}
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.75rem' }}>👋 Welcome back, {user?.name?.split(' ')[0]}!</h2>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>Track your resume scans and see your ATS progress.</p>
        </div>

        {/* Stats Row */}
        {scans.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', marginBottom: '28px' }}>
            {[
              { label: 'Total Scans', value: scans.length, color: 'var(--color-primary)' },
              { label: 'Avg ATS Score', value: `${avgScore}%`, color: scoreColor(avgScore) },
              { label: 'Best Score', value: `${bestScore}%`, color: scoreColor(bestScore) },
            ].map(stat => (
              <div key={stat.label} className="stat-pill" style={{ border: '1px solid var(--color-border)' }}>
                <div className="stat-pill-value" style={{ color: stat.color }}>{stat.value}</div>
                <div className="stat-pill-label">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Scan History */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3>📋 Scan History</h3>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/analyze')}>+ Analyze New Resume</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div className="spinner spinner-dark spinner-lg" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--color-text-muted)' }}>Loading your scans...</p>
          </div>
        ) : scans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 'var(--radius-xl)', border: '2px dashed var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📄</div>
            <h3 style={{ marginBottom: '8px', color: 'var(--color-text)' }}>No scans yet</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>Upload your resume and get your first ATS score!</p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/analyze')}>
              ✦ Analyze My Resume
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {scans.map((scan, i) => (
              <div key={scan.id} className="history-card animate-fade-in" style={{ animationDelay: `${i * 0.06}s` }}
                onClick={() => navigate(`/report/${scan.id}`)}>
                <ScoreMini score={scan.atsScore} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {scan.resumeFilename || 'Resume'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {scan.jobTitle ? `🎯 ${scan.jobTitle} · ` : ''}{new Date(scan.scannedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <span className={`badge ${scoreBadgeClass(scan.atsScore)}`}>{scoreLabel(scan.atsScore)}</span>
                <span style={{ color: 'var(--color-text-faint)', fontSize: '1.2rem' }}>→</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
