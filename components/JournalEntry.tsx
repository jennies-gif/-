
import React from 'react';
import { DailyTask, DailyDraft } from '../types';
import { CheckCircle2, Circle, Send } from 'lucide-react';

interface JournalEntryProps {
  date: string;
  tasks: DailyTask[];
  draft: DailyDraft;
  onUpdateDraft: (draft: Partial<DailyDraft>) => void;
  onUpdateTasks: (tasks: DailyTask[]) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const JournalEntry: React.FC<JournalEntryProps> = ({ 
  date, 
  tasks, 
  draft,
  onUpdateDraft,
  onUpdateTasks,
  onSubmit, 
  isSubmitting 
}) => {
  
  const toggleTask = (id: string) => {
    const newTasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    onUpdateTasks(newTasks);
  };

  const updateTaskResponse = (id: string, response: string) => {
    const newTasks = tasks.map(t => t.id === id ? { ...t, userResponse: response } : t);
    onUpdateTasks(newTasks);
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Date Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-emerald-900">{date}</h2>
        <p className="text-emerald-600">今天的自我觉察练习</p>
      </div>

      {/* 1. Daily Tasks */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">今日挑战 (1-2项)</h3>
        <p className="text-sm text-slate-500 mb-4">完成这些小任务来增强你的主体性，并记录你的具体行动。</p>
        <div className="space-y-4">
          {tasks.map(task => (
            <div 
              key={task.id}
              className={`p-4 rounded-xl border transition-all ${
                task.completed 
                  ? 'bg-emerald-50 border-emerald-200' 
                  : 'bg-slate-50 border-slate-200 hover:border-emerald-200'
              }`}
            >
              <div 
                onClick={() => toggleTask(task.id)}
                className="flex items-start gap-3 cursor-pointer mb-3"
              >
                {task.completed 
                  ? <CheckCircle2 className="text-emerald-500 w-5 h-5 flex-shrink-0 mt-0.5" /> 
                  : <Circle className="text-slate-400 w-5 h-5 flex-shrink-0 mt-0.5" />
                }
                <span className={`text-sm font-medium leading-relaxed ${task.completed ? 'text-emerald-800 line-through opacity-70' : 'text-slate-800'}`}>
                    {task.text}
                </span>
              </div>
              
              <textarea
                value={task.userResponse || ''}
                onChange={(e) => updateTaskResponse(task.id, e.target.value)}
                placeholder="在此记录你的具体做法、说的话或心里的感受..."
                className="w-full text-sm p-3 bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all resize-none placeholder:text-slate-400"
                rows={2}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="text-slate-400 italic text-sm">正在等待AI生成最适合你的今日任务...</p>
          )}
        </div>
      </div>

      {/* 2. Mood Slider */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">今日自我感觉 (1-10)</h3>
        <input 
          type="range" 
          min="1" 
          max="10" 
          value={draft.mood} 
          onChange={(e) => onUpdateDraft({ mood: Number(e.target.value) })}
          className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span>低价值感</span>
          <span className="text-emerald-600 font-bold text-lg">{draft.mood}</span>
          <span>充满力量</span>
        </div>
      </div>

      {/* 3. Reflection Questions */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            我的真实想法与感受 <span className="text-xs font-normal text-slate-500">(练习发声)</span>
          </label>
          <textarea
            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm min-h-[100px]"
            placeholder="今天有没有哪个时刻你没有说出自己的想法？或者是你勇敢表达了什么？..."
            value={draft.journalEntry}
            onChange={(e) => onUpdateDraft({ journalEntry: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            我为自己做的事 <span className="text-xs font-normal text-slate-500">(主体性行动)</span>
          </label>
          <textarea
            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm min-h-[80px]"
            placeholder="哪怕是一件小事（比如拒绝了一个不想去的聚会，或者吃了一顿自己想吃的饭）..."
            value={draft.actionTaken}
            onChange={(e) => onUpdateDraft({ actionTaken: e.target.value })}
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={onSubmit}
        disabled={isSubmitting || !draft.journalEntry}
        className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-white shadow-lg transition-all ${
          isSubmitting || !draft.journalEntry 
            ? 'bg-slate-300 cursor-not-allowed' 
            : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
        }`}
      >
        {isSubmitting ? (
          <span>正在分析并生成建议...</span>
        ) : (
          <>
            <Send size={18} />
            <span>完成今日记录</span>
          </>
        )}
      </button>

    </div>
  );
};

export default JournalEntry;
