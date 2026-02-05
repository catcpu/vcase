
import { GoogleGenAI, Type } from "@google/genai";
import { SimulationState, MedicalExplanation } from "../types";

const SYSTEM_INSTRUCTION = `你是一名血管外科医生和医学教育家，专注于静脉学。
你的目标是向普通人清晰简明地解释静脉曲张和血栓形成的机制。
解释请保持在80字以内。重点关注血流物理学和生理危险。
请务必使用简体中文回答。`;

export const fetchExplanation = async (state: SimulationState): Promise<MedicalExplanation> => {
  // 获取 API KEY
  const apiKey = process.env.API_KEY;
  
  // 如果 API KEY 不存在，返回友好的占位信息，而不是让应用崩溃
  if (!apiKey) {
    console.warn("未检测到 API_KEY，AI 讲解功能暂不可用。");
    return {
      title: "模拟演示模式",
      content: "当前处于离线/无 AI 模式。您可以点击右侧按钮观察下肢静脉在不同病理状态下的物理形态变化。",
      warningLevel: 'info'
    };
  }

  try {
    // 仅在调用时初始化，确保环境变量已注入
    const ai = new GoogleGenAI({ apiKey });
    const modelId = "gemini-3-flash-preview";
    
    let prompt = "";
    
    switch (state) {
      case SimulationState.NORMAL:
        prompt = "解释健康下肢静脉如何通过瓣膜对抗重力将血液泵回心脏。";
        break;
      case SimulationState.VARICOSE:
        prompt = "解释静脉曲张在结构上发生了什么（瓣膜功能失效、血管扩张、血液返流）。";
        break;
      case SimulationState.THROMBUS_FORMED:
        prompt = "解释静脉曲张中的血流缓慢（淤滞）如何导致血栓（凝块）形成。";
        break;
      case SimulationState.DETACHING:
        prompt = "解释血栓从静脉壁脱落（栓子）的瞬间力学机制。";
        break;
      case SimulationState.POST_EMBOLISM:
        prompt = "解释脱落的血栓随血流进入肺部导致肺栓塞（PE）的危险。语气要紧迫。";
        break;
      default:
        prompt = "解释静脉健康。";
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            warningLevel: { type: Type.STRING, enum: ['info', 'warning', 'critical'] }
          },
          required: ['title', 'content', 'warningLevel']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    
    return JSON.parse(text) as MedicalExplanation;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      title: "讲解加载失败",
      content: "无法连接到 AI 解析服务，请检查网络连接。您仍可继续进行交互模拟。",
      warningLevel: 'info'
    };
  }
};
