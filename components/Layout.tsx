
import React, { ReactNode } from 'react';
import { Anchor, BookOpen, PenTool, LogOut, UserCircle, Share2 } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  activeTab: 'dashboard' | 'journal' | 'insights';
  onTabChange: (tab: 'dashboard' | 'journal' | 'insights') => void;
  userEmail: string;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, userEmail, onLogout }) => {
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Agency Builder',
        text: '我正在使用这个应用来提升自我主体性，推荐你也试试！',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板！');
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 text-slate-800 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2 text-emerald-700">
            <Anchor className="w-6 h-6" />
            <h1 className="text-lg md:text-xl font-bold tracking-tight hidden md:block">主体性构建</h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-2 md:px-3 py-1.5 rounded-full border border-slate-100">
              <UserCircle size={16} />
              <span className="max-w-[80px] md:max-w-[100px] truncate">{userEmail}</span>
            </div>
            
            <button 
              onClick={handleShare}
              className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-full transition-colors"
              title="分享给朋友"
            >
              <Share2 size={20} />
            </button>

            <button 
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="退出登录"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-3xl w-full mx-auto p-4 pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 w-full bg-white border-t border-emerald-100 pb-safe z-20">
        <div className="max-w-3xl mx-auto flex justify-around p-3">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex flex-col items-center gap-1 text-sm ${
              activeTab === 'dashboard' ? 'text-emerald-600 font-medium' : 'text-slate-400'
            }`}
          >
            <BookOpen size={20} />
            <span>今日与反馈</span>
          </button>
          
          <button
            onClick={() => onTabChange('journal')}
            className={`flex flex-col items-center gap-1 text-sm ${
              activeTab === 'journal' ? 'text-emerald-600 font-medium' : 'text-slate-400'
            }`}
          >
            <PenTool size={20} />
            <span>每日行动</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
