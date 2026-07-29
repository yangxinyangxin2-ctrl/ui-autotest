'use client';

import { useTestStore } from '../store/useTestStore';
import { Monitor, Crosshair, Gauge, SquareSquare, PieChart, Terminal, Eraser } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function Sandbox() {
    const { 
        sandboxSize, setSandboxSize, 
        pickingMode, setPickingMode, 
        speed, setSpeed, 
        isRunning, shouldStop, setShouldStop,
        logs, clearLogs, addLog 
    } = useTestStore();

    const logEndRef = useRef<HTMLDivElement>(null);

    // Auto scroll logs
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const handleTogglePicker = () => {
        const next = !pickingMode;
        setPickingMode(next);
        if (next) {
            addLog('拾取器已开启。请在同源页面的控制台中执行专用拾取脚本，或手动输入选择器。纯前端架构下，由于浏览器安全限制，难以在未授权的 iframe 内直接捕获点击事件。', 'info');
            setTimeout(() => setPickingMode(false), 3000);
        }
    };

    return (
        <section className="flex-1 min-w-[450px] flex flex-col bg-zinc-950 z-0">
            {/* Top Control Bar */}
            <div className="p-4 border-b border-zinc-800 bg-[#18181b] flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0 shadow-sm z-10">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-semibold text-zinc-300 flex items-center shrink-0">
                        <Monitor className="w-4 h-4 mr-1.5" />沙箱
                    </span>
                    <select 
                        value={sandboxSize}
                        onChange={(e) => setSandboxSize(e.target.value)}
                        className="text-xs border border-zinc-700 bg-[#27272a] rounded-md px-2.5 py-1.5 outline-none focus:border-violet-500 transition-colors text-zinc-300 cursor-pointer"
                    >
                        <option value="100%">自适应 (Responsive)</option>
                        <option value="1920x1080">PC (1920x1080)</option>
                        <option value="768x1024">平板 (768x1024)</option>
                        <option value="375x667">手机 (375x667)</option>
                    </select>
                    <button 
                        onClick={handleTogglePicker}
                        className={`text-xs border px-3 py-1.5 rounded-md transition-all flex items-center font-medium shadow-sm active:scale-95 ${
                            pickingMode ? 'bg-violet-600 text-white border-violet-600' : 'text-violet-400 border-violet-900/50 bg-violet-900/20 hover:bg-violet-900/40'
                        }`}
                        title="开启后在 iframe 中点击元素自动拾取选择器"
                    >
                        <Crosshair className="w-3.5 h-3.5 mr-1.5" />拾取器
                    </button>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 bg-[#27272a] px-3 py-1.5 rounded-md border border-zinc-700" title="步骤执行间隔">
                        <Gauge className="w-4 h-4 text-zinc-500" />
                        <input 
                            type="range" 
                            min="0" max="3000" step="100" 
                            value={speed}
                            onChange={(e) => setSpeed(parseInt(e.target.value))}
                            className="w-24 accent-violet-600 cursor-ew-resize" 
                        />
                        <span className="text-xs text-zinc-400 font-mono w-9 text-right">{(speed / 1000).toFixed(1)}s</span>
                    </div>
                    <div className="h-5 w-px bg-zinc-800 hidden xl:block"></div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => {
                                setShouldStop(true);
                                addLog('用户手动终止执行', 'error');
                            }}
                            disabled={!isRunning || shouldStop}
                            className="flex items-center justify-center p-2 text-red-500 bg-red-900/20 hover:bg-red-900/40 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="停止运行"
                        >
                            <SquareSquare className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => document.getElementById('report-drawer')?.classList.remove('translate-x-full')}
                            className="flex items-center justify-center px-3 py-2 text-sm font-medium text-zinc-900 bg-zinc-100 hover:bg-white rounded-md shadow-sm transition-colors" 
                            title="查看测试报告"
                        >
                            <PieChart className="w-4 h-4 mr-1.5" />
                            报告
                        </button>
                    </div>
                </div>
            </div>

            {/* Iframe Sandbox Container */}
            <div className="flex-1 relative flex items-center justify-center overflow-auto border-b border-zinc-800 shadow-inner p-4 bg-[#27272a]"
                 style={{ backgroundImage: 'radial-gradient(#27272a 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                <div 
                    className="relative bg-white shadow-2xl transition-all duration-300 rounded-sm overflow-hidden border border-zinc-800"
                    style={{
                        width: sandboxSize === '100%' ? '100%' : sandboxSize.split('x')[0] + 'px',
                        height: sandboxSize === '100%' ? '100%' : sandboxSize.split('x')[1] + 'px'
                    }}
                >
                    {pickingMode && (
                        <div className="absolute inset-0 bg-violet-600/20 z-50 cursor-crosshair backdrop-blur-[1px]" />
                    )}
                    <iframe 
                        id="test-sandbox" 
                        className="w-full h-full border-none bg-white" 
                        src="about:blank"
                    />
                </div>
            </div>

            {/* Logs Panel */}
            <div className="h-64 bg-zinc-950 flex flex-col font-mono text-sm shrink-0">
                <div className="h-9 bg-[#18181b] border-b border-zinc-900 flex items-center justify-between px-4 text-zinc-500 text-xs select-none">
                    <span className="flex items-center tracking-wider"><Terminal className="w-3.5 h-3.5 mr-2" />TERMINAL</span>
                    <button onClick={clearLogs} className="hover:text-zinc-300 transition-colors flex items-center" title="清空日志">
                        <Eraser className="w-3 h-3 mr-1" /> Clear
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 scroll-smooth text-[13px] leading-relaxed">
                    {logs.length === 0 && <div className="text-zinc-600">Waiting for execution...</div>}
                    {logs.map((log, i) => {
                        let colorClass = 'text-zinc-300';
                        let prefix = '›';
                        if (log.type === 'success') {
                            colorClass = 'text-emerald-400';
                            prefix = '✔';
                        }
                        else if (log.type === 'error') {
                            colorClass = 'text-rose-400';
                            prefix = '✖';
                        }
                        else if (log.type === 'wait') {
                            colorClass = 'text-zinc-500';
                            prefix = '…';
                        }

                        return (
                            <div key={i} className={`flex gap-3 ${colorClass} hover:bg-zinc-800/30 px-2 py-0.5 rounded -mx-2 transition-colors`}>
                                <span className="text-zinc-600 shrink-0 w-[80px]">[{log.time}]</span> 
                                <span className="shrink-0 w-4 text-center">{prefix}</span>
                                <span className="break-all">{log.msg}</span>
                            </div>
                        );
                    })}
                    <div ref={logEndRef} />
                </div>
            </div>
        </section>
    );
}
