// src/components/DatabaseStatusPanel.tsx - Live Database Status & Real-time Connectivity Monitor
import React, { useState, useEffect } from 'react';
import { Database, ShieldCheck, RefreshCw, AlertCircle, Server, Activity, CheckCircle2, XCircle } from 'lucide-react';
import { cpanelApi, DatabaseStatusResponse, getAdminToken } from '../services/cpanelApi';
import { Language } from '../types';

interface DatabaseStatusPanelProps {
  language: Language;
  onRefreshAll?: () => void;
}

export const DatabaseStatusPanel: React.FC<DatabaseStatusPanelProps> = ({
  language,
  onRefreshAll
}) => {
  const [statusData, setStatusData] = useState<DatabaseStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<string>('');
  const [lastWrite, setLastWrite] = useState<string>(() => {
    return sessionStorage.getItem('bsk_last_server_write') || 'No writes yet in this session';
  });

  const checkStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cpanelApi.getDatabaseStatus();
      setStatusData(data);
      setLastChecked(new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err: any) {
      setError(err.message || 'Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();

    const handleDbUpdate = () => {
      const timeStr = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastWrite(timeStr);
      sessionStorage.setItem('bsk_last_server_write', timeStr);
      checkStatus();
    };

    window.addEventListener('bsk_db_updated', handleDbUpdate);
    return () => {
      window.removeEventListener('bsk_db_updated', handleDbUpdate);
    };
  }, []);

  const hasAdminToken = !!getAdminToken();
  const isOnline = statusData?.api_connection === true && !error;
  const isMySQLVerified = statusData?.mysql_connected === true;

  return (
    <div className="bg-[#131F17] text-stone-100 rounded-2xl border border-stone-800 shadow-xl overflow-hidden font-sans">
      {/* Header Bar */}
      <div className="px-5 py-3.5 bg-black/40 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-extrabold text-sm md:text-base text-white tracking-wide">
                # DATABASE STATUS
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isOnline && isMySQLVerified
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
              }`}>
                {isOnline && isMySQLVerified ? 'LIVE PRODUCTION DATABASE' : 'OFFLINE / ATTENTION REQUIRED'}
              </span>
            </div>
            <p className="text-[11px] text-stone-400 font-mono">
              API Endpoint: <span className="text-amber-300 font-semibold">{cpanelApi.getApiUrl()}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={checkStatus}
            disabled={loading}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-white/10"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-amber-400' : 'text-stone-300'}`} />
            <span>{loading ? (language === 'bn' ? 'যাচাই হচ্ছে...' : 'Testing...') : (language === 'bn' ? 'টেস্ট পিং' : 'Test Ping')}</span>
          </button>
          {onRefreshAll && (
            <button
              type="button"
              onClick={() => {
                checkStatus();
                onRefreshAll();
              }}
              className="px-3 py-1.5 bg-[#B8862A] hover:bg-[#966b1e] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <span>{language === 'bn' ? 'সার্ভার রিফ্রেশ' : 'Refresh from Server'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Key Status Metrics */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: API Connection */}
        <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">
            API Connection
          </span>
          <div className="flex items-center gap-1.5">
            {isOnline ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-emerald-300">ONLINE 🟢</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span className="text-xs font-bold text-rose-300">OFFLINE 🔴</span>
              </>
            )}
          </div>
        </div>

        {/* Metric 2: MySQL Connection */}
        <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">
            MySQL Status
          </span>
          <div className="flex items-center gap-1.5">
            {isMySQLVerified ? (
              <>
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-emerald-300">VERIFIED 🟢</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-xs font-bold text-amber-300">
                  {statusData?.storage_engine || 'FAILED'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Metric 3: Authenticated Admin */}
        <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">
            Admin Auth
          </span>
          <div className="flex items-center gap-1.5">
            {hasAdminToken ? (
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                <span>YES 🛡️</span>
              </span>
            ) : (
              <span className="text-xs font-bold text-stone-400">NO SESSION</span>
            )}
          </div>
        </div>

        {/* Metric 4: Latency */}
        <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">
            Latency (Ping)
          </span>
          <div className="flex items-center gap-1.5 font-mono">
            <Activity className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="text-xs font-bold text-white">
              {statusData?.latencyMs !== undefined ? `${statusData.latencyMs} ms` : '--'}
            </span>
          </div>
        </div>

        {/* Metric 5: Last Server Read */}
        <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">
            Last Server Read
          </span>
          <span className="text-[11px] font-mono text-stone-300 block truncate">
            {lastChecked || '--:--:--'}
          </span>
        </div>

        {/* Metric 6: Last Server Write */}
        <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">
            Last Server Write
          </span>
          <span className="text-[11px] font-mono text-emerald-300 block truncate">
            {lastWrite}
          </span>
        </div>
      </div>

      {/* Error / Warning Notice if any */}
      {(error || statusData?.db_error) && (
        <div className="px-5 py-2.5 bg-rose-950/60 border-t border-rose-900/60 flex items-center gap-2 text-rose-200 text-xs font-medium">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>Last Server Error: {error || statusData?.db_error}</span>
        </div>
      )}
    </div>
  );
};
