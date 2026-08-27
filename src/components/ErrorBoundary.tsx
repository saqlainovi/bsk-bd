import * as React from 'react';
import { RefreshCw, BookOpen, AlertCircle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("BSK App Error Caught by Boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (window.location.hostname.includes('cms.') || window.location.pathname.includes('admin') || window.location.hash.includes('cms')) {
      window.location.reload();
    } else {
      window.location.href = '/';
    }
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7F2] text-[#1A1207] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-lg w-full bg-white border border-[#B8862A]/30 rounded-3xl p-8 shadow-xl space-y-6">
            <div className="w-16 h-16 bg-[#B8862A]/10 border border-[#B8862A]/30 rounded-2xl flex items-center justify-center mx-auto text-[#B8862A]">
              <BookOpen className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-[#1A1207]">বিশ্বসাহিত্য কেন্দ্র</h2>
              <p className="text-xs text-[#6B5135] font-serif">Bishwo Shahitto Kendro</p>
            </div>

            <div className="bg-[#FAF7F2] border border-[#E8DDD0] rounded-2xl p-4 text-left space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-800">
                <AlertCircle className="w-4 h-4 text-[#B8862A]" />
                <span>পাতাটি লোড করতে সাময়িক সমস্যা হয়েছে</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                অনুগ্রহ করে নিচের বাটনে ক্লিক করে পুনরায় লোড করুন। কোনো ডেটা ড্রাফট থাকলে তা স্বয়ংক্রিয়ভাবে রিকভার হবে।
              </p>
              {this.state.error && (
                <details className="mt-2 text-[10px] text-stone-500 font-mono bg-stone-100 p-2 rounded-lg border border-stone-200">
                  <summary className="cursor-pointer text-amber-700 font-bold">কারিগরি বিবরণ (Error Details)</summary>
                  <p className="mt-1 whitespace-pre-wrap">{this.state.error.message}</p>
                </details>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="flex-1 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 font-serif font-bold text-xs rounded-xl transition duration-200 shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>পুনরায় চেষ্টা করুন (Retry)</span>
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 bg-[#B8862A] hover:bg-[#D4A84B] text-stone-950 font-serif font-bold text-xs rounded-xl transition duration-200 shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>রিফ্রেশ করুন (Reload)</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

