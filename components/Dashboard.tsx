import React from 'react';
import { DayEntry } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';

interface DashboardProps {
  history: DayEntry[];
}

const Dashboard: React.FC<DashboardProps> = ({ history }) => {
  const lastEntry = history[history.length - 1];

  const chartData = history.map(h => ({
    date: h.date.slice(5), // MM-DD
    mood: h.mood,
    worth: h.selfWorthScore || 5
  })).slice(-7); // Show last 7 entries

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Latest Feedback Card */}
      {lastEntry && lastEntry.aiFeedback && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
          <h2 className="text-lg font-bold text-emerald-800 mb-2 flex items-center gap-2">
            <span className="text-2xl">💡</span> 昨日反馈
          </h2>
          <div className="prose prose-emerald text-slate-600 text-sm leading-relaxed">
            <p>{lastEntry.aiFeedback}</p>
          </div>
        </div>
      )}

      {/* Concept Card */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-md">
        <h3 className="font-bold text-lg mb-2">什么是主体性？</h3>
        <ul className="list-disc list-inside space-y-2 text-emerald-50 text-sm opacity-90">
           <li>我的感受和想法是最重要的。</li>
           <li>我知道我要什么。</li>
           <li>你认不认可我，我都自信、爱自己。</li>
        </ul>
      </div>

      {/* Progress Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
        <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp size={16} /> 趋势追踪
        </h3>
        <div className="h-48 w-full">
          {chartData.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
             <LineChart data={chartData}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
               <XAxis dataKey="date" tick={{fontSize: 12}} stroke="#94a3b8" />
               <YAxis hide domain={[0, 10]} />
               <Tooltip 
                 contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
               />
               <Line type="monotone" dataKey="mood" stroke="#10b981" strokeWidth={3} dot={{r: 4}} name="心情" />
             </LineChart>
           </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                暂无数据，请开始今天的记录
            </div>
          )}
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3">
        <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
            <Calendar size={16} /> 历史记录
        </h3>
        {history.slice().reverse().map((entry) => (
            <div key={entry.date} className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                <div>
                    <div className="font-medium text-slate-800">{entry.date}</div>
                    <div className="text-xs text-slate-500 truncate max-w-[200px]">{entry.journalEntry}</div>
                </div>
                <div className="flex gap-2 text-xs font-bold">
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md">Mood: {entry.mood}</span>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
