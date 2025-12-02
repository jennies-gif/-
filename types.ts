
export interface DailyTask {
  id: string;
  text: string;
  completed: boolean;
  category: 'voicing' | 'decision' | 'self-worth' | 'reflection';
  userResponse?: string; // User's specific note/answer for this task
}

export interface DailyDraft {
  mood: number;
  journalEntry: string;
  actionTaken: string;
}

export interface DayEntry {
  date: string;
  mood: number; // 1-10
  tasks: DailyTask[];
  journalEntry: string; // "My thoughts/feelings today"
  actionTaken: string; // "What did I do for myself?"
  aiFeedback: string | null;
  nextDayPlan: DailyTask[] | null;
  selfWorthScore: number; // Calculated or estimated sense of worth
}

export interface UserState {
  history: DayEntry[];
  currentDate: string;
  isOnboarding: boolean;
}

export const APP_CONCEPT = `
核心概念：主体性 (Agency)
定义：我的感受和想法是最重要的；我知道我要什么；我是我人生的舵手。
对立面：自私 (损人利己) vs 主体性 (利己不损人)。
弱主体性表现：觉得自己无价值、无法说出真实想法、害怕外部评价、迎合他人、缺乏自我觉察。
增强方法：
1. 重新认识自己：找到内在价值锚点，练习发声。
2. 增加自我价值点：建立其他维度的价值。
3. 打破对“外部评判”的恐惧：区分观点与事实，消解权威（父母/恋人）的光环。
`;
