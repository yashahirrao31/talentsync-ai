import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { analyzeResume } from '../api/client'
import { useAuth } from '../context/AuthContext'

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'application/vnd.oasis.opendocument.text': ['.odt'],
  'text/plain': ['.txt'],
  'application/rtf': ['.rtf'],
}

const steps = ['Upload', 'Job Details', 'Analyzing']

function StepBar({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '40px' }}>
      {steps.map((label, i) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div className={`step-circle ${i < current ? 'step-done' : i === current ? 'step-active' : 'step-inactive'}`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: i <= current ? 'var(--color-primary)' : 'var(--color-text-faint)', whiteSpace: 'nowrap' }}>{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`step-line ${i < current ? 'step-line-done' : ''}`} style={{ margin: '0 8px', marginBottom: '22px' }} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function Analyze() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [file, setFile] = useState(null)
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressMsg, setProgressMsg] = useState('')
  const [error, setError] = useState('')

  const onDrop = useCallback(accepted => {
    if (accepted.length > 0) { setFile(accepted[0]); setError('') }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: ACCEPTED_TYPES, maxFiles: 1, maxSize: 10 * 1024 * 1024,
    onDropRejected: (files) => {
      const err = files[0]?.errors[0]
      setError(err?.code === 'file-too-large' ? 'File must be under 10MB' : 'Unsupported file type. Use PDF, DOCX, DOC, ODT, TXT, or RTF.')
    }
  })

  const handleAnalyze = async () => {
    if (!file) return
    setLoading(true); setStep(2); setError('')
    const messages = ['📄 Parsing your resume...', '🎯 Calculating ATS score...', '🤖 Generating AI report...', '✅ Almost done...']
    let msgIdx = 0
    setProgressMsg(messages[0])
    const msgInterval = setInterval(() => {
      msgIdx = Math.min(msgIdx + 1, messages.length - 1)
      setProgressMsg(messages[msgIdx])
    }, 4000)
    const progressInterval = setInterval(() => setProgress(p => Math.min(p + Math.random() * 12, 90)), 700)

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (jobDescription) formData.append('jobDescription', jobDescription)
      if (jobTitle) formData.append('jobTitle', jobTitle)
      const { data } = await analyzeResume(formData)
      clearInterval(progressInterval); clearInterval(msgInterval)
      setProgress(100); setProgressMsg('✅ Report ready!')
      setTimeout(() => navigate(`/report/${data.scanId}`), 600)
    } catch (err) {
      clearInterval(progressInterval); clearInterval(msgInterval)
      setError(err.response?.data?.message || 'Analysis failed. Please try again.')
      setStep(1); setLoading(false); setProgress(0)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingTop: '68px' }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <img src="/logo.png" alt="TalentSync AI" />
          TalentSync AI
        </div>
        <div className="navbar-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>← Dashboard</button>
          <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="container" style={{ maxWidth: '700px', padding: '40px 24px' }}>
        <StepBar current={step} />

        {/* Step 0: Upload */}
        {step === 0 && (
          <div className="animate-fade-in">
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ marginBottom: '6px' }}>Upload Your Resume</h2>
              <p style={{ color: 'var(--color-text-muted)' }}>Supported formats: PDF, DOCX, DOC, ODT, TXT, RTF · Max 10MB</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`} id="resume-dropzone" style={{ padding: '60px 24px' }}>
              <input {...getInputProps()} id="resume-file-input" />
              <span className="dropzone-icon">{file ? '✅' : isDragActive ? '📥' : '📄'}</span>
              {file ? (
                <>
                  <div className="dropzone-title" style={{ color: 'var(--color-success)' }}>{file.name}</div>
                  <div className="dropzone-subtitle">{(file.size / 1024).toFixed(0)} KB · Click to change file</div>
                </>
              ) : (
                <>
                  <div className="dropzone-title">{isDragActive ? 'Drop it here!' : 'Drag & drop your resume here'}</div>
                  <div className="dropzone-subtitle">or click to browse · PDF, DOCX, DOC, ODT, TXT, RTF</div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button id="upload-next-btn" className="btn btn-primary btn-lg" onClick={() => file && setStep(1)} disabled={!file}>
                Next: Job Details →
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Job Details */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ marginBottom: '6px' }}>Job Details</h2>
              <p style={{ color: 'var(--color-text-muted)' }}>Add the job description for hyper-accurate keyword matching and personalized recommendations.</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="card" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>📄</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{file?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)' }}>{file ? (file.size / 1024).toFixed(0) : 0} KB</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="job-title-input">Job Title <span style={{ color: 'var(--color-text-faint)', fontWeight: 400 }}>(optional)</span></label>
                  <input id="job-title-input" type="text" className="form-input" placeholder="e.g. Senior Software Engineer"
                    value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="job-description-input">
                    Job Description <span style={{ color: 'var(--color-primary)', fontWeight: 500, fontSize: '0.8rem' }}>✨ Recommended for best results</span>
                  </label>
                  <textarea id="job-description-input" className="form-input form-textarea"
                    style={{ minHeight: '180px' }}
                    placeholder="Paste the full job description here for accurate keyword matching..."
                    value={jobDescription} onChange={e => setJobDescription(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="alert alert-info">
              <span>💡</span>
              <span>Adding a job description increases keyword match accuracy by up to <strong>60%</strong> and enables personalized AI recommendations.</span>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', marginTop: '8px' }}>
              <button className="btn btn-outline" onClick={() => setStep(0)}>← Back</button>
              <button id="analyze-btn" className="btn btn-primary btn-lg" onClick={handleAnalyze}>
                ✦ Analyze Resume
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Analyzing */}
        {step === 2 && (
          <div className="animate-fade-in text-center" style={{ padding: '40px 0' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)', border: '1px solid var(--color-border-2)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }} className="animate-float">
              🤖
            </div>
            <h2 style={{ marginBottom: '8px' }}>Analyzing Your Resume</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>Gemini AI is generating your personalized ATS report...</p>

            <div style={{ maxWidth: '420px', margin: '0 auto' }}>
              <div className="progress-bar-track" style={{ height: '10px', marginBottom: '12px' }}>
                <div className="progress-bar-fill" style={{ width: `${progress}%`, transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                <span>{progressMsg}</span>
                <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{Math.round(progress)}%</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '32px', flexWrap: 'wrap' }}>
              {['🎯 ATS Score', '💡 AI Insights', '🔑 Keywords', '✏️ Rewrites'].map(item => (
                <div key={item} style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '8px 14px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }} className="animate-pulse">{item}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
