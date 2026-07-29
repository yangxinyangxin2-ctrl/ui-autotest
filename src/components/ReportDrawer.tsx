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
        <div id="report-drawer" className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl transform translate-x-full transition-transform duration-300 z-50 flex flex-col border-l border-zinc-200">
            <div className="min-h-[64px] border-b border-zinc-200 flex items-center justify-between px-6 bg-white shrink-0">
                <h2 className="text-lg font-bold text-zinc-900 flex items-center tracking-tight">
                    <LineChart className="w-5 h-5 text-violet-600 mr-2" /> 测试报告
                </h2>
                <button onClick={handleClose} className="text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 p-2 rounded-md transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>
            
            <div className="p-6 border-b border-zinc-100 flex flex-wrap gap-4 bg-zinc-50 shrink-0">
                <div className="flex-1 min-w-[100px] bg-white rounded-xl p-4 text-center border border-zinc-200 shadow-sm">
                    <div className="text-zinc-500 text-sm mb-1 font-medium">总用例数</div>
                    <div className="text-3xl font-bold text-zinc-800">{latest?.total || 0}</div>
                </div>
                <div className="flex-1 min-w-[100px] bg-white rounded-xl p-4 text-center border border-emerald-100 shadow-sm">
                    <div className="text-emerald-600 text-sm mb-1 font-medium">成功</div>
                    <div className="text-3xl font-bold text-emerald-600">{latest?.success || 0}</div>
                </div>
                <div className="flex-1 min-w-[100px] bg-white rounded-xl p-4 text-center border border-rose-100 shadow-sm">
                    <div className="text-rose-600 text-sm mb-1 font-medium">失败</div>
                    <div className="text-3xl font-bold text-rose-600">{latest?.fail || 0}</div>
                </div>
                <div className="flex-1 min-w-[100px] bg-white rounded-xl p-4 text-center border border-violet-100 shadow-sm">
                    <div className="text-violet-600 text-sm mb-1 font-medium">通过率</div>
                    <div className="text-3xl font-bold text-violet-600">
                        {latest?.total > 0 ? Math.round((latest.success / latest.total) * 100) + '%' : '0%'}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/50">
                <div className="space-y-4">
                    {!latest || latest.results.length === 0 ? (
                        <div className="text-center text-zinc-400 mt-10 text-sm">暂无报告数据</div>
                    ) : (
                        latest.results.map((res, idx) => (
                            <div key={idx} className={`bg-white border ${res.success ? 'border-emerald-200/60' : 'border-rose-200/60'} rounded-xl p-5 shadow-sm transition-all hover:shadow-md`}>
                                <div className="flex justify-between items-center mb-3">
                                    <div className="font-semibold text-zinc-800 flex items-center">
                                        {res.success ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2 shrink-0" /> : <XCircle className="w-5 h-5 text-rose-500 mr-2 shrink-0" />}
                                        <span className="truncate max-w-[300px]">{res.caseName}</span>
                                    </div>
                                    <div className="text-xs text-zinc-400 font-mono bg-zinc-100 px-2 py-1 rounded">{res.duration}ms</div>
                                </div>
                                {res.errorMsg && <div className="text-sm text-rose-700 bg-rose-50 border border-rose-100 p-3 rounded-lg mt-2 font-mono leading-relaxed">{res.errorMsg}</div>}
                                {res.screenshot && (
                                    <div className="mt-4 border border-zinc-200 rounded-lg overflow-hidden bg-zinc-50">
                                        <div className="bg-zinc-100 text-xs px-3 py-2 border-b border-zinc-200 text-zinc-500 font-medium">错误截图</div>
                                        <img src={res.screenshot} alt="Error Screenshot" className="w-full h-auto object-contain" />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            <div className="p-4 border-t border-zinc-200 bg-white text-right shrink-0">
                <button onClick={handleDownload} className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-all flex items-center ml-auto active:scale-95">
                    <Download className="w-4 h-4 mr-2" /> 下载完整报告 (JSON)
                </button>
            </div>
        </div>
    );
}
