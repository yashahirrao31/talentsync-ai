import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminDashboard } from '../api/client'
import { useAuth } from '../context/AuthContext'

/* ─── Mini Bar Chart (pure SVG/CSS, no library needed) ──────────────────────── */
function BarChart({ data }) {
  const max = Math.max(...Object.values(data), 1)
  const colors = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6']
  const entries = Object.entries(data)

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '160px', padding: '0 8px' }}>
      {entries.map(([label, count], i) => {
        const pct = max === 0 ? 0 : (count / max) * 100
        return (
          <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: colors[i] }}>{count}</span>
            <div style={{ width: '100%', borderRadius: '6px 6px 0 0', background: colors[i], height: `${Math.max(pct, 4)}%`, minHeight: '4px', transition: 'height 1s ease', opacity: 0.85 }} />
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-faint)', textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Donut Chart ────────────────────────────────────────────────────────────── */
function DonutStat({ value, label, color, icon }) {
  return (
    <div style={{ textAlign: 'center', padding: '20px 12px', background: '#fff', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', flex: 1, minWidth: '120px' }}>
      <div style={{ fontSize: '1.75rem', marginBottom: '4px' }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-faint)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  )
}

/* ─── Score Badge ────────────────────────────────────────────────────────────── */
function ScoreBadge({ score }) {
  const color = score >= 80 ? '#059669' : score >= 60 ? '#D97706' : '#DC2626'
  const bg    = score >= 80 ? '#ECFDF5' : score >= 60 ? '#FFFBEB' : '#FEF2F2'
  const border= score >= 80 ? '#A7F3D0' : score >= 60 ? '#FDE68A' : '#FECACA'
  return (
    <span style={{ background: bg, color, border: `1px solid ${border}`, borderRadius: '999px', padding: '3px 12px', fontSize: '0.78rem', fontWeight: 700 }}>
      {score}
    </span>
  )
}

/* ─── Main Admin Page ────────────────────────────────────────────────────────── */
export default function Admin() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    getAdminDashboard()
      .then(r => setData(r.data))
      .catch(err => {
        if (err.response?.status === 403) setError('Access denied. You are not an admin.')
        else setError('Failed to load admin dashboard.')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', background: 'var(--color-bg)' }}>
      <div style={{ width: '48px', height: '48px', border: '3px solid var(--color-border-2)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'var(--color-text-muted)' }}>Loading admin dashboard...</p>
    </div>
  )

  if (error) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '24px', background: 'var(--color-bg)' }}>
      <div style={{ fontSize: '3.5rem' }}>🚫</div>
      <h2 style={{ color: 'var(--color-danger)' }}>{error}</h2>
      <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
    </div>
  )

  const tabs = [
    { id: 'overview',  label: '📊 Overview' },
    { id: 'users',     label: '👥 Users' },
    { id: 'scans',     label: '📋 Recent Scans' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingTop: '68px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <img src="/logo.png" alt="TalentSync AI" />
          TalentSync AI
          <span style={{ background: 'var(--gradient-primary)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 10px', borderRadius: '999px', marginLeft: '4px', letterSpacing: '0.06em' }}>ADMIN</span>
        </div>
        <div className="navbar-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>← Dashboard</button>
          <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="container" style={{ maxWidth: '1100px', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ marginBottom: '4px' }}>⚙️ Admin Panel</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Monitor users, scans, and platform analytics for TalentSync AI</p>
        </div>

        {/* ── Summary Cards ── */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
          <DonutStat icon="👥" value={data.totalUsers}   label="Total Users"   color="var(--color-primary)" />
          <DonutStat icon="📄" value={data.totalScans}   label="Total Scans"   color="var(--color-secondary)" />
          <DonutStat icon="⭐" value={`${data.averageScore}`} label="Avg Score" color="var(--color-warning)" />
          <DonutStat icon="🏆" value={data.highScorers}  label="High Scorers (80+)" color="var(--color-success)" />
          <DonutStat icon="🆕" value={data.todaySignups} label="Today's Signups" color="#0EA5E9" />
          <DonutStat icon="🔍" value={data.todayScans}   label="Today's Scans"  color="#8B5CF6" />
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'var(--color-surface-3)', borderRadius: '12px', padding: '4px', width: 'fit-content' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
                background: activeTab === tab.id ? '#fff' : 'transparent',
                color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>

            {/* Score Distribution Chart */}
            <div className="card" style={{ gridColumn: 'span 1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1rem' }}>📊 Score Distribution</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)' }}>{data.totalScans} total scans</span>
              </div>
              {data.totalScans === 0
                ? <p style={{ textAlign: 'center', color: 'var(--color-text-faint)', padding: '40px 0' }}>No scans yet</p>
                : <BarChart data={data.scoreDistribution} />
              }
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '14px' }}>
                {[['0–40','#EF4444','Poor'], ['40–60','#F97316','Weak'], ['60–70','#EAB308','Average'], ['70–80','#22C55E','Good'], ['80–90','#3B82F6','Strong'], ['90–100','#8B5CF6','Excellent']].map(([range, color, label]) => (
                  <span key={range} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: color, display: 'inline-block' }} />
                    {range} {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card">
              <h3 style={{ fontSize: '1rem', marginBottom: '20px' }}>📈 Platform Stats</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { label: 'High Scorers (≥80)', value: data.highScorers, total: data.totalScans, color: '#059669' },
                  { label: 'Above Average (≥70)', value: Object.entries(data.scoreDistribution).filter(([k]) => !['0–40','40–60','60–70'].includes(k)).reduce((s,[,v]) => s+v, 0), total: data.totalScans, color: '#3B82F6' },
                  { label: 'Needs Work (<60)', value: (data.scoreDistribution['0–40'] || 0) + (data.scoreDistribution['40–60'] || 0), total: data.totalScans, color: '#EF4444' },
                ].map(stat => {
                  const pct = stat.total === 0 ? 0 : Math.round((stat.value / stat.total) * 100)
                  return (
                    <div key={stat.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '5px' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>{stat.label}</span>
                        <span style={{ fontWeight: 700, color: stat.color }}>{stat.value} <span style={{ color: 'var(--color-text-faint)', fontWeight: 400 }}>({pct}%)</span></span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--color-bg-alt)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: stat.color, borderRadius: '999px', transition: 'width 1s ease' }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="divider" />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: "Today's Signups", value: data.todaySignups, color: '#4338CA' },
                  { label: "Today's Scans", value: data.todayScans, color: '#7C3AED' },
                  { label: 'Avg Scans/User', value: data.totalUsers > 0 ? (data.totalScans / data.totalUsers).toFixed(1) : 0, color: '#0EA5E9' },
                  { label: 'High Score Rate', value: `${data.totalScans > 0 ? Math.round((data.highScorers / data.totalScans) * 100) : 0}%`, color: '#059669' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'var(--color-bg)', borderRadius: '10px', padding: '12px', textAlign: 'center', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-faint)', marginTop: '2px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === 'users' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem' }}>👥 Registered Users</h3>
              <span className="badge badge-primary">{data.users.length} users</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--color-bg)', borderBottom: '2px solid var(--color-border)' }}>
                    {['#', 'Name', 'Email', 'Signed Up', 'Scans', 'Best Score', 'Last Active'].map(h => (
                      <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.users.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-faint)' }}>No users yet</td></tr>
                  ) : data.users.map((u, i) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                      <td style={{ padding: '12px 16px', color: 'var(--color-text-faint)', fontWeight: 500 }}>{i + 1}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                            {u.name?.charAt(0)?.toUpperCase()}
                          </div>
                          {u.name}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>{u.email}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{u.createdAt}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-border-2)', color: 'var(--color-primary)', borderRadius: '999px', padding: '2px 12px', fontWeight: 700, fontSize: '0.8rem' }}>{u.scanCount}</span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {u.scanCount > 0 ? <ScoreBadge score={u.bestScore} /> : <span style={{ color: 'var(--color-text-faint)' }}>—</span>}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{u.lastActive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── RECENT SCANS TAB ── */}
        {activeTab === 'scans' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem' }}>📋 Recent Scans</h3>
              <span className="badge badge-primary">Latest {data.recentScans.length}</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--color-bg)', borderBottom: '2px solid var(--color-border)' }}>
                    {['User', 'Resume File', 'Job Title', 'Score', 'Date'].map(h => (
                      <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.recentScans.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-faint)' }}>No scans yet</td></tr>
                  ) : data.recentScans.map((s, i) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.userName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)' }}>{s.userEmail}</div>
                      </td>
                      <td style={{ padding: '12px 16px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-text-muted)' }}>
                        📄 {s.resumeFilename}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>{s.jobTitle}</td>
                      <td style={{ padding: '12px 16px' }}><ScoreBadge score={s.atsScore} /></td>
                      <td style={{ padding: '12px 16px', color: 'var(--color-text-faint)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{s.scannedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
