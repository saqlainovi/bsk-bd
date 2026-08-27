// src/components/DatabaseExplorer.tsx - Enterprise Database Explorer & Document Inspector for bskbd.org
import React, { useState, useEffect } from 'react';
import {
  Database,
  Table,
  Search,
  RefreshCw,
  Eye,
  Copy,
  Check,
  FileCode,
  Shield,
  Layers,
  Calendar,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { cpanelApi } from '../services/cpanelApi';
import { Language } from '../types';

interface DatabaseExplorerProps {
  language: Language;
}

export const DatabaseExplorer: React.FC<DatabaseExplorerProps> = ({ language }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explorerData, setExplorerData] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState<string>('bsk_website_pages');
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchExplorer = async (table?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await cpanelApi.getExplorerData(table);
      setExplorerData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load database explorer data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExplorer();
  }, []);

  const tables = explorerData?.tables || {};
  const currentTableData = tables[selectedTable] || { count: 0, rows: [] };
  const rows: any[] = currentTableData.rows || [];

  const filteredRows = rows.filter((row: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const idMatch = (row.id || '').toLowerCase().includes(q);
    const titleMatch = (row.title || row.title_bn || row.title_en || row.name || '').toLowerCase().includes(q);
    const slugMatch = (row.slug || '').toLowerCase().includes(q);
    return idMatch || titleMatch || slugMatch;
  });

  const handleCopyJson = (obj: any) => {
    try {
      navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Database className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold font-serif text-stone-900">
              {language === 'bn' ? 'ডাটাবেস এক্সপ্লোরার ও লাইভ রেকর্ডস' : 'Database Explorer & Live Document Inspector'}
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {language === 'bn' 
              ? 'সার্ভারের সকল রিলেশনাল টেবিল, রেকর্ড ও লাইভ ডকুমেন্টস সরাসরি ব্রাউজ ও ইন্সপেক্ট করুন।'
              : 'Direct live inspection of all 16 canonical MySQL relational tables and document stores.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchExplorer()}
            disabled={loading}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? (language === 'bn' ? 'রিফ্রেশ হচ্ছে...' : 'Refreshing...') : (language === 'bn' ? 'সার্ভার রিফ্রেশ' : 'Refresh All')}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tables List */}
        <div className="lg:col-span-4 space-y-2">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                <Table className="h-4 w-4 text-emerald-700" />
                <span>MySQL Tables ({Object.keys(tables).length})</span>
              </h3>
            </div>

            <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
              {Object.keys(tables).map((tblName) => {
                const info = tables[tblName];
                const isSelected = selectedTable === tblName;
                return (
                  <button
                    key={tblName}
                    type="button"
                    onClick={() => {
                      setSelectedTable(tblName);
                      setSelectedDoc(null);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-800 text-white font-semibold shadow-sm'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-100'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <span className="block font-mono truncate">{tblName}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-stone-200 text-stone-700'
                    }`}>
                      {info?.count ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Records of Selected Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-sm font-bold font-mono text-emerald-900 flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-emerald-700" />
                  <span>Table: {selectedTable}</span>
                </h3>
                <span className="text-xs text-stone-500">
                  Total rows on server: <strong className="text-stone-800">{currentTableData.count || 0}</strong>
                </span>
              </div>

              {/* Search input */}
              <div className="relative min-w-[200px]">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'bn' ? 'রেকর্ড সার্চ করুন...' : 'Filter records...'}
                  className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-700 outline-none"
                />
              </div>
            </div>

            {/* Table Rows List */}
            {filteredRows.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-xs">
                {language === 'bn' ? 'কোন রেকর্ড পাওয়া যায়নি।' : 'No records found in this table.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-700 border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">ID / Slug</th>
                      <th className="py-2.5 px-3">Title / Name</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Updated At</th>
                      <th className="py-2.5 px-3 text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredRows.map((row: any, idx: number) => {
                      const displayTitle = row.title || row.title_bn || row.title_en || row.name || row.slug || '(No title)';
                      const isSelected = selectedDoc?.id === row.id;
                      return (
                        <tr
                          key={row.id || idx}
                          className={`hover:bg-emerald-50/50 transition cursor-pointer ${
                            isSelected ? 'bg-emerald-50 font-semibold' : ''
                          }`}
                          onClick={() => setSelectedDoc(row)}
                        >
                          <td className="py-2 px-3 font-mono text-emerald-800 font-bold max-w-[140px] truncate">
                            {row.id || row.slug}
                          </td>
                          <td className="py-2 px-3 max-w-[200px] truncate font-medium text-stone-800">
                            {displayTitle}
                          </td>
                          <td className="py-2 px-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              row.status === 'published' || row.is_active == 1
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-100 text-stone-600'
                            }`}>
                              {row.status || (row.is_active == 1 ? 'active' : 'draft')}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-[11px] text-stone-500 font-mono">
                            {row.updated_at || row.created_at || '--'}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDoc(row);
                              }}
                              className="px-2.5 py-1 bg-stone-100 hover:bg-emerald-800 hover:text-white rounded-lg text-[10px] font-semibold transition cursor-pointer"
                            >
                              <Eye className="h-3 w-3 inline mr-1" />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Document Inspector Modal / Card */}
          {selectedDoc && (
            <div className="bg-white p-5 rounded-2xl border-2 border-emerald-700/30 shadow-lg space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-emerald-800" />
                  <div>
                    <h4 className="font-bold text-sm text-stone-900 font-mono">
                      Doc ID: {selectedDoc.id || selectedDoc.slug}
                    </h4>
                    <span className="text-[11px] text-stone-500">
                      Table: <strong>{selectedTable}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyJson(selectedDoc)}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDoc(null)}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    ✕ Close
                  </button>
                </div>
              </div>

              {/* JSON Preformatted Box */}
              <div className="bg-[#131F17] p-4 rounded-xl text-stone-200 text-xs font-mono max-h-[400px] overflow-y-auto border border-stone-800">
                <pre className="whitespace-pre-wrap word-break">
                  {JSON.stringify(selectedDoc, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
