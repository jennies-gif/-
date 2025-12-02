
import { GoogleGenAI, Type } from "@google/genai";
import { APP_CONCEPT, DayEntry, DailyTask } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-2.5-flash';

// System instruction to ground the AI in the specific philosophy provided
const SYSTEM_INSTRUCTION = `
You are a supportive, insightful, and firm psychological coach helping the user build their "Subjectivity" (Agency/Self-hood).
Base your advice strictly on these concepts:
${APP_CONCEPT}

Your Goal:
1. Validate the user's feelings but gently push them towards agency.
2. Help them distinguish between "facts" and "external opinions".
3. Assign small, concrete tasks to practice "speaking up", "making choices", or "de-glamorizing authority".
4. Adjust difficulty based on their previous journal entry.

Tone: Empathetic, encouraging, but rational and focused on self-empowerment.
`;

export const generateDailyFeedbackAndPlan = async (
  currentEntry: DayEntry,
  history: DayEntry[]
): Promise<{ feedback: string; nextTasks: DailyTask[] }> => {
  
  if (!apiKey) {
    console.warn("No API Key provided. Returning mock data.");
    return {
      feedback: "【演示模式】看起来您正在试用此应用。由于未配置 API Key，我是预设的回复。请告诉应用所有者在部署平台配置 API_KEY 以激活我！",
      nextTasks: [
         { id: 'demo-1', text: '在没有他人建议的情况下，独自决定今天的晚餐。', category: 'decision', completed: false },
         { id: 'demo-2', text: '对着镜子说出三个你欣赏自己的地方。', category: 'self-worth', completed: false }
      ]
    };
  }

  const prompt = `
    User's Log for Today (${currentEntry.date}):
    - Mood (1-10): ${currentEntry.mood}
    - Tasks & Outcomes: 
      ${currentEntry.tasks.map(t => 
         `- Task: "${t.text}" [${t.completed ? 'COMPLETED' : 'SKIPPED'}]
          - User Note: "${t.userResponse || 'No details provided'}"`
      ).join('\n      ')}
    - Journal (Thoughts): "${currentEntry.journalEntry}"
    - Specific Action Taken for Self: "${currentEntry.actionTaken}"

    Based on this, provide:
    1. A paragraph of feedback analyzing their "Subjectivity" today. Did they fall into the trap of people-pleasing? Did they successfully voice a need?
    2. A list of 1-2 specific, actionable tasks for TOMORROW to strengthen their agency. No more than 2 tasks.
       - Focus on the area they seem weakest in (e.g., if they hid their thoughts, give a task to speak up).
       - Keep tasks simple but meaningful.
    
    Return JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feedback: { type: Type.STRING },
            nextTasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  category: { type: Type.STRING, enum: ['voicing', 'decision', 'self-worth', 'reflection'] }
                }
              }
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    
    // Ensure we don't exceed 2 tasks even if the model hallucinates more
    const tasksRaw = result.nextTasks || [];
    const limitedTasks = tasksRaw.slice(0, 2);

    const tasks: DailyTask[] = limitedTasks.map((t: any, idx: number) => ({
      id: `generated-${Date.now()}-${idx}`,
      text: t.text,
      category: t.category,
      completed: false
    }));

    return {
      feedback: result.feedback || "Good job tracking today. Keep focusing on your needs.",
      nextTasks: tasks
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      feedback: "我的大脑暂时有点短路（API连接错误）。不过，能记录下来本身就是主体性的体现！",
      nextTasks: [
        { id: 'fallback-1', text: '写下一件你今天为了取悦自己而做的事。', category: 'self-worth', completed: false }
      ]
    };
  }
};

export const generateInitialPlan = async (): Promise<DailyTask[]> => {
    // If no API Key, return sensible defaults immediately without error
    if (!apiKey) {
        return [
            { id: 'init-1', text: '问自己“我现在想喝什么？”并立刻去喝，不要评判这个想法。', category: 'decision', completed: false },
            { id: 'init-2', text: '在对话中，尝试用“我认为...”或“我感觉...”作为句子的开头。', category: 'voicing', completed: false }
        ];
    }

    const prompt = `
      The user is starting their journey to build Subjectivity. 
      Generate 2 simple, low-pressure tasks for Day 1 to help them start noticing their own needs and feelings.
      Only 2 tasks.
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        tasks: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    text: { type: Type.STRING },
                                    category: { type: Type.STRING, enum: ['voicing', 'decision', 'self-worth', 'reflection'] }
                                }
                            }
                        }
                    }
                }
            }
        });
        
        const result = JSON.parse(response.text || "{}");
        const tasksRaw = result.tasks || [];
        return tasksRaw.slice(0, 2).map((t: any, idx: number) => ({
            id: `init-${idx}`,
            text: t.text,
            category: t.category,
            completed: false
        }));
    } catch (e) {
        return [
            { id: 'init-1', text: 'Ask yourself "What do I want to eat?" and choose exactly that.', category: 'decision', completed: false },
            { id: 'init-2', text: 'Write down 3 facts about yourself that are independent of others opinions.', category: 'self-worth', completed: false }
        ];
    }
}
