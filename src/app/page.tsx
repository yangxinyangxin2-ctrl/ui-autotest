'use client';

import { Sidebar } from '@/components/Sidebar';
import { Editor } from '@/components/Editor';
import { Sandbox } from '@/components/Sandbox';
import { ReportDrawer } from '@/components/ReportDrawer';
import { GuideModal } from '@/components/GuideModal';

export default function Home() {
  return (
    <div className="h-screen w-screen overflow-hidden flex bg-black text-zinc-100 font-sans selection:bg-violet-500/30">
      <Sidebar />
      <Editor />
      <Sandbox />
      
      <ReportDrawer />
      <GuideModal />
      
      {/* 抽屉遮罩 */}
      <div 
        id="drawer-overlay" 
        className="fixed inset-0 bg-zinc-900/40 z-40 hidden opacity-0 transition-opacity duration-300 backdrop-blur-sm"
        onClick={() => {
          document.getElementById('report-drawer')?.classList.add('translate-x-full');
          document.getElementById('drawer-overlay')?.classList.add('opacity-0');
          setTimeout(() => {
            document.getElementById('drawer-overlay')?.classList.add('hidden');
          }, 300);
        }}
      />
    </div>
  );
}
