
import React, { useState, useEffect } from 'react';
import { ShieldIcon, SearchLocationIcon, KeyIcon, LockOpenIcon, InfoIcon, ExclamationTriangleIcon } from './Icons';

interface PinOverlayProps {
  onAuthSuccess: () => void;
  isDarkTheme: boolean;
}

const STATIC_PIN = "1212";

const PinOverlay: React.FC<PinOverlayProps> = ({ onAuthSuccess, isDarkTheme }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(3);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (isLocked) {
      const timer = setTimeout(() => {
        setIsLocked(false);
        setAttempts(3);
        setError('');
        setPin('');
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [isLocked]);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setPin(value);
    }
  };

  const handleSubmit = () => {
    if (isLocked) return;

    if (pin === STATIC_PIN) {
      onAuthSuccess();
    } else {
      const newAttempts = attempts - 1;
      setAttempts(newAttempts);
      setPin('');
      if (newAttempts <= 0) {
        setError('Access denied. Too many failed attempts. System locked for 30 seconds.');
        setIsLocked(true);
      } else {
        setError('Incorrect PIN. Please try again.');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className={`fixed inset-0 flex justify-center items-center z-50 transition-colors duration-300 ${isDarkTheme ? 'bg-gradient-to-br from-[#0c0c0c] to-[#16213e]' : 'bg-gradient-to-br from-[#f5f7fa] to-[#dbe6f6]'}`}>
      <div className={`backdrop-blur-xl rounded-2xl p-10 max-w-md w-full text-center border transition-all duration-300 ${isDarkTheme ? 'bg-white/5 border-white/10 shadow-2xl shadow-black/50' : 'bg-white/95 border-black/10 shadow-2xl shadow-gray-400/30'}`}>
        <div className="mb-6">
          <div className={`mx-auto mb-4 h-24 w-24 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-green-500/10 shadow-lg`}>
              <ShieldIcon className="h-12 w-12 text-blue-400" />
          </div>
          <h1 className={`text-2xl font-bold flex items-center justify-center gap-3 ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>
            <SearchLocationIcon className="h-8 w-8 text-blue-500" />
            Intelligence Lookup Tool
          </h1>
          <p className={`${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>OSINT Intelligence Platform</p>
        </div>
        
        <div className={`mb-6 p-3 rounded-lg border-l-4 flex items-center gap-3 ${isDarkTheme ? 'bg-white/5 border-blue-500 text-gray-300' : 'bg-black/5 border-blue-500 text-gray-600'}`}>
            <KeyIcon className="h-5 w-5 text-blue-500"/>
            Enter your secure access PIN to continue
        </div>

        <div className="mb-6">
            <input
                type="password"
                value={pin}
                onChange={handlePinChange}
                onKeyDown={handleKeyDown}
                placeholder="••••"
                maxLength={4}
                inputMode="numeric"
                disabled={isLocked}
                className={`w-full text-center tracking-[1.5rem] text-2xl font-bold p-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isDarkTheme ? 'bg-white/10 border-white/20 text-white placeholder-gray-500' : 'bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-400'} ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}
            />
        </div>

        <div className="mb-4">
            <button
                onClick={handleSubmit}
                disabled={isLocked}
                className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-lg`}
            >
                <LockOpenIcon className="h-5 w-5" />
                Authenticate
            </button>
        </div>

        {error && (
            <div className={`p-3 mb-4 rounded-lg border-l-4 flex items-center gap-3 text-sm ${isDarkTheme ? 'bg-red-500/10 border-red-500 text-red-400' : 'bg-red-500/10 border-red-500 text-red-600'}`}>
                <ExclamationTriangleIcon className="h-5 w-5" />
                {error}
            </div>
        )}

        <div className={`text-sm mb-6 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
            Attempts remaining: <span className="font-bold">{attempts}</span>
        </div>

        <div className={`text-xs p-2 rounded-md flex items-center justify-center gap-2 ${isDarkTheme ? 'bg-white/5 text-gray-500' : 'bg-black/5 text-gray-500'}`}>
            <InfoIcon className="h-4 w-4" />
            This system is monitored and all access attempts are logged.
        </div>
      </div>
    </div>
  );
};

export default PinOverlay;
