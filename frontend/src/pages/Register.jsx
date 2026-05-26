import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { register } from '../api/client'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { saveToken } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      const res = await register({ name, email, password })
      // res.data = { token, email, name, plan }
      saveToken(res.data.token, { name: res.data.name, email: res.data.email, plan: res.data.plan })
      navigate('/dashboard')
    } catch (err) {
      setError(err.userMessage || err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card animate-scale">
        {/* Logo */}
        <div className="auth-logo">
          <img src="/logo.png" alt="TalentSync AI" />
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--color-primary-dark)' }}>TalentSync AI</div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>Create your free account to get started</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input
              id="register-name"
              type="text"
              className="form-input"
              placeholder="Yash Ahirrao"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              id="register-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="register-password"
              type="password"
              className="form-input"
              placeholder="At least 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            id="register-submit"
            type="submit"
            className="btn btn-primary w-full"
            style={{ marginTop: '6px', padding: '14px', fontSize: '1rem', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? <><span className="spinner" /> Creating account...</> : 'Create Free Account →'}
          </button>
        </form>

        <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1rem' }}>🔒</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>Your data is secure. We never share your resume with third parties.</span>
        </div>

        <div className="auth-divider" style={{ marginTop: '16px' }}>already have an account?</div>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>← Sign in instead</Link>
        </p>
      </div>
    </div>
  )
}
