'use client';

import { useTestStore } from '../store/useTestStore';
import { Play, Trash2, FileText, Pointer, GripVertical, X } from 'lucide-react';
import { ReactSortable } from 'react-sortablejs';
import { STEP_TEMPLATES } from '../lib/runner';
import { useState } from 'react';
import { TestCaseStep } from '../types';

export function Editor() {
    const { cases, currentCaseId, updateCaseName, deleteCase, addStep, updateStep, deleteStep, reorderSteps, isRunning } = useTestStore();
    const [newStepType, setNewStepType] = useState<TestCaseStep['type']>('goto');

    const tc = cases.find(c => c.id === currentCaseId);

    const handleRunCurrent = () => {
        if (!tc) return;
        const iframe = document.getElementById('test-sandbox') as HTMLIFrameElement;
        if (iframe) {
            import('../lib/runner').then(({ runTestSequence }) => {
                runTestSequence([tc], iframe);
            });
        }
    };

    if (!tc) {
        return (
            <main className="w-2/5 min-w-[400px] flex flex-col border-r border-zinc-800 bg-[#0a0a0a] z-0">
                <div className="min-h-[64px] flex items-center px-6 border-b border-zinc-800 bg-[#0a0a0a]" />
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 bg-[#0a0a0a]">
                    <Pointer className="w-12 h-12 mb-4 opacity-30 text-zinc-600" />
                    <p className="text-sm font-medium">在左侧选择一个用例或新建用例</p>
                </div>
            </main>
        );
    }

    return (
        <main className="w-2/5 min-w-[400px] flex flex-col border-r border-zinc-800 bg-[#0a0a0a] z-0">
            {/* Editor Header */}
            <div className="min-h-[64px] flex-shrink-0 flex items-center justify-between px-6 border-b border-zinc-800 bg-[#0a0a0a]">
                <div className="flex-1 flex items-center mr-4 min-w-0">
                    <FileText className="w-5 h-5 text-zinc-500 mr-3 shrink-0" />
                    <input
                        type="text"
                        value={tc.name}
                        onChange={(e) => updateCaseName(tc.id, e.target.value)}
                        placeholder="测试用例名称"
                        className="w-full bg-transparent border-none outline-none font-semibold text-lg text-zinc-100 placeholder-zinc-600 truncate"
                    />
                </div>
                <div className="flex gap-2 shrink-0">
                    <button
                        onClick={handleRunCurrent}
                        disabled={isRunning}
                        className="text-green-500 hover:text-green-400 p-2 rounded-lg hover:bg-green-900/20 transition-colors disabled:opacity-50"
                        title="运行当前用例"
                    >
                        <Play className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('确认删除当前用例？')) deleteCase(tc.id);
                        }}
                        className="text-red-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-900/20 transition-colors"
                        title="删除当前用例"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Steps List */}
            <div className="flex-1 overflow-y-auto p-4 bg-zinc-950 relative no-scrollbar">
                <ReactSortable
                    list={tc.steps}
                    setList={(newList) => {
                        // Managed by onEnd
                    }}
                    onEnd={(evt) => {
                        if (evt.oldIndex !== undefined && evt.newIndex !== undefined && evt.oldIndex !== evt.newIndex) {
                            reorderSteps(evt.oldIndex, evt.newIndex);
                        }
                    }}
                    handle=".drag-handle"
                    animation={150}
                    ghostClass="opacity-50"
                    className="space-y-3 pb-20"
                >
                    {tc.steps.map((step, index) => {
                        const tpl = STEP_TEMPLATES[step.type];
                        if (!tpl) return null;
                        return (
                            <div key={step.id} className="group bg-[#111111] border border-zinc-800 rounded-xl shadow-sm p-4 flex flex-col gap-3 relative pl-10 transition-all hover:shadow-md hover:border-violet-500/50">
                                {/* Drag handle */}
                                <div className="drag-handle absolute left-0 top-0 bottom-0 w-8 bg-transparent flex items-center justify-center cursor-move text-zinc-600 hover:text-zinc-400 transition-colors rounded-l-xl">
                                    <GripVertical className="w-4 h-4" />
                                </div>

                                {/* Header */}
                                <div className="flex justify-between items-center">
                                    <div className="font-semibold text-zinc-200 text-sm flex items-center">
                                        <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-0.5 rounded-md mr-2 font-mono">{index + 1}</span>
                                        <span className="mr-1.5">{tpl.icon}</span> {tpl.label}
                                    </div>
                                    <button
                                        className="text-zinc-500 hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
                                        onClick={() => deleteStep(step.id)}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Fields */}
                                <div className={`grid gap-3 ${tpl.fields.length > 1 ? 'grid-cols-1 2xl:grid-cols-2' : 'grid-cols-1'}`}>
                                    {tpl.fields.map(field => {
                                        if (field === 'timeout') return null; // hide by default
                                        return (
                                            <input
                                                key={field}
                                                type={field === 'delay' ? 'number' : 'text'}
                                                className="w-full text-sm border border-zinc-700 bg-[#0a0a0a] text-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder-zinc-600"
                                                placeholder={tpl.placeholders[field]}
                                                value={(step as any)[field] || ''}
                                                onChange={(e) => updateStep(step.id, field as keyof TestCaseStep, e.target.value)}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </ReactSortable>
            </div>

            {/* Add Step Bar */}
            <div className="p-4 border-t border-zinc-800 bg-[#0a0a0a] flex gap-3 shrink-0">
                <select
                    value={newStepType}
                    onChange={(e) => setNewStepType(e.target.value as TestCaseStep['type'])}
                    className="flex-1 border border-zinc-700 bg-[#111111] rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-zinc-200"
                >
                    {Object.entries(STEP_TEMPLATES).map(([key, tpl]) => (
                        <option key={key} value={key}>{tpl.icon} {tpl.label}</option>
                    ))}
                </select>
                <button
                    onClick={() => addStep(newStepType)}
                    className="bg-violet-600 hover:bg-violet-500 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-sm transition-all active:scale-95 shrink-0"
                >
                    添加步骤
                </button>
            </div>
        </main>
    );
}
