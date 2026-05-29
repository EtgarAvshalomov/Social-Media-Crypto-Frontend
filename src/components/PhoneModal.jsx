import { useState } from 'react'
import { API_URL } from '../apiBase'

export default function PhoneModal({ onVerified, onClose }) {
  const [step, setStep] = useState('enter_phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose()
  }

  async function handleSendCode(e) {
    e.preventDefault()
    if (!phone || phone.length < 8) { setError('Please enter a valid phone number.'); return }
    setError('')
    setLoading(true)
    
    try {
      const response = await fetch(`${API_URL}/settings/send-phone-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', 
        body: JSON.stringify({ phone }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send SMS.')
      }

      setStep('enter_code')
    } catch (err) {
      setError(err.message || 'Failed to send SMS. Try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyCode(e) {
    e.preventDefault()
    if (code.length !== 6) { setError('Enter the 6-digit code.'); return }
    setError('')
    setLoading(true)
    
    try {
      const response = await fetch(`${API_URL}/settings/verify-phone-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', 
        body: JSON.stringify({ phone, code }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid code.')
      }

      setStep('verified')
      setTimeout(() => onVerified(), 1200)
    } catch (err) {
      setError(err.message || 'Invalid code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-lg bg-[#1e2336] border border-white/[0.07] text-[#e8eaf0] text-sm outline-none focus:border-[#4f8ef7]/50 transition-colors placeholder:text-[#6b7390]"

  return (
    <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-6" onClick={handleBackdrop}>
      <div className="w-full max-w-sm bg-[#181c26] border border-white/[0.07] rounded-2xl overflow-hidden">

        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <span className="font-mono font-bold text-[15px]">Phone Verification</span>
          <button onClick={onClose} className="w-7 h-7 rounded-md bg-[#1e2336] border border-white/[0.07] text-[#6b7390] text-xs flex items-center justify-center hover:text-[#e8eaf0] transition-colors cursor-pointer">✕</button>
        </div>

        <div className="px-5 py-6 flex flex-col gap-4">

          {step === 'enter_phone' && (
            <>
              <div className="text-3xl text-center">📱</div>
              <p className="text-sm text-[#6b7390] text-center leading-relaxed">
                To send funds to your wallet, we need to verify your phone number. We'll send you a 6-digit code via SMS.
              </p>
              <form onSubmit={handleSendCode} className="flex flex-col gap-3 mt-1">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6b7390] font-mono block mb-1.5">Phone Number</label>
                  <input
                    className={inputClass}
                    type="tel"
                    placeholder="+1 555 000 0000"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    autoFocus
                  />
                </div>
                {error && <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</div>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#4f8ef7] to-[#7c5cfc] text-white font-mono font-bold text-sm mt-1 disabled:opacity-50 hover:opacity-90 transition-opacity cursor-pointer"
                >
                  {loading ? 'Sending...' : 'Send Code'}
                </button>
              </form>
            </>
          )}

          {step === 'enter_code' && (
            <>
              <div className="text-3xl text-center">💬</div>
              <p className="text-sm text-[#6b7390] text-center leading-relaxed">
                We sent a 6-digit code to <span className="text-[#e8eaf0] font-mono">{phone}</span>. Enter it below.
              </p>
              <form onSubmit={handleVerifyCode} className="flex flex-col gap-3 mt-1">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6b7390] font-mono block mb-1.5">Verification Code</label>
                  <input
                    className={`${inputClass} font-mono text-2xl tracking-[12px] text-center`}
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                    autoFocus
                  />
                </div>
                {error && <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</div>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#4f8ef7] to-[#7c5cfc] text-white font-mono font-bold text-sm mt-1 disabled:opacity-50 hover:opacity-90 transition-opacity cursor-pointer"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('enter_phone'); setError('') }}
                  className="text-xs text-[#6b7390] hover:text-[#e8eaf0] transition-colors text-center cursor-pointer bg-transparent border-none"
                >
                  Use a different number
                </button>
              </form>
            </>
          )}

          {step === 'verified' && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-emerald-400 text-xl flex items-center justify-center">✓</div>
              <div className="font-mono font-bold text-base text-emerald-400">Phone verified!</div>
              <div className="text-xs text-[#6b7390]">Sending funds to your wallet...</div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
