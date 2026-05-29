import { useState } from 'react'
import { API_URL } from '../apiBase'

export default function SettingsModal({ user, onClose, bskyHandle, setBskyHandle, onPhoneVerified }) {

  const [phoneStep, setPhoneStep] = useState(null)
  const [phoneInput, setPhoneInput] = useState('')
  const [codeInput, setCodeInput]   = useState('')
  const [phoneLoading, setPhoneLoading] = useState(false)
  const [phoneError, setPhoneError]     = useState('')
  const [phoneDisplay, setPhoneDisplay] = useState(user.phoneNumber || null)

  const shortAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ''
  const shortPhone   = (num)  => num  ? `${num.slice(0, 5)}·····${num.slice(-2)}` : null

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose()
  }

  function handleConnectBsky() {
    const width = 500, height = 700;
    const left  = window.screenX + (window.outerWidth  - width)  / 2;
    const top   = window.screenY + (window.outerHeight - height) / 2;

    fetch(`${API_URL}/auth/bsky/init`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (!data.url) return;
        window.open(data.url, 'Bluesky Auth',
          `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`);

        const poll = setInterval(() => {
          fetch(`${API_URL}/auth/bsky/status`, { credentials: 'include' })
            .then(r => r.json())
            .then(d => {
              if (d.linked) {
                clearInterval(poll);
                fetch(`${API_URL}/auth/profile`, { credentials: 'include' })
                  .then(r => r.json())
                  .then(d => setBskyHandle(d.user.bskyHandle));
              }
            });
        }, 1000);
        setTimeout(() => clearInterval(poll), 120_000);
      })
      .catch(() => alert('Failed to start Bluesky login'));
  }

  function startPhoneChange() {
    setPhoneInput('')
    setCodeInput('')
    setPhoneError('')
    setPhoneStep('enter_phone')
  }

  function cancelPhoneChange() {
    setPhoneStep(null)
    setPhoneError('')
  }

  async function handleSendCode(e) {
    e.preventDefault()
    if (!phoneInput || phoneInput.length < 8) {
      setPhoneError('Please enter a valid phone number with country code.')
      return
    }
    setPhoneError('')
    setPhoneLoading(true)
    try {
      const res  = await fetch(`${API_URL}/settings/send-phone-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone: phoneInput }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send SMS.')
      setPhoneStep('enter_code')
    } catch (err) {
      setPhoneError(err.message || 'Failed to send SMS.')
    } finally {
      setPhoneLoading(false)
    }
  }

  async function handleVerifyCode(e) {
    e.preventDefault()
    if (codeInput.length !== 6) { setPhoneError('Enter the 6-digit code.'); return }
    setPhoneError('')
    setPhoneLoading(true)
    try {
      const res  = await fetch(`${API_URL}/settings/verify-phone-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone: phoneInput, code: codeInput }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Invalid code.')

      setPhoneDisplay(phoneInput)
      setPhoneStep('success')
      if (onPhoneVerified) onPhoneVerified(phoneInput)
      setTimeout(() => setPhoneStep(null), 2000)
    } catch (err) {
      setPhoneError(err.message || 'Invalid code. Please try again.')
    } finally {
      setPhoneLoading(false)
    }
  }

  const inputCls =
    'w-full px-3 py-2 rounded-lg bg-[#0f1117] border border-white/[0.07] text-[#e8eaf0] text-[13px] outline-none focus:border-[#4f8ef7]/50 transition-colors placeholder:text-[#3d4560]'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={handleBackdrop}>
      <div className="w-full max-w-sm bg-[#181c26] border border-white/[0.07] rounded-2xl overflow-hidden">

        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <span className="font-mono font-bold text-[15px]">Settings</span>
          <button onClick={onClose} className="w-7 h-7 rounded-md bg-[#1e2336] border border-white/[0.07] text-[#6b7390] text-xs flex items-center justify-center hover:text-[#e8eaf0] transition-colors cursor-pointer">✕</button>
        </div>

        <div className="px-5 py-4 border-b border-white/[0.07] flex flex-col gap-3">
          <div className="text-[10px] uppercase tracking-widest text-[#6b7390] font-mono">Connected Accounts</div>

          <div className="flex items-center justify-between text-[13px]">
            <span className="text-[#6b7390]">🦊 Wallet</span>
            <span className="font-mono text-xs text-[#4f8ef7]">{shortAddress(user.address)}</span>
          </div>

          <div className="flex items-center justify-between text-[13px]">
            <span className="text-[#6b7390]">🦋 Bluesky</span>
            {bskyHandle ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#7ec8e3]">{bskyHandle}</span>
                <button onClick={handleConnectBsky} className="px-2 py-0.5 rounded-md bg-[#7ec8e3]/10 border border-[#7ec8e3]/30 text-[#7ec8e3] text-[10px] font-mono font-bold hover:bg-[#7ec8e3]/20 transition-colors cursor-pointer">Change</button>
              </div>
            ) : (
              <button onClick={handleConnectBsky} className="px-3 py-1 rounded-md bg-[#7ec8e3]/10 border border-[#7ec8e3]/30 text-[#7ec8e3] text-[11px] font-mono font-bold hover:bg-[#7ec8e3]/20 transition-colors cursor-pointer">Connect</button>
            )}
          </div>
        </div>

        <div className="px-5 py-4 border-b border-white/[0.07] flex flex-col gap-3">
          <div className="text-[10px] uppercase tracking-widest text-[#6b7390] font-mono">Security</div>

          <div className="flex items-center justify-between text-[13px]">
            <span className="text-[#6b7390]">📱 Phone Verification</span>

            {phoneStep === null && (
              phoneDisplay ? (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-emerald-400">{shortPhone(phoneDisplay)}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">✓</span>
                  <button
                    onClick={startPhoneChange}
                    className="px-2 py-0.5 rounded-md bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 text-[10px] font-mono font-bold hover:bg-emerald-400/20 transition-colors cursor-pointer"
                  >Change</button>
                </div>
              ) : (
                <button
                  onClick={startPhoneChange}
                  className="px-3 py-1 rounded-md bg-[#4f8ef7]/10 border border-[#4f8ef7]/30 text-[#4f8ef7] text-[11px] font-mono font-bold hover:bg-[#4f8ef7]/20 transition-colors cursor-pointer"
                >Verify</button>
              )
            )}

            {phoneStep === 'success' && (
              <span className="text-[11px] font-mono text-emerald-400 font-bold">✓ Verified!</span>
            )}
          </div>

          {phoneStep === 'enter_phone' && (
            <form onSubmit={handleSendCode} className="flex flex-col gap-2 mt-1">
              <div className="text-[11px] text-[#6b7390]">Enter your new number with country code (e.g. +972…)</div>
              <input
                className={inputCls}
                type="tel"
                placeholder="+972 50 000 0000"
                value={phoneInput}
                onChange={e => setPhoneInput(e.target.value)}
                autoFocus
              />
              {phoneError && <div className="text-[11px] text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-1.5">{phoneError}</div>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={cancelPhoneChange}
                  className="flex-1 py-2 rounded-lg bg-[#1e2336] border border-white/[0.07] text-[#6b7390] text-[12px] font-mono hover:text-[#e8eaf0] transition-colors cursor-pointer"
                >Cancel</button>
                <button
                  type="submit"
                  disabled={phoneLoading}
                  className="flex-1 py-2 rounded-lg bg-[#4f8ef7]/15 border border-[#4f8ef7]/30 text-[#4f8ef7] text-[12px] font-mono font-bold hover:bg-[#4f8ef7]/25 transition-colors cursor-pointer disabled:opacity-50"
                >{phoneLoading ? 'Sending…' : 'Send Code'}</button>
              </div>
            </form>
          )}

          {phoneStep === 'enter_code' && (
            <form onSubmit={handleVerifyCode} className="flex flex-col gap-2 mt-1">
              <div className="text-[11px] text-[#6b7390]">Enter the 6-digit code sent to <span className="text-[#e8eaf0] font-mono">{phoneInput}</span></div>
              <input
                className={`${inputCls} font-mono text-xl tracking-[10px] text-center`}
                type="text"
                placeholder="000000"
                maxLength={6}
                value={codeInput}
                onChange={e => setCodeInput(e.target.value.replace(/\D/g, ''))}
                autoFocus
              />
              {phoneError && <div className="text-[11px] text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-1.5">{phoneError}</div>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setPhoneStep('enter_phone'); setPhoneError('') }}
                  className="flex-1 py-2 rounded-lg bg-[#1e2336] border border-white/[0.07] text-[#6b7390] text-[12px] font-mono hover:text-[#e8eaf0] transition-colors cursor-pointer"
                >Back</button>
                <button
                  type="submit"
                  disabled={phoneLoading}
                  className="flex-1 py-2 rounded-lg bg-emerald-400/15 border border-emerald-400/30 text-emerald-400 text-[12px] font-mono font-bold hover:bg-emerald-400/25 transition-colors cursor-pointer disabled:opacity-50"
                >{phoneLoading ? 'Verifying…' : 'Verify'}</button>
              </div>
            </form>
          )}
        </div>

        <div className="px-5 py-4">
          <button onClick={onClose} className="w-full py-2.5 rounded-lg bg-[#1e2336] border border-white/[0.07] text-[#6b7390] text-[13px] font-mono hover:text-[#e8eaf0] transition-colors cursor-pointer">Close</button>
        </div>

      </div>
    </div>
  )
}
