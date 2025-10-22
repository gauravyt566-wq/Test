
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LookupType, HistoryItem, Stats, FamilyInfoResponse } from './types';
import PinOverlay from './components/PinOverlay';
import { 
    SearchLocationIcon, ShieldIcon, DatabaseIcon, BoltIcon, InfoIcon, SearchIcon, 
    EraserIcon, CopyIcon, DownloadIcon, PdfIcon, CsvIcon, ExclamationTriangleIcon, 
    MoonIcon, SunIcon, ClockIcon, UploadIcon, KeyboardIcon, CheckIcon, SpinnerIcon 
} from './components/Icons';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);

    const Watermark = () => (
        <div className="fixed inset-0 pointer-events-none z-[1000] overflow-hidden opacity-5 dark:opacity-[0.03]">
            {[...Array(4)].map((_, i) => (
                <React.Fragment key={i}>
                    <div className="absolute font-black text-6xl whitespace-nowrap text-green-500 top-[10%] left-[-5%] animate-drift-normal" style={{ animationDelay: `${i * -30}s` }}>INTELLIGENCE LOOKUP TOOL</div>
                    <div className="absolute font-black text-5xl whitespace-nowrap text-red-500 top-[60%] left-[-10%] animate-drift-reverse" style={{ animationDelay: `${i * -25}s` }}>CONFIDENTIAL</div>
                </React.Fragment>
            ))}
        </div>
    );
    
    // Main App Content
    const MainApp = () => {
        const [lookupType, setLookupType] = useState<LookupType>(LookupType.Mobile);
        const [inputValue, setInputValue] = useState('');
        const [formattedOutput, setFormattedOutput] = useState('');
        const [isLoading, setIsLoading] = useState(false);
        const [status, setStatus] = useState({ message: '', type: '' });
        const [history, setHistory] = useState<HistoryItem[]>([]);
        const [stats, setStats] = useState<Stats>({ total: 0, successful: 0, responseTime: 0 });

        const isBulk = useMemo(() => lookupType.startsWith('bulk'), [lookupType]);

        useEffect(() => {
            const savedHistory = localStorage.getItem('searchHistory');
            if (savedHistory) setHistory(JSON.parse(savedHistory));
            const savedStats = localStorage.getItem('searchStats');
            if (savedStats) setStats(JSON.parse(savedStats));
        }, []);

        const updateAndSaveHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
            setHistory(prev => {
                const newHistory = [
                    { ...item, id: Date.now(), timestamp: new Date().toLocaleString() }, 
                    ...prev
                ].slice(0, 15);
                localStorage.setItem('searchHistory', JSON.stringify(newHistory));
                return newHistory;
            });
        };
        
        const updateAndSaveStats = (newTime: number, wasSuccess: boolean) => {
            setStats(prev => {
                const newStats = {
                    total: prev.total + 1,
                    successful: prev.successful + (wasSuccess ? 1 : 0),
                    responseTime: prev.responseTime + newTime,
                };
                localStorage.setItem('searchStats', JSON.stringify(newStats));
                return newStats;
            });
        };

        const handleClear = () => {
            setInputValue('');
            setFormattedOutput('');
            setStatus({ message: '', type: '' });
        };
        
        const handleSearch = useCallback(async () => {
            if (isBulk) {
                // Bulk search logic would be here
                setStatus({ message: 'Bulk search not implemented in this example.', type: 'warning' });
                return;
            }
        
            let val = inputValue.trim();
            // Validation logic based on lookupType
            // ...
        
            setIsLoading(true);
            setStatus({ message: 'Connecting to Database...', type: 'info' });
        
            const apiEndpoints = {
                [LookupType.Mobile]: `https://gauravapi.gauravyt492.workers.dev/?mobile=${val}`,
                [LookupType.Aadhaar]: `https://aadhar.gauravyt492.workers.dev/?aadhar=${val}`,
                [LookupType.FamilyInfo]: `https://family-members-n5um.vercel.app/fetch?aadhaar=${val}&key=paidchx`,
                // ... other endpoints
            };
        
            const url = apiEndpoints[lookupType as keyof typeof apiEndpoints];
            if (!url) {
                setStatus({ message: 'Invalid lookup type.', type: 'error' });
                setIsLoading(false);
                return;
            }
        
            const startTime = performance.now();
            try {
                await new Promise(resolve => setTimeout(resolve, 1500));
                setStatus({ message: 'Fetching Data...', type: 'info' });
                const resp = await fetch(url);
                const text = await resp.text();
                const endTime = performance.now();
                const responseTime = Math.round(endTime - startTime);
        
                let formattedResult = '';
                let wasSuccess = false;
        
                try {
                    const data = JSON.parse(text);
                    if(lookupType === LookupType.FamilyInfo) {
                        formattedResult = formatFamilyInfoResponse(data, val);
                    } else {
                        formattedResult = formatGenericResponse(data, lookupType, val);
                    }
                    wasSuccess = !text.toLowerCase().includes('not found') && !text.toLowerCase().includes('error');
                } catch (e) {
                    formattedResult = `Invalid JSON response:\n\n${text}`;
                    wasSuccess = false;
                }
        
                setFormattedOutput(formattedResult);
                updateAndSaveStats(responseTime, wasSuccess);
                updateAndSaveHistory({ type: lookupType, value: val, result: wasSuccess ? 'Found' : 'Not Found' });
                setStatus({ message: `Analysis Complete (${responseTime}ms)`, type: 'success' });
            } catch (err) {
                const endTime = performance.now();
                const responseTime = Math.round(endTime - startTime);
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                setFormattedOutput(`Network Error: Unable to connect.\n\n${errorMessage}`);
                updateAndSaveStats(responseTime, false);
                updateAndSaveHistory({ type: lookupType, value: val, result: 'Error' });
                setStatus({ message: 'Connection Error', type: 'error' });
            } finally {
                setIsLoading(false);
            }
        }, [inputValue, lookupType, isBulk]);

        const formatFamilyInfoResponse = (data: FamilyInfoResponse, aadhar: string): string => {
            let formatted = `========================================================\n`;
            formatted += `            FAMILY INFO ANALYSIS REPORT\n`;
            formatted += `                  FOR ${aadhar}\n`;
            formatted += `========================================================\n\n`;
            
            formatted += `Address: ${data.address || 'N/A'}\n`;
            formatted += `State: ${data.homeStateName || 'N/A'}\n`;
            formatted += `District: ${data.homeDistName || 'N/A'}\n`;
            formatted += `Scheme: ${data.schemeName || 'N/A'} (ID: ${data.schemeId || 'N/A'})\n`;
            formatted += `Ration Card ID: ${data.rcId || 'N/A'}\n\n`;
            
            formatted += `------------------ FAMILY MEMBERS ------------------\n`;
            if (data.memberDetailsList && data.memberDetailsList.length > 0) {
                data.memberDetailsList.forEach((member, index) => {
                    formatted += `\n[${index + 1}] Name: ${member.memberName.toUpperCase()}\n`;
                    formatted += `    Relationship: ${member.releationship_name.toUpperCase()}\n`;
                    formatted += `    Aadhaar Linked: ${member.uid}\n`;
                });
            } else {
                formatted += `No family members found.\n`;
            }
            
            formatted += `\n----------------------------------------------------\n`;
            return formatted;
        };
        
        const formatGenericResponse = (data: any, type: LookupType, value: string): string => {
            let formatted = `========================================================\n`;
            formatted += `          ${type.toUpperCase()} ANALYSIS REPORT FOR ${value}\n`;
            formatted += `========================================================\n\n`;
            
            if (data.data && Array.isArray(data.data)) {
                 data.data.forEach((item: any, idx: number) => {
                     formatted += `------------------ RECORD ${idx + 1} ------------------\n`;
                     Object.entries(item).forEach(([key, val]) => {
                         formatted += `${key.charAt(0).toUpperCase() + key.slice(1)}: ${val}\n`;
                     });
                     formatted += `\n`;
                 });
            } else if (data.data) {
                Object.entries(data.data).forEach(([key, val]) => {
                     formatted += `${key.charAt(0).toUpperCase() + key.slice(1)}: ${val}\n`;
                 });
            } else {
                formatted += JSON.stringify(data, null, 2);
            }
            
            return formatted;
        };

        const avgResponseTime = stats.total > 0 ? Math.round(stats.responseTime / stats.total) : 0;
        const successRate = stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 100;

        return (
            <>
            <div className={`fixed top-5 left-5 z-50`}>
                <button onClick={() => setIsDarkTheme(!isDarkTheme)} className={`p-2 rounded-full transition-colors ${isDarkTheme ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/10 hover:bg-black/20 text-gray-800'}`}>
                    {isDarkTheme ? <SunIcon className="h-6 w-6"/> : <MoonIcon className="h-6 w-6"/>}
                </button>
            </div>
            
            <header className={`text-center mb-6 max-w-4xl w-full p-6 rounded-2xl border backdrop-blur-lg transition-all ${isDarkTheme ? 'bg-white/5 border-white/10 shadow-2xl shadow-black/30' : 'bg-white/80 border-black/10 shadow-xl shadow-gray-300/50'}`}>
                <div className="flex items-center justify-center gap-4 mb-2">
                    <div className={`h-20 w-20 rounded-full flex items-center justify-center shadow-lg ${isDarkTheme ? 'bg-white/10' : 'bg-blue-500/10'}`}>
                        <SearchLocationIcon className="h-10 w-10 text-blue-500"/>
                    </div>
                    <div>
                        <h1 className={`text-4xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                           Intelligence Lookup Tool
                        </h1>
                        <p className={`mt-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                            Advanced intelligence analysis for legitimate security research
                        </p>
                    </div>
                </div>
            </header>

            <main className={`max-w-4xl w-full p-8 rounded-2xl border backdrop-blur-lg transition-all ${isDarkTheme ? 'bg-white/5 border-white/10 shadow-2xl shadow-black/30' : 'bg-white/80 border-black/10 shadow-xl shadow-gray-300/50'}`}>
                <div className="flex justify-between mb-6 flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2"><ShieldIcon className="h-5 w-5 text-blue-400"/> Secure & Encrypted Queries</div>
                    <div className="flex items-center gap-2"><DatabaseIcon className="h-5 w-5 text-blue-400"/> Multiple Data Sources</div>
                    <div className="flex items-center gap-2"><BoltIcon className="h-5 w-5 text-blue-400"/> Real-time Processing</div>
                </div>

                <div className={`grid grid-cols-3 gap-4 text-center p-4 rounded-xl mb-6 ${isDarkTheme ? 'bg-white/5' : 'bg-black/5'}`}>
                    <div>
                        <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
                        <div className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>Total Searches</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-blue-400">{successRate}%</div>
                        <div className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>Success Rate</div>
                    </div>
                     <div>
                        <div className="text-2xl font-bold text-blue-400">{avgResponseTime}ms</div>
                        <div className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>Avg Response</div>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <select
                        value={lookupType}
                        onChange={(e) => setLookupType(e.target.value as LookupType)}
                        className={`w-full p-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkTheme ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-100 border-gray-300 text-gray-800'}`}
                    >
                        <option value={LookupType.Mobile}>Mobile Number Lookup</option>
                        <option value={LookupType.Aadhaar}>Aadhaar Number Lookup</option>
                        <option value={LookupType.FamilyInfo}>Family Info (by Aadhaar)</option>
                    </select>
                    
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Enter number..."
                        className={`w-full p-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkTheme ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-100 border-gray-300 text-gray-800'}`}
                    />
                    
                    <div className="flex gap-4">
                        <button onClick={handleSearch} disabled={isLoading} className="flex-grow flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg hover:shadow-blue-500/50 disabled:bg-blue-400 disabled:cursor-not-allowed">
                            {isLoading ? <SpinnerIcon className="h-5 w-5"/> : <SearchIcon className="h-5 w-5"/>}
                            {isLoading ? 'Searching...' : 'Search'}
                        </button>
                        <button onClick={handleClear} className={`flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold transition-all shadow-lg ${isDarkTheme ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'}`}>
                            <EraserIcon className="h-5 w-5"/> Clear
                        </button>
                    </div>
                </div>

                <div className="mt-8">
                     <textarea
                        readOnly
                        value={formattedOutput}
                        placeholder="Formatted results will appear here..."
                        className={`w-full h-96 p-4 rounded-lg border-2 font-mono text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkTheme ? 'bg-black/20 border-white/20 text-gray-200' : 'bg-gray-100 border-gray-300 text-gray-800'}`}
                    />
                    {status.message && (
                        <div className={`mt-2 text-center text-sm p-2 rounded-lg ${
                            status.type === 'success' ? 'bg-green-500/10 text-green-400' : 
                            status.type === 'error' ? 'bg-red-500/10 text-red-400' : 
                            'bg-blue-500/10 text-blue-400'}`
                        }>
                            {status.message}
                        </div>
                    )}
                </div>

                <div className={`mt-4 p-4 rounded-lg border-l-4 ${isDarkTheme ? 'bg-red-500/10 border-red-500 text-red-300' : 'bg-red-500/10 border-red-500 text-red-700'}`}>
                    <strong className="font-bold">Confidential:</strong> For Police / LEA only. Data from legal sources. Use with consent/authorization.
                </div>
            </main>
            </>
        );
    };

    return (
        <div className={`${isDarkTheme ? 'dark' : ''}`}>
            <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 font-sans ${isDarkTheme ? 'bg-gradient-to-br from-[#0c0c0c] via-[#1a1a2e] to-[#16213e] text-gray-200' : 'bg-gradient-to-br from-[#f5f7fa] to-[#dbe6f6] text-gray-800'}`}>
                <Watermark />
                <div className="relative z-10 w-full flex flex-col items-center">
                    {isAuthenticated ? <MainApp /> : <PinOverlay onAuthSuccess={() => setIsAuthenticated(true)} isDarkTheme={isDarkTheme} />}
                </div>
            </div>
        </div>
    );
};

export default App;
