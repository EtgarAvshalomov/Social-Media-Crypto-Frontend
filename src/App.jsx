import React, { useState } from 'react';
import { ethers } from 'ethers';
import { SiweMessage } from 'siwe';

const API_URL = 'http://localhost:3000/api';
const TARGET_CHAIN_ID = '0xaa36a7'; // Sepolia

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- HELPERS ---
  const formatAddress = (addr) => addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : '';

  const checkAndSwitchNetwork = async (provider) => {
    const network = await provider.getNetwork();
    const currentChainId = "0x" + network.chainId.toString(16);

    if (currentChainId !== TARGET_CHAIN_ID) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: TARGET_CHAIN_ID }],
        });
        return true;
      } catch (err) {
        if (err.code === 4902) {
            alert('Please add Sepolia Testnet to MetaMask!');
        } else {
            console.error("Network switch error:", err);
        }
        return false;
      }
    }
    return true;
  };

  // --- LOGIC ---
  const connectWallet = async () => {
    if (!window.ethereum) return alert('Please install MetaMask');
    setIsLoading(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const isCorrectNetwork = await checkAndSwitchNetwork(provider);
      
      if (isCorrectNetwork) setWalletAddress(accounts[0]);
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // REPLACE YOUR signIn FUNCTION IN App.jsx

  const signIn = async () => {
    if (!walletAddress) return;
    setIsLoading(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // STEP 1: Get Nonce
      const nonceRes = await fetch(`${API_URL}/auth/nonce`);
      if (!nonceRes.ok) throw new Error("Could not fetch nonce from server");
      const nonce = await nonceRes.text();

      // STEP 2: Create Message (THE FIX IS HERE)
      // We use ethers.getAddress() to force the EIP-55 Checksum format
      const message = new SiweMessage({
        domain: window.location.host,
        address: ethers.getAddress(walletAddress), // <--- FIX: Forces Mixed Case (EIP-55)
        statement: 'Sign in to the SocialFi Crypto Hub.',
        uri: window.location.origin,
        version: '1',
        chainId: 11155111,
        nonce: nonce,
      });

      const messageText = message.prepareMessage();
      
      // STEP 3: Sign
      const signature = await signer.signMessage(messageText);

      // STEP 4: Verify
      const verifyRes = await fetch(`${API_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: messageText, signature }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.error || 'Verification failed');

      setIsAuthenticated(true);
      fetchUserProfile();

    } catch (error) {
      console.error('LOGIN ERROR:', error);
      alert(`Login Failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'GET',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data.user);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] font-sans text-white p-4">
      
      {/* GLASS CARD */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8 text-center">
        
        {/* Header */}
        <div className="mb-8">
          <div className="text-5xl mb-3 animate-pulse">🚀</div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00C9FF] to-[#92FE9D]">
            Crypto Social Hub
          </h1>
        </div>

        {/* STATUS BAR */}
        <div className="flex justify-between items-center bg-black/30 p-3 rounded-xl mb-8 text-sm font-medium">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${walletAddress ? 'bg-[#00ff88] shadow-[0_0_10px_#00ff88]' : 'bg-red-500'}`}></span>
            {walletAddress ? 'Sepolia Connected' : 'Disconnected'}
          </div>
          {walletAddress && (
            <div className="bg-white/10 px-2 py-1 rounded font-mono tracking-wide text-xs">
              {formatAddress(walletAddress)}
            </div>
          )}
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex flex-col gap-4">
          
          {/* STATE 1: NOT CONNECTED */}
          {!walletAddress && (
            <button 
              onClick={connectWallet} 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#4776E6] to-[#8E54E9] text-white font-semibold py-3.5 px-4 rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
            >
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}

          {/* STATE 2: CONNECTED BUT NOT LOGGED IN */}
          {walletAddress && !isAuthenticated && (
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
              <p className="text-gray-400 text-sm mb-4">Wallet connected! Please sign in to verify ownership.</p>
              <button 
                onClick={signIn} 
                disabled={isLoading}
                className="w-full bg-[#00ff88] text-[#0f0c29] font-bold py-3.5 px-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading ? 'Signing...' : 'Sign In with Ethereum'}
              </button>
            </div>
          )}

          {/* STATE 3: LOGGED IN */}
          {isAuthenticated && (
            <div className="text-left">
              {/* Success Banner */}
              <div className="flex items-center gap-4 bg-[#00ff88]/10 border border-[#00ff88]/20 p-4 rounded-xl mb-6">
                <span className="text-2xl">🎉</span>
                <div>
                  <h3 className="text-[#00ff88] font-bold text-lg m-0">Welcome Back!</h3>
                  <p className="text-xs text-gray-300 m-0 opacity-80">Session Secure</p>
                </div>
              </div>

              {/* Profile Data */}
              {userProfile && (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">User ID</p>
                    <code className="block bg-black/30 p-2 rounded-lg font-mono text-sm break-all text-gray-200">
                      {userProfile.id}
                    </code>
                  </div>
                  
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Role</p>
                    <span className="inline-block bg-[#8E54E9] px-2 py-1 rounded text-xs font-bold">
                      {userProfile.role ? userProfile.role.toUpperCase() : 'USER'}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Joined</p>
                    <code className="block bg-black/30 p-2 rounded-lg font-mono text-sm text-gray-200">
                      {new Date(userProfile.createdAt).toLocaleDateString()}
                    </code>
                  </div>
                </div>
              )}

              <button 
                onClick={fetchUserProfile}
                className="w-full mt-6 bg-transparent border border-white/20 text-white py-2.5 rounded-lg hover:bg-white/5 transition-colors text-sm"
              >
                🔄 Refresh Data
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;