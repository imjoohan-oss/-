import { GoogleGenAI } from "@google/genai";
import { marked } from 'marked';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY is not set. Using a placeholder. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function getFutureForecast(
  dailyCounts: { [date: string]: number },
  monthlyGoals: { [month: string]: number },
  holidays: string[]
): Promise<string> {
    if (!API_KEY) {
        return Promise.resolve("<h2>AI 예측 비활성화</h2><p>API 키가 설정되지 않았습니다. AI 기반 리포트를 보려면 환경 변수를 설정해주세요.</p>");
    }

    const model = "gemini-2.5-flash";
    
    // Get data from the last 90 days for recent trends
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const recentCounts = Object.entries(dailyCounts).filter(([date]) => new Date(date) >= ninetyDaysAgo)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {} as { [date: string]: number });
      
    const nextMonthDate = new Date();
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
    const nextMonthStr = `${nextMonthDate.getFullYear()}년 ${nextMonthDate.getMonth() + 1}월`;


    const prompt = `
      당신은 대한민국 우체국 택배의 물류 데이터 분석 및 예측 전문가입니다.
      다음은 한 택배 기사님의 지난 몇 달간의 배송 실적 데이터입니다. 이 데이터를 심층적으로 분석하여, **다음 달(${nextMonthStr})**의 배송량을 예측하고 전문가적인 조언을 담은 리포트를 작성해주세요.

      ### 입력 데이터
      - **일별 배송 완료 건수 (최근 90일)**: ${JSON.stringify(recentCounts)}
      - **월별 목표 설정**: ${JSON.stringify(monthlyGoals)}
      - **사용자 지정 휴무일**: ${JSON.stringify(holidays)} (참고: 일요일, 월요일은 기본 휴무일일 수 있습니다.)

      ### 리포트 작성 형식 (마크다운 사용)
      1.  **종합 예측**: 다음 달의 예상 총 배송량과 일 평균 배송량을 구체적인 숫자로 제시해주세요.
      2.  **주간별 상세 예측**: 다음 달을 4~5주로 나누어, 각 주간의 예상 배송량 흐름을 예측해주세요. (예: 월초 효과, 월말 물량 증가, 명절 전후 등)
      3.  **예측 핵심 근거**:
          *   과거 데이터(월별, 요일별 패턴)에서 발견한 주요 추세를 설명해주세요.
          *   휴무일(특히 연휴)이 다음 영업일 배송량에 미칠 영향을 분석해주세요.
          *   최근 목표 달성률이 다음 달 실적에 어떤 영향을 줄 수 있는지 언급해주세요.
      4.  **전략적 제언**:
          *   분석 결과를 바탕으로 다음 달에 설정하면 좋을 현실적인 '일일 목표 배송 건수'를 추천해주세요.
          *   물량이 많을 것으로 예상되는 특정 날짜나 주간을 언급하고, 이에 대비하기 위한 조언을 해주세요.

      ### 최종 결과물 가이드
      - 전체 내용을 H2 제목 "미래 예측 리포트"로 시작해주세요.
      - 결과는 친절하고 명확한 톤으로, 실제 택배 기사님께 도움이 될 수 있도록 작성해주세요.
      - 모든 내용은 한국어로 작성해주세요.
    `;
  
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
    
        const rawText = response.text;
        const html = await marked.parse(rawText);
        return html;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate insights from Gemini API.");
    }
}
