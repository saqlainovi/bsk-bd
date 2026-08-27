// src/components/DatabaseAuditPanel.tsx - Full Table-by-Table Database Audit
import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, RefreshCw, AlertTriangle, Database, Activity } from 'lucide-react';
import { cpanelApi, DatabaseStatusResponse } from '../services/cpanelApi';
import { Language } from '../types';

interface DatabaseAuditPanelProps {
  language: Language;
}

export const DatabaseAuditPanel: React.FC<DatabaseAuditPanelProps> = ({ language }) => {
  const [loading, setLoading] = useState(false);
  const [statusData, setStatusData] = useState<DatabaseStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [auditTimestamp, setAuditTimestamp] = useState<string>('');

  const runAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cpanelApi.getDatabaseStatus();
      setStatusData(data);
      setAuditTimestamp(new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err: any) {
      setError(err.message || 'Audit execution failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAudit();
  }, []);

  const tables = statusData?.tables || {};
  const tableEntries = Object.entries(tables);
  const passedCount = tableEntries.filter(([_, t]) => t.exists && t.count >= 0 && !t.error).length;

  return (
    <div className="space-y-6 font-sans">
      {/* Header Summary */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold font-serif text-stone-900">
              {language === 'bn' ? 'ডাটাবেস অডিট রিপোর্ট' : 'Database Integrity Audit Report'}
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {language === 'bn'
              ? 'সকল রিলেশনাল টেবিলের অস্তিত্ব, রেকর্ড কাউন্ট এবং লাইভ সার্ভার স্টেট ভেরিফিকেশন।'
              : 'Full verification of all MySQL relational tables, record integrity, and live server state.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={runAudit}
            disabled={loading}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? (language === 'bn' ? 'অডিট চলছে...' : 'Auditing...') : (language === 'bn' ? 'পুনরায় অডিট করুন' : 'Re-run Full Audit')}</span>
          </button>
        </div>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs text-stone-500 font-medium block">Audit Status</span>
          <div className="flex items-center gap-2 mt-1">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="text-base font-bold text-stone-900">
              {passedCount} / {tableEntries.length} Passed
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs text-stone-500 font-medium block">Total MySQL Records</span>
          <div className="flex items-center gap-2 mt-1">
            <Database className="h-5 w-5 text-emerald-700" />
            <span className="text-base font-bold text-stone-900">
              {statusData?.total_records ?? 0} Records
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs text-stone-500 font-medium block">Storage Engine</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-bold text-emerald-800">
              {statusData?.storage_engine || 'MySQL Relational'}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-xs text-stone-500 font-medium block">Ping Latency</span>
          <div className="flex items-center gap-2 mt-1">
            <Activity className="h-5 w-5 text-amber-500" />
            <span className="text-base font-bold text-stone-900 font-mono">
              {statusData?.latencyMs !== undefined ? `${statusData.latencyMs} ms` : '--'}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Audit Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900">
            Canonical MySQL Tables Audit ({tableEntries.length})
          </h3>
          <span className="text-xs text-stone-500 font-mono">
            Audit Timestamp: {auditTimestamp || '--:--:--'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700 border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Table Name</th>
                <th className="py-3 px-4">Record Count</th>
                <th className="py-3 px-4">Last Checked / Updated</th>
                <th className="py-3 px-4">Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {tableEntries.map(([tblName, info], idx) => {
                const isHealthy = info.exists && !info.error;
                return (
                  <tr key={tblName} className="hover:bg-stone-50/80 transition">
                    <td className="py-3 px-4 text-stone-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-900">
                      {tblName}
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-800 font-mono">
                      {info.count}
                    </td>
                    <td className="py-3 px-4 text-stone-500 font-mono text-[11px]">
                      {info.last_updated || auditTimestamp || '--'}
                    </td>
                    <td className="py-3 px-4">
                      {isHealthy ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>PASS (VERIFIED)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full">
                          <XCircle className="h-3 w-3" />
                          <span>{info.error || 'FAILED'}</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
