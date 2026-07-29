'use client';

import { useTestStore } from '../store/useTestStore';
import { Play, Copy, FileCode2, Plus, Download, Upload, Trash2, TestTube2 } from 'lucide-react';
import { useRef } from 'react';
import { runTestSequence } from '../lib/runner';

export function Sidebar() {
    const { cases, currentCaseId, addCase, deleteCase, copyCase, setCurrentCase, importCases, clearAll, isRunning } = useTestStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target?.result as string);
                if (Array.isArray(imported)) {
                    importCases(imported);
                    alert('导入成功！');
                }
            } catch (err) {
                alert('JSON 格式错误！');
            }
        };
        reader.readAsText(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cases, null, 2));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", "ui_autotest_cases.json");
        dlAnchorElem.click();
    };

    const handleClearAll = () => {
        if (confirm('确认清空所有用例和本地数据？')) {
            clearAll();
        }
    };

    const runSingleCase = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const tc = cases.find(c => c.id === id);
        const iframe = document.getElementById('test-sandbox') as HTMLIFrameElement;
        if (tc && iframe) {
            runTestSequence([tc], iframe);
        }
    };

    const runAllCases = () => {
        if (cases.length === 0) return alert('没有可运行的用例');
        const iframe = document.getElementById('test-sandbox') as HTMLIFrameElement;
        if (iframe) {
            runTestSequence(cases, iframe);
        }
    };

    return (
        <aside className="w-72 flex-shrink-0 bg-white flex flex-col border-r border-zinc-200 z-10 shadow-sm relative">
            {/* Logo & Header */}
            <div className="min-h-[64px] flex-shrink-0 flex items-center px-6 border-b border-zinc-200">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-600 text-white mr-3 shadow-sm shrink-0">
                    <TestTube2 className="w-4 h-4" />
                </div>
                <span className="font-bold text-zinc-900 tracking-tight text-lg truncate">AutoTest</span>
            </div>

            {/* Controls */}
            <div className="p-4 border-b border-zinc-100 flex gap-2 shrink-0 bg-zinc-50/50">
                <button
                    onClick={addCase}
                    disabled={isRunning}
                    className="flex-1 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-sm py-2 px-3 rounded-lg shadow-sm transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4 mr-1.5" /> 新建用例
                </button>
                <button
                    onClick={runAllCases}
                    disabled={isRunning}
                    className="flex items-center justify-center bg-violet-100 text-violet-700 hover:bg-violet-200 disabled:opacity-50 text-sm py-2 px-3 rounded-lg shadow-sm transition-all active:scale-95 shrink-0"
                    title="批量运行全部"
                >
                    <Play className="w-4 h-4" />
                </button>
            </div>

            {/* Case List */}
            <div className="flex-1 overflow-y-auto p-3 no-scrollbar space-y-1">
                {cases.length === 0 ? (
                    <div className="text-zinc-400 text-sm text-center mt-6">暂无用例，请新建</div>
                ) : (
                    cases.map((tc) => (
                        <div
                            key={tc.id}
                            onClick={() => setCurrentCase(tc.id)}
                            className={`p-2.5 rounded-lg cursor-pointer flex items-center justify-between group transition-all border ${
                                currentCaseId === tc.id 
                                ? 'bg-violet-50 border-violet-200 shadow-sm' 
                                : 'bg-transparent border-transparent hover:bg-zinc-100'
                            }`}
                        >
                            <div className="flex items-center truncate flex-1 min-w-0 pr-2">
                                <FileCode2 className={`w-4 h-4 mr-2.5 shrink-0 ${currentCaseId === tc.id ? 'text-violet-600' : 'text-zinc-400'}`} />
                                <span className={`text-sm truncate ${currentCaseId === tc.id ? 'font-medium text-violet-900' : 'text-zinc-600'}`} title={tc.name}>
                                    {tc.name}
                                </span>
                            </div>
                            <div className={`flex gap-1 shrink-0 transition-opacity ${currentCaseId === tc.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                <button
                                    className="p-1.5 text-zinc-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                    onClick={(e) => runSingleCase(tc.id, e)}
                                    title="运行"
                                >
                                    <Play className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                    onClick={(e) => { e.stopPropagation(); copyCase(tc.id); }}
                                    title="复制"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-zinc-200 bg-zinc-50/80 text-xs flex justify-between shrink-0">
                <button onClick={handleExport} className="flex items-center text-zinc-500 hover:text-zinc-900 font-medium transition-colors">
                    <Download className="w-3.5 h-3.5 mr-1.5" /> 导出
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center text-zinc-500 hover:text-zinc-900 font-medium transition-colors">
                    <Upload className="w-3.5 h-3.5 mr-1.5" /> 导入
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />
                <button onClick={handleClearAll} className="flex items-center text-red-500 hover:text-red-700 font-medium transition-colors">
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> 清空
                </button>
            </div>
        </aside>
    );
}
