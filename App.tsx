
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import JournalEntry from './components/JournalEntry';
import LoginScreen from './components/LoginScreen';
import { DayEntry, DailyTask, DailyDraft } from './types';
import { generateDailyFeedbackAndPlan, generateInitialPlan } from './services/geminiService';

const SESSION_KEY = 'agency_builder_session_user';
const DATA_KEY_PREFIX = 'agency_builder_data_v1_';

const getTodayDate = () => new Date().toLocaleDateString('zh-CN');

// Default empty draft
const INITIAL_DRAFT: DailyDraft = {
  mood: 5,
  journalEntry: '',
  actionTaken: ''
};

function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'journal' | 'insights'>('dashboard');
  
  const [history, setHistory] = useState<DayEntry[]>([]);
  
  // Real-time state (Auto-saved)
  const [todayTasks, setTodayTasks] = useState<DailyTask[]>([]);
  const [todayDraft, setTodayDraft] = useState<DailyDraft>(INITIAL_DRAFT);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // 1. Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem(SESSION_KEY);
    if (savedUser) {
      setCurrentUser(savedUser);
    }
    if (!savedUser) {
      setInitialized(true); 
    }
  }, []);

  // 2. Load User Data when currentUser changes
  useEffect(() => {
    if (!currentUser) return;

    const storageKey = `${DATA_KEY_PREFIX}${currentUser}`;
    const savedData = localStorage.getItem(storageKey);

    const loadData = async () => {
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setHistory(parsed.history || []);

        // Logic to determine today's tasks
        const lastEntry = parsed.history[parsed.history.length - 1];
        const today = getTodayDate();

        // Restore draft if available
        if (parsed.draft) {
          setTodayDraft(parsed.draft);
        } else {
          setTodayDraft(INITIAL_DRAFT);
        }

        if (lastEntry && lastEntry.nextDayPlan && lastEntry.date !== today) {
          // It's a new day, use the plan generated yesterday
          // Important: Only reset tasks if we haven't already started tracking today (checked via saved tasks)
          if (parsed.lastTaskDate === today && parsed.todayTasks) {
             setTodayTasks(parsed.todayTasks);
          } else {
             // New day fresh start
             setTodayTasks(lastEntry.nextDayPlan);
             setTodayDraft(INITIAL_DRAFT); // Clear draft for new day
          }
        } else if (lastEntry && lastEntry.date === today) {
           // We are still in the same day (user completed it)
           // If completed, tasks are in history. But we might want to show them.
           // Usually UI handles "Submitted" state.
           setTodayTasks(parsed.todayTasks || []);
        } else {
          // Load saved tasks for today if exist
          if (parsed.todayTasks && parsed.todayTasks.length > 0) {
            setTodayTasks(parsed.todayTasks);
          } else {
             // Fallback/First time
             const tasks = await generateInitialPlan();
             setTodayTasks(tasks);
          }
        }
      } else {
        // First time for this specific user
        setHistory([]);
        setTodayDraft(INITIAL_DRAFT);
        const tasks = await generateInitialPlan();
        setTodayTasks(tasks);
      }
      setInitialized(true);
    };

    loadData();
  }, [currentUser]);

  // 3. Save Data whenever it changes (Real-time Auto-save)
  useEffect(() => {
    if (currentUser && initialized) {
      const storageKey = `${DATA_KEY_PREFIX}${currentUser}`;
      const today = getTodayDate();
      
      const dataToSave = {
        history,
        todayTasks,
        draft: todayDraft,
        lastTaskDate: today // Track date to know when to reset tasks vs restore
      };
      
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    }
  }, [history, todayTasks, todayDraft, currentUser, initialized]);

  const handleLogin = (email: string) => {
    localStorage.setItem(SESSION_KEY, email);
    setCurrentUser(email);
    setInitialized(false); 
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    setHistory([]);
    setTodayTasks([]);
    setTodayDraft(INITIAL_DRAFT);
    setActiveTab('dashboard');
  };

  // Handlers for Real-time updates from JournalEntry
  const handleUpdateDraft = (newDraft: Partial<DailyDraft>) => {
    setTodayDraft(prev => ({ ...prev, ...newDraft }));
  };

  const handleUpdateTasks = (newTasks: DailyTask[]) => {
    setTodayTasks(newTasks);
  };

  const handleDaySubmit = async () => {
    setIsSubmitting(true);
    const todayStr = getTodayDate();

    const currentEntry: DayEntry = {
      date: todayStr,
      mood: todayDraft.mood,
      tasks: todayTasks,
      journalEntry: todayDraft.journalEntry,
      actionTaken: todayDraft.actionTaken,
      aiFeedback: null,
      nextDayPlan: null,
      selfWorthScore: todayDraft.mood
    };

    const { feedback, nextTasks } = await generateDailyFeedbackAndPlan(currentEntry, history);

    const completedEntry: DayEntry = {
      ...currentEntry,
      aiFeedback: feedback,
      nextDayPlan: nextTasks
    };

    setHistory(prev => [...prev, completedEntry]);
    
    // Clear draft after successful submission? 
    // Usually yes, but tasks for "tomorrow" will replace `todayTasks` on next refresh or day change.
    // We keep `todayTasks` as is for now so user can see them if they want, but UI hides journal.
    
    setIsSubmitting(false);
    setActiveTab('dashboard');
  };

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (!initialized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-emerald-50 text-emerald-800">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 w-32 bg-emerald-200 rounded mb-2"></div>
          <span className="text-sm">正在加载数据...</span>
        </div>
      </div>
    );
  }

  const hasSubmittedToday = history.some(h => h.date === getTodayDate());

  const renderJournal = () => {
    if (hasSubmittedToday) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mb-4 shadow-sm">
             ✨
           </div>
           <h2 className="text-xl font-bold text-slate-800">今天已完成打卡</h2>
           <p className="text-slate-500 max-w-xs">做得好！今天的自我觉察练习已结束。请去看板查看AI的反馈。</p>
           <button 
             onClick={() => setActiveTab('dashboard')}
             className="text-emerald-600 font-semibold hover:underline bg-emerald-50 px-4 py-2 rounded-lg"
           >
             查看反馈
           </button>
        </div>
      );
    }
    return (
      <JournalEntry 
        date={getTodayDate()} 
        tasks={todayTasks} 
        draft={todayDraft}
        onUpdateDraft={handleUpdateDraft}
        onUpdateTasks={handleUpdateTasks}
        onSubmit={handleDaySubmit}
        isSubmitting={isSubmitting}
      />
    );
  };

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      userEmail={currentUser}
      onLogout={handleLogout}
    >
      {activeTab === 'dashboard' && <Dashboard history={history} />}
      {activeTab === 'journal' && renderJournal()}
      {activeTab === 'insights' && <Dashboard history={history} />}
    </Layout>
  );
}

export default App;
