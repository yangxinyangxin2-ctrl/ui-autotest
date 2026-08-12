'use client';

import { useTestStore } from '../store/useTestStore';
import { LineChart, X, Download, CheckCircle2, XCircle } from 'lucide-react';
import Image from 'next/image';

export function ReportDrawer() {
    const { reports } = useTestStore();

    const handleClose = () => {
        document.getElementById('report-drawer')?.classList.add('translate-x-full');
        document.getElementById('drawer-overlay')?.classList.add('opacity-0');
        setTimeout(() => {
            document.getElementById('drawer-overlay')?.classList.add('hidden');
        }, 300);
    };

    const handleDownload = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reports, null, 2));
        const a = document.createElement('a');
        a.setAttribute("href", dataStr);
        a.setAttribute("download", "ui_autotest_reports.json");
        a.click();
    };

    const latest = reports[0];

    return (
        <div id="report-drawer" className="fixed inset-y-0 right-0 w-full max-w-2xl bg-[#4c1d95] shadow-2xl transform translate-x-full transition-transform duration-300 z-50 flex flex-col border-l border-zinc-800">
            <div className="min-h-[64px] border-b border-zinc-800 flex items-center justify-between px-6 bg-[#4c1d95] shrink-0">
                <h2 className="text-lg font-bold text-zinc-100 flex items-center tracking-tight">
                    <LineChart className="w-5 h-5 text-violet-500 mr-2" /> 测试报告
                </h2>
                <button onClick={handleClose} className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 p-2 rounded-md transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>
            
            <div className="p-6 border-b border-zinc-800 flex flex-wrap gap-4 bg-[#5b21b6] shrink-0">
                <div className="flex-1 min-w-[100px] bg-[#6d28d9] rounded-xl p-4 text-center border border-zinc-800 shadow-sm">
                    <div className="text-zinc-500 text-sm mb-1 font-medium">总用例数</div>
                    <div className="text-3xl font-bold text-zinc-200">{latest?.total || 0}</div>
                </div>
                <div className="flex-1 min-w-[100px] bg-emerald-900/10 rounded-xl p-4 text-center border border-emerald-900/30 shadow-sm">
                    <div className="text-emerald-500 text-sm mb-1 font-medium">成功</div>
                    <div className="text-3xl font-bold text-emerald-400">{latest?.success || 0}</div>
                </div>
                <div className="flex-1 min-w-[100px] bg-rose-900/10 rounded-xl p-4 text-center border border-rose-900/30 shadow-sm">
                    <div className="text-rose-500 text-sm mb-1 font-medium">失败</div>
                    <div className="text-3xl font-bold text-rose-400">{latest?.fail || 0}</div>
                </div>
                <div className="flex-1 min-w-[100px] bg-violet-900/10 rounded-xl p-4 text-center border border-violet-900/30 shadow-sm">
                    <div className="text-violet-400 text-sm mb-1 font-medium">通过率</div>
                    <div className="text-3xl font-bold text-violet-400">
                        {latest?.total > 0 ? Math.round((latest.success / latest.total) * 100) + '%' : '0%'}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-[#4c1d95]">
                <div className="space-y-4">
                    {!latest || latest.results.length === 0 ? (
                        <div className="text-center text-zinc-600 mt-10 text-sm">暂无报告数据</div>
                    ) : (
                        latest.results.map((res, idx) => (
                            <div key={idx} className={`bg-[#5b21b6] border ${res.success ? 'border-emerald-900/50' : 'border-rose-900/50'} rounded-xl p-5 shadow-sm transition-all hover:shadow-md`}>
                                <div className="flex justify-between items-center mb-3">
                                    <div className="font-semibold text-zinc-200 flex items-center">
                                        {res.success ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2 shrink-0" /> : <XCircle className="w-5 h-5 text-rose-500 mr-2 shrink-0" />}
                                        <span className="truncate max-w-[300px]">{res.caseName}</span>
                                    </div>
                                    <div className="text-xs text-zinc-400 font-mono bg-zinc-800 px-2 py-1 rounded">{res.duration}ms</div>
                                </div>
                                {res.errorMsg && <div className="text-sm text-rose-400 bg-rose-950/30 border border-rose-900/50 p-3 rounded-lg mt-2 font-mono leading-relaxed">{res.errorMsg}</div>}
                                {res.screenshot && (
                                    <div className="mt-4 border border-zinc-800 rounded-lg overflow-hidden bg-violet-950">
                                        <div className="bg-zinc-900 text-xs px-3 py-2 border-b border-zinc-800 text-zinc-500 font-medium">错误截图</div>
                                        <img src={res.screenshot} alt="Error Screenshot" className="w-full h-auto object-contain" />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            <div className="p-4 border-t border-zinc-800 bg-[#4c1d95] text-right shrink-0">
                <button onClick={handleDownload} className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-all flex items-center ml-auto active:scale-95">
                    <Download className="w-4 h-4 mr-2" /> 下载完整报告 (JSON)
                </button>
            </div>
        </div>
    );
}
