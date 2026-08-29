import React, { useState, useEffect } from 'react';
import { 
  Database, CheckCircle2, XCircle, RefreshCw, Server, 
  Activity, ShieldCheck, HardDrive, Layers, AlertCircle
} from 'lucide-react';
import { cpanelApi } from '../services/cpanelApi';
import { Language } from '../types';

interface DatabaseHealthDashboardProps {
  language: Language;
}

interface TableStatus {
  name: string;
  label_bn: string;
  label_en: string;
  status: 'loading' | 'success' | 'error';
  count: number;
  latencyMs: number;
  sampleId?: string;
  errorMsg?: string;
}

export const DatabaseHealthDashboard: React.FC<DatabaseHealthDashboardProps> = ({ language }) => {
  const [isDbOnline, setIsDbOnline] = useState<boolean | null>(null);
  const [pingLatency, setPingLatency] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<string>('');
  const [dbErrorDetail, setDbErrorDetail] = useState<string>('');
  
  const [tables, setTables] = useState<TableStatus[]>([
    { name: 'website_pages', label_bn: 'ওয়েবসাইট পেজসমূহ (সকল কার্যক্রম ও সেবা)', label_en: 'Website Pages & Content', status: 'loading', count: 0, latencyMs: 0 },
    { name: 'notices', label_bn: 'কেন্দ্রীয় নোটিশ বোর্ড', label_en: 'Central Notices', status: 'loading', count: 0, latencyMs: 0 },
    { name: 'events', label_bn: 'সেমিনার ও নতুন আপডেট', label_en: 'Events & Seminars', status: 'loading', count: 0, latencyMs: 0 },
    { name: 'news_items', label_bn: 'সংবাদ সাময়িকী ও মিডিয়া ফিড', label_en: 'Press & Media News', status: 'loading', count: 0, latencyMs: 0 },
    { name: 'job_circulars', label_bn: 'নিয়োগ বিজ্ঞপ্তি ও ক্যারিয়ার', label_en: 'Job Circulars', status: 'loading', count: 0, latencyMs: 0 },
    { name: 'job_applications', label_bn: 'প্রার্থীদের আবেদনপত্র ইনবক্স', label_en: 'Job Applications Inbox', status: 'loading', count: 0, latencyMs: 0 },
    { name: 'blog_posts', label_bn: 'সাহিত্য ব্লগ নিবন্ধমালা', label_en: 'Literary Blog Posts', status: 'loading', count: 0, latencyMs: 0 },
    { name: 'blog_reviews', label_bn: 'সমালোচক ও পাঠক রিভিউ', label_en: 'Critic Reviews', status: 'loading', count: 0, latencyMs: 0 },
    { name: 'press_releases', label_bn: 'অফিসিয়াল প্রেস রিলিজ', label_en: 'Press Releases', status: 'loading', count: 0, latencyMs: 0 },
    { name: 'media_coverage', label_bn: 'জাতীয় গণমাধ্যম কভারেজ', label_en: 'Media News Coverage', status: 'loading', count: 0, latencyMs: 0 },
    { name: 'hero_slides', label_bn: 'মূল হোমপেজ ব্যানার স্লাইড', label_en: 'Hero Banner Slides', status: 'loading', count: 0, latencyMs: 0 },
    { name: 'recent_activities', label_bn: 'সাম্প্রতিক কর্মকাণ্ড ও গ্যালারি', label_en: 'Recent Activities', status: 'loading', count: 0, latencyMs: 0 },
    { name: 'inquiries', label_bn: 'যোগাযোগ ও অনুসন্ধানের বার্তা', label_en: 'User Inquiries', status: 'loading', count: 0, latencyMs: 0 }
  ]);

  const runDiagnostics = async () => {
    setIsScanning(true);
    setDbErrorDetail('');
    const startPing = performance.now();

    try {
      const res = await fetch(`${cpanelApi.getApiUrl()}?action=ping&_t=${Date.now()}`);
      const endPing = performance.now();
      setPingLatency(Math.max(1, Math.round(endPing - startPing)));

      if (res.ok) {
        const data = await res.json();
        if (data && (data.success || data.status === 'connected')) {
          setIsDbOnline(true);
        } else {
          setIsDbOnline(false);
          setDbErrorDetail(data.error || 'Unknown status');
        }
      } else {
        setIsDbOnline(false);
        setDbErrorDetail(`HTTP ${res.status} ${res.statusText}`);
      }
    } catch (e: any) {
      setIsDbOnline(false);
      setDbErrorDetail(e.message || 'Network fetch failed');
    }

    const updated = await Promise.all(
      tables.map(async (tbl) => {
        const startT = performance.now();
        try {
          const docs = await cpanelApi.getCollection(tbl.name);
          const endT = performance.now();
          if (Array.isArray(docs)) {
            return {
              ...tbl,
              status: 'success' as const,
              count: docs.length,
              latencyMs: Math.max(1, Math.round(endT - startT)),
              sampleId: docs[0]?.id || (docs.length === 0 ? 'Empty Table' : undefined)
            };
          } else {
            return {
              ...tbl,
              status: 'error' as const,
              count: 0,
              latencyMs: Math.max(1, Math.round(endT - startT)),
              errorMsg: 'Invalid response format'
            };
          }
        } catch (err: any) {
          const endT = performance.now();
          return {
            ...tbl,
            status: 'error' as const,
            count: 0,
            latencyMs: Math.max(1, Math.round(endT - startT)),
            errorMsg: err.message || 'Fetch failed'
          };
        }
      })
    );

    setTables(updated);
    setLastChecked(new Date().toLocaleTimeString());
    setIsScanning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const totalRecords = tables.reduce((acc, t) => acc + (t.count || 0), 0);
  const successTables = tables.filter((t) => t.status === 'success').length;

  return (
    <div className="space-y-6 font-sans text-left animate-fade-in">
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#2E5942]/10 text-[#2E5942] rounded-xl">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-serif text-stone-900">
                {language === 'bn' ? 'ডাটাবেজ ও সিস্টেম হেলথ মনিটর' : 'Database & System Health Dashboard'}
              </h3>
              <p className="text-xs text-stone-500 font-sans mt-0.5">
                {language === 'bn' 
                  ? 'MySQL ডাটাবেজ কানেকশন, সকল টেবিলের স্থিতি এবং ডাটা ফেচিং পারফরম্যান্স লাইভ নিরীক্ষণ করুন।' 
                  : 'Live monitoring of MySQL database connection, table integrity, and data fetch latency.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastChecked && (
            <span className="text-[11px] text-stone-400 font-mono hidden sm:inline-block">
              {language === 'bn' ? 'সর্বশেষ পরীক্ষা:' : 'Last Checked:'} {lastChecked}
            </span>
          )}
          <button
            type="button"
            onClick={runDiagnostics}
            disabled={isScanning}
            className="px-4 py-2 bg-[#2E5942] hover:bg-[#203F2F] text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? (language === 'bn' ? 'পরীক্ষা চলছে...' : 'Scanning...') : (language === 'bn' ? 'পুনরায় টেস্ট করুন' : 'Run Full Diagnostics')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
            <span>{language === 'bn' ? 'সার্ভার সংযোগ' : 'Database Connection'}</span>
            <Server className="h-4 w-4 text-[#B8862A]" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className={`w-3 h-3 rounded-full ${isDbOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-pulse'}`} />
            <span className="text-base font-extrabold text-stone-900">
              {isDbOnline === null ? 'Checking...' : isDbOnline ? 'সচল 🟢 (Online)' : 'বিচ্ছিন্ন 🔴 (Offline)'}
            </span>
          </div>
          <p className="text-[10.5px] text-stone-400 font-mono">DB: bskbd_new @ localhost</p>
          {dbErrorDetail && (
            <p className="text-[10px] text-rose-500 font-mono truncate" title={dbErrorDetail}>
              {dbErrorDetail}
            </p>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
            <span>{language === 'bn' ? 'রেসপন্স টাইম (Latency)' : 'API Response Latency'}</span>
            <Activity className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-stone-900 pt-1 font-mono">
            {pingLatency} <span className="text-xs font-normal text-stone-500">ms</span>
          </div>
          <p className="text-[10.5px] text-emerald-600 font-bold">
            {pingLatency < 150 ? '⚡ Fast Response (< 150ms)' : '✓ Normal Latency'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
            <span>{language === 'bn' ? 'সক্রিয় টেবিল সংখ্যা' : 'Healthy Tables'}</span>
            <Layers className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-stone-900 pt-1 font-mono">
            {successTables} <span className="text-xs font-normal text-stone-400">/ {tables.length}</span>
          </div>
          <p className="text-[10.5px] text-stone-400">
            {successTables === tables.length ? '✓ ১০০% টেবিল সক্রিয়' : '⚠️ কিছু টেবিলে সমস্যা রয়েছে'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
            <span>{language === 'bn' ? 'মোট সংরক্ষিত রেকর্ড' : 'Total Records'}</span>
            <HardDrive className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-[#2E5942] pt-1 font-mono">
            {totalRecords}
          </div>
          <p className="text-[10.5px] text-stone-400">সকল কালেকশন মিলিয়ে</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/70 flex items-center justify-between">
          <h4 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>{language === 'bn' ? 'সকল SQL টেবিলের লাইভ ডাটা ফেচিং স্থিতি' : 'SQL Tables Live Fetching Status'}</span>
          </h4>
          <span className="text-[11px] font-mono font-bold text-stone-500 bg-stone-200/60 px-2 py-0.5 rounded-md">
            utf8mb4_unicode_ci
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
              <tr>
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">{language === 'bn' ? 'টেবিলের নাম' : 'Table Name'}</th>
                <th className="px-5 py-3">{language === 'bn' ? 'বিবরণ' : 'Description'}</th>
                <th className="px-5 py-3 text-center">{language === 'bn' ? 'ফেচ স্ট্যাটাস' : 'Status'}</th>
                <th className="px-5 py-3 text-center">{language === 'bn' ? 'রেকর্ড সংখ্যা' : 'Records'}</th>
                <th className="px-5 py-3 text-right">{language === 'bn' ? 'ফেচ স্পিড' : 'Latency'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {tables.map((tbl, idx) => (
                <tr key={tbl.name} className="hover:bg-stone-50/80 transition">
                  <td className="px-5 py-3.5 text-stone-400 font-mono">{idx + 1}</td>
                  <td className="px-5 py-3.5 font-mono font-bold text-stone-800">
                    `{tbl.name}`
                  </td>
                  <td className="px-5 py-3.5 text-stone-600">
                    {language === 'bn' ? tbl.label_bn : tbl.label_en}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {tbl.status === 'loading' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
                        <RefreshCw className="h-3 w-3 animate-spin" /> পরীক্ষা হচ্ছে
                      </span>
                    ) : tbl.status === 'success' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" /> সচল (200 OK)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full font-bold" title={tbl.errorMsg}>
                        <XCircle className="h-3 w-3 text-rose-600" /> সমস্যা (Error)
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center font-mono font-bold text-stone-800">
                    {tbl.count} টি
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-stone-500">
                    {tbl.latencyMs} ms
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
