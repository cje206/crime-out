import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(`${process.env.NEXT_PUBLIC_API_KEY}`);

export async function isCrime(msg: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `${msg} 이 메세지가 피싱일 확률 숫자로만 대답해줘`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    if (text.trim().length <= 3) return `이 메세지가 피싱 메세지일 확률은 **약 ${text}%** 입니다.`;
    return text;
  } catch {
    return '사용량이 많아 오류가 발생하였습니다. 잠시 후 다시 시도해주세요.';
  }
}

export async function getExample() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `최근 피싱, 스미싱 사례 알려줘`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch {
    return '사용량이 많아 오류가 발생하였습니다. 잠시 후 다시 시도해주세요.';
  }
}

export async function useGemini(msg: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `피싱, 스미싱관련 : ${msg}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch {
    return '사용량이 많아 오류가 발생하였습니다. 잠시 후 다시 시도해주세요.';
  }
}
