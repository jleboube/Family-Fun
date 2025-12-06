import { GoogleGenAI, Type } from "@google/genai";
import { Question, WordChallenge, LogicPuzzle, EmojiChallenge, MathProblem } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");
  return new GoogleGenAI({ apiKey });
};

export const generateTriviaQuestions = async (count: number = 5): Promise<Question[]> => {
  const ai = getAiClient();
  const prompt = `Generate ${count} engaging, educational trivia questions suitable for ages 12 to 80.
  Topics should vary (History, Science, Geography, Pop Culture, Nature).
  Provide 4 multiple choice options for each.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ['text', 'options', 'correctAnswer', 'explanation']
          }
        }
      }
    });
    
    const text = response.text;
    if (!text) return [];
    
    const questions = JSON.parse(text) as Question[];
    return questions.map(q => ({ ...q, id: crypto.randomUUID() }));
  } catch (error) {
    console.error("Gemini Trivia Error:", error);
    return [
      {
        id: '1',
        text: "Which planet is known as the Red Planet?",
        options: ["Earth", "Mars", "Jupiter", "Venus"],
        correctAnswer: "Mars",
        explanation: "Iron oxide on the surface gives it a reddish appearance."
      }
    ];
  }
};

export const generateWordChallenge = async (): Promise<WordChallenge> => {
  const ai = getAiClient();
  const prompt = `Generate a single word for a word-guessing game.
  The word should be 5-8 letters long. Common enough for a 12 year old, but interesting.
  Provide a hint and a definition.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            hint: { type: Type.STRING },
            definition: { type: Type.STRING }
          },
          required: ['word', 'hint', 'definition']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data");
    return JSON.parse(text) as WordChallenge;
  } catch (error) {
    console.error("Gemini Word Error:", error);
    return {
      word: "GALAXY",
      hint: "A massive system of stars",
      definition: "A system of millions or billions of stars, together with gas and dust, held together by gravitational attraction."
    };
  }
};

export const generateLogicPuzzle = async (): Promise<LogicPuzzle> => {
  const ai = getAiClient();
  const prompt = `Generate a short, family-friendly logic riddle or sequence puzzle.
  It should take about 30-60 seconds to solve.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            answer: { type: Type.STRING },
            hint: { type: Type.STRING }
          },
          required: ['question', 'answer', 'hint']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data");
    return JSON.parse(text) as LogicPuzzle;
  } catch (error) {
    return {
      question: "What has to be broken before you can use it?",
      answer: "An egg",
      hint: "Breakfast item."
    };
  }
};

export const generateEmojiChallenge = async (): Promise<EmojiChallenge> => {
  const ai = getAiClient();
  const prompt = `Generate a popular movie title, idiom, or book title represented by 3-5 emojis.
  Include the category and a text hint.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            phrase: { type: Type.STRING },
            emojis: { type: Type.STRING },
            category: { type: Type.STRING },
            hint: { type: Type.STRING }
          },
          required: ['phrase', 'emojis', 'category', 'hint']
        }
      }
    });
    const text = response.text;
    if (!text) throw new Error("No data");
    return JSON.parse(text) as EmojiChallenge;
  } catch (error) {
    return {
      phrase: "Finding Nemo",
      emojis: "🔍 🐠 🌊",
      category: "Movie",
      hint: "A father searches for his son."
    };
  }
};

export const generateMathProblem = async (): Promise<MathProblem[]> => {
  const ai = getAiClient();
  const prompt = `Generate 3 math problems. 
  1. Easy (Basic arithmetic).
  2. Medium (Pre-algebra or sequence).
  3. Hard (Logic based math word problem).
  Return JSON array.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
             type: Type.OBJECT,
             properties: {
               question: { type: Type.STRING },
               answer: { type: Type.NUMBER },
               difficulty: { type: Type.STRING }
             },
             required: ['question', 'answer', 'difficulty']
          }
        }
      }
    });
    const text = response.text;
    if (!text) throw new Error("No data");
    return JSON.parse(text) as MathProblem[];
  } catch (error) {
    return [
      { question: "5 + 8 * 2", answer: 21, difficulty: "easy" },
      { question: "Solve for x: 2x - 4 = 10", answer: 7, difficulty: "medium" },
      { question: "If a train travels 60mph for 2.5 hours, how many miles did it go?", answer: 150, difficulty: "hard" }
    ];
  }
};