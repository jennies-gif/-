
import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Info, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (email: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onLogin(email.trim().toLowerCase());
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-emerald-100 w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Agency Builder</h1>
          <p className="text-emerald-600 font-medium">找回你的主体性</p>
        </div>

        {/* Introduction Accordion for new users */}
        <div className="mb-6 bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="flex items-center justify-between w-full text-left text-sm font-semibold text-emerald-800"
          >
            <span className="flex items-center gap-2"><Info size={16}/> 这是一个什么应用？</span>
            <span className="text-emerald-500">{showInfo ? '收起' : '展开'}</span>
          </button>
          
          {showInfo && (
            <div className="mt-3 text-xs text-slate-600 space-y-2 animate-in slide-in-from-top-2">
              <p>这是一个帮助你练习“做自己”的心理学工具。</p>
              <ul className="list-disc list-inside space-y-1 ml-1">
                <li><strong>什么是主体性？</strong> 意味着你知道自己要什么，你的感受和想法是最重要的。</li>
                <li><strong>如何使用？</strong> 每天记录一件小事，AI 教练会给你反馈，并布置一个明天的“主体性挑战”。</li>
              </ul>
              <p className="mt-2 text-emerald-700">无需注册，输入邮箱即可开启你的专属空间。</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              邮箱账号
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
              我们也支持您的朋友直接输入他们的邮箱来试用。
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-emerald-200"
          >
            <span>进入我的空间</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center">
          <p className="text-xs text-slate-400">
            数据存储在您的设备本地，不同账号互不干扰。
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
