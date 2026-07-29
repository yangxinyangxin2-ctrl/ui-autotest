'use client';

import { useTestStore } from '../store/useTestStore';
import { Rocket, MousePointerClick, ShieldAlert, Database } from 'lucide-react';
import { useEffect, useState } from 'react';

export function GuideModal() {
    const { guideShown, setGuideShown } = useTestStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || guideShown) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0a0a0a] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all duration-300 border border-zinc-800">
                <div className="bg-[#111111] p-8 text-white text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-500 via-transparent to-transparent"></div>
                    <Rocket className="w-12 h-12 mx-auto mb-5 text-violet-400 relative z-10" />
                    <h2 className="text-2xl font-bold tracking-tight relative z-10">欢迎使用 AutoTest</h2>
                    <p className="mt-2 text-zinc-400 text-sm relative z-10">基于 Next.js 的纯前端 UI 自动化测试框架</p>
                </div>
                <div className="p-6 sm:p-8 space-y-6 text-zinc-400 bg-[#0a0a0a]">
                    <div className="flex items-start gap-4">
                        <div className="bg-violet-900/20 text-violet-400 w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-violet-900/50">
                            <MousePointerClick className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-zinc-200">可视化用例编排</h3>
                            <p className="text-sm mt-1.5 leading-relaxed">在左侧新建测试用例，在中间面板拖拽或添加测试步骤（跳转、点击、断言等）。无需手写代码。</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="bg-amber-900/20 text-amber-400 w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-amber-900/50">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-zinc-200">安全策略限制提示</h3>
                            <p className="text-sm mt-1.5 leading-relaxed">因浏览器同源策略，本工具默认只能测试 <strong className="text-zinc-100">同源页面</strong>。如需测试跨域网页，请在浏览器安装并开启允许跨域/禁用 CSP 的插件。</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="bg-emerald-900/20 text-emerald-400 w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-emerald-900/50">
                            <Database className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-zinc-200">100% 数据本地化</h3>
                            <p className="text-sm mt-1.5 leading-relaxed">所有测试用例和报告均保存在浏览器 LocalStorage 中，您可以随时导出为 JSON 备份。不依赖任何后端。</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-[#111111] border-t border-zinc-800 text-center">
                    <button 
                        onClick={() => setGuideShown(true)} 
                        className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-xl font-semibold shadow-md transition-all w-full active:scale-[0.98]"
                    >
                        开始使用
                    </button>
                </div>
            </div>
        </div>
    );
}
