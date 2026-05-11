import { useState } from 'react'
import { ethers } from 'ethers'
import { SiweMessage } from 'siwe'

const API_URL = 'http://localhost:3000/api'
const TARGET_CHAIN_ID = '0x13882'

export default function LoginPage({ onLogin }) {
  const [walletAddress, setWalletAddress] = useState('')
  const [step, setStep] = useState('connect')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const shortAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ''

  async function checkAndSwitchNetwork(provider) {
    const network = await provider.getNetwork()
    const currentChainId = '0x' + network.chainId.toString(16)
    if (currentChainId === TARGET_CHAIN_ID) return true
    try {
      await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: TARGET_CHAIN_ID }] })
      return true
    } catch (err) {
      if (err.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: TARGET_CHAIN_ID,
              chainName: 'Polygon Amoy Testnet',
              nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
              rpcUrls: ['https://rpc-amoy.polygon.technology/'],
              blockExplorerUrls: ['https://amoy.polygonscan.com/']
            }]
          })
          return true
        } catch { return false }
      }
      return false
    }
  }

  async function connectWallet() {
    if (!window.ethereum) { setError('MetaMask is not installed.'); return }
    setLoading(true)
    setError('')
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      const ok = await checkAndSwitchNetwork(provider)
      if (!ok) { setError('Please switch to Polygon Amoy.'); return }
      setWalletAddress(accounts[0])
      setStep('sign')
    } catch {
      setError('Connection cancelled.')
    } finally {
      setLoading(false)
    }
  }

  async function signIn() {
    setLoading(true)
    setError('')
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const nonceRes = await fetch(`${API_URL}/auth/nonce`)
      if (!nonceRes.ok) throw new Error('Could not reach server')
      const nonce = await nonceRes.text()

      const message = new SiweMessage({
        domain: window.location.host,
        address: ethers.getAddress(walletAddress),
        statement: 'Sign in to DopaCoin.',
        uri: window.location.origin,
        version: '1',
        chainId: 80002,
        nonce,
      })

      const messageText = message.prepareMessage()
      const signature = await signer.signMessage(messageText)

      const verifyRes = await fetch(`${API_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: messageText, signature }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyRes.ok) throw new Error(verifyData.error || 'Verification failed')

      const profileRes = await fetch(`${API_URL}/auth/profile`, { credentials: 'include' })
      const profileData = await profileRes.json()
      onLogin({ walletAddress, profile: profileData.user })
    } catch (err) {
      setError(err.message || 'Sign in failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#181c26] border border-white/[0.07] rounded-2xl p-10 flex flex-col gap-5">

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4f8ef7] to-[#7c5cfc] flex items-center justify-center text-sm">🪙</div>
          <span className="font-mono font-bold text-lg text-[#e8eaf0]">DopaCoin</span>
        </div>

        <div className="mt-1">
          <h1 className="font-mono font-bold text-2xl text-[#e8eaf0] leading-snug">
            Earn from your<br />Bluesky activity
          </h1>
          <p className="text-sm text-[#6b7390] mt-2 leading-relaxed">
            Connect your wallet and Bluesky account to start earning DOPA tokens for every post, reply, and engagement.
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 bg-[#1e2336] border border-white/[0.07] rounded-xl px-5 py-4">
          <div className={`flex items-center gap-2.5 flex-1 ${walletAddress || step === 'connect' ? 'opacity-100' : 'opacity-40'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
              walletAddress ? 'bg-emerald-400/15 text-emerald-400 border border-emerald-400/30' : 'bg-white/5 text-[#6b7390] border border-white/10'
            }`}>
              {walletAddress ? '✓' : '1'}
            </div>
            <div>
              <div className="text-xs font-semibold text-[#e8eaf0]">Connect Wallet</div>
              <div className="text-[10px] font-mono text-[#6b7390] mt-0.5">{walletAddress ? shortAddress(walletAddress) : 'MetaMask on Amoy'}</div>
            </div>
          </div>

          <div className="w-6 h-px bg-white/[0.07] shrink-0" />

          <div className={`flex items-center gap-2.5 flex-1 ${step === 'sign' ? 'opacity-100' : 'opacity-40'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
              step === 'sign' ? 'bg-gradient-to-br from-[#4f8ef7] to-[#7c5cfc] text-white' : 'bg-white/5 text-[#6b7390] border border-white/10'
            }`}>
              2
            </div>
            <div>
              <div className="text-xs font-semibold text-[#e8eaf0]">Sign In</div>
              <div className="text-[10px] font-mono text-[#6b7390] mt-0.5">Verify ownership</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-400/10 border border-red-400/20 rounded-lg px-3.5 py-2.5 text-sm text-red-400">
            {error}
          </div>
        )}

        {step === 'connect' && (
          <button
            onClick={connectWallet}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#4f8ef7] to-[#7c5cfc] text-white font-mono font-bold text-sm disabled:opacity-50 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
          >
            {loading ? 'Connecting...' : '🦊 Connect MetaMask'}
          </button>
        )}

        {step === 'sign' && (
          <button
            onClick={signIn}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#4f8ef7] to-[#7c5cfc] text-white font-mono font-bold text-sm disabled:opacity-50 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
          >
            {loading ? 'Waiting for signature...' : '✍️ Sign In with Ethereum'}
          </button>
        )}

        <p className="text-[11px] font-mono text-[#6b7390] text-center">
          Polygon Amoy Testnet · SIWE Authentication
        </p>
      </div>
    </div>
  )
}
