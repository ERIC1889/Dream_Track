import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 기본 진단 결과를 AI로 분석 (OpenAI Responses API 사용)
 * @param {Array} assessments - 기본 진단 응답 배열
 * @param {Object} userInfo - 사용자 정보
 * @returns {Promise<Object>} - 분석 결과
 */
export async function analyzePreliminaryAssessment(assessments, userInfo) {
  try {
    // 질문 번호와 답변을 input 형식으로 변환
    const questionAnswers = assessments.map((a) => ({
      question_no: a.question_no,
      question_text: a.question_text,
      answer:
        typeof a.answer === "string" ? a.answer : JSON.stringify(a.answer),
    }));

    // OpenAI Responses API 호출
    const response = await openai.responses.create({
      prompt: {
        id: "",
        version: "3",
      },
      input: JSON.stringify({
        user_name: userInfo.name || "학생",
        user_school: userInfo.school || "정보 없음",
        user_age: userInfo.age || "정보 없음",
        question_answers: questionAnswers,
      }),
    });

    // Responses API는 output_text 필드로 텍스트를 직접 제공
    if (!response.output_text) {
      console.error("응답에 output_text가 없습니다:", response);
      throw new Error("OpenAI API 응답에 output_text가 없습니다.");
    }

    const analysisText = response.output_text;
    console.log("AI 분석 완료, 텍스트 길이:", analysisText.length);

    // Markdown 형식 그대로 반환 (JSON 파싱 없이)
    return {
      success: true,
      analysis: {
        fullText: analysisText,
        // 필요한 경우 여기서 텍스트를 파싱하여 구조화된 데이터 생성
      },
      tokensUsed: response.usage,
    };
  } catch (error) {
    console.error("AI 분석 오류:", error);
    throw new Error("AI 분석 중 오류가 발생했습니다: " + error.message);
  }
}

/**
 * 분석 결과를 바탕으로 심층 질문 생성 (OpenAI Responses API 사용)
 * @param {Object} analysis - AI 분석 결과
 * @param {Array} preliminaryAssessments - 기본 진단 응답
 * @returns {Promise<Object>} - 갭 분석 및 심층 질문
 */
export async function generateDeepQuestions(analysis, preliminaryAssessments) {
  try {
    // 기본 질문 분석 결과 전문을 input으로 전달
    const response = await openai.responses.create({
      prompt: {
        id: "",
        version: "1",
      },
      input: JSON.stringify({
        // 기본 진단 분석 결과 전문
        analysis_result: {
          strengths: analysis.strengths,
          interests: analysis.interests,
          career_direction: analysis.career_direction,
          areas_to_improve: analysis.areas_to_improve,
          personality_traits: analysis.personality_traits,
          recommended_fields: analysis.recommended_fields,
          key_insights: analysis.key_insights,
        },
        // 참고용 기본 진단 응답 (일부)
        preliminary_answers: preliminaryAssessments.slice(0, 10).map((a) => ({
          question_no: a.question_no,
          question_text: a.question_text,
          answer:
            typeof a.answer === "string" ? a.answer : JSON.stringify(a.answer),
        })),
      }),
    });

    // 응답에서 결과 추출
    if (!response.output_text) {
      console.error("응답에 output_text가 없습니다:", response);
      throw new Error("OpenAI API 응답에 output_text가 없습니다.");
    }

    const responseText = response.output_text;
    console.log("심층 질문 생성 완료, 텍스트 길이:", responseText.length);

    // JSON 파싱 시도, 실패하면 텍스트 그대로 사용
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.log("JSON 파싱 실패, 텍스트 형식으로 처리");
      // Markdown 텍스트를 간단히 파싱하여 구조 생성
      responseData = {
        gapSummary: responseText.substring(0, 500) + "...",
        deepDiveQuestions: [],
      };
    }

    return {
      success: true,
      gapSummary: responseData.gapSummary || "",
      deepDiveQuestions: responseData.deepDiveQuestions || [],
      tokensUsed: response.usage,
    };
  } catch (error) {
    console.error("심층 질문 생성 오류:", error);
    throw new Error("심층 질문 생성 중 오류가 발생했습니다: " + error.message);
  }
}

/**
 * 로드맵 생성 (OpenAI Responses API 사용)
 * @param {Object} analysisResult - 기본 진단 분석 결과
 * @param {Object} deepQuestionData - 심층 질문 데이터 (gap summary + questions + answers)
 * @returns {Promise<Object>} - 생성된 로드맵
 */
export async function generateRoadmap(analysisResult, deepQuestionData) {
  try {
    // 로드맵 생성 API 호출
    const response = await openai.responses.create({
      prompt: {
        id: "",
        version: "6",
      },
      input: JSON.stringify({
        // 기본 진단 분석 결과
        analysis_result: {
          strengths: analysisResult.strengths,
          interests: analysisResult.interests,
          career_direction: analysisResult.career_direction,
          areas_to_improve: analysisResult.areas_to_improve,
          personality_traits: analysisResult.personality_traits,
          recommended_fields: analysisResult.recommended_fields,
          key_insights: analysisResult.key_insights,
        },
        // 갭 분석
        gap_summary: deepQuestionData.gapSummary,
        // 심층 질문 및 답변
        deep_questions_with_answers: deepQuestionData.deepDiveQuestions.map(
          (q) => ({
            question_id: q.id,
            question: q.question,
            answer: q.answer || "",
          })
        ),
      }),
    });

    // 응답에서 로드맵 추출
    if (!response.output_text) {
      console.error("응답에 output_text가 없습니다:", response);
      throw new Error("OpenAI API 응답에 output_text가 없습니다.");
    }

    const roadmapText = response.output_text;
    console.log("로드맵 생성 완료, 텍스트 길이:", roadmapText.length);

    // JSON 파싱 시도, 실패하면 텍스트 그대로 사용
    let roadmapData;
    try {
      roadmapData = JSON.parse(roadmapText);
    } catch (e) {
      console.log("JSON 파싱 실패, 텍스트 형식으로 처리");
      roadmapData = {
        title: "학습 로드맵",
        description: roadmapText.substring(0, 200) + "...",
        milestones: [],
      };
    }

    return {
      success: true,
      roadmap: roadmapData,
      tokensUsed: response.usage,
    };
  } catch (error) {
    console.error("로드맵 생성 오류:", error);
    throw new Error("로드맵 생성 중 오류가 발생했습니다: " + error.message);
  }
}

/**
 * 퀴즈 생성 (OpenAI Responses API 사용)
 * @param {Object} analysisResult - 기본 진단 분석 결과
 * @param {Object} roadmapData - 로드맵 데이터
 * @param {Object} deepQuestionData - 심층 질문 데이터
 * @returns {Promise<Object>} - 생성된 퀴즈
 */
export async function generateQuiz(
  analysisResult,
  roadmapData,
  deepQuestionData
) {
  try {
    // 퀴즈 생성 API 호출
    const response = await openai.responses.create({
      prompt: {
        id: "",
        version: "6", // 새 버전으로 업데이트
      },
      input: JSON.stringify({
        // 기본 진단 분석 결과
        analysis_result: {
          strengths: analysisResult.strengths,
          interests: analysisResult.interests,
          career_direction: analysisResult.career_direction,
          areas_to_improve: analysisResult.areas_to_improve,
          personality_traits: analysisResult.personality_traits,
          recommended_fields: analysisResult.recommended_fields,
          key_insights: analysisResult.key_insights,
        },
        // 심층 분석 (갭 요약)
        gap_summary: deepQuestionData.gapSummary || "",
        // 로드맵 정보
        roadmap: {
          title: roadmapData.title,
          description: roadmapData.description,
          milestones:
            roadmapData.milestones?.map((m) => ({
              title: m.title,
              category: m.category,
              description: m.description,
            })) || [],
        },
      }),
    });

    // 응답에서 퀴즈 추출
    if (!response.output_text) {
      console.error("응답에 output_text가 없습니다:", response);
      throw new Error("OpenAI API 응답에 output_text가 없습니다.");
    }

    const quizText = response.output_text;
    console.log("퀴즈 생성 완료, 텍스트 길이:", quizText.length);

    // JSON 파싱 시도, 실패하면 텍스트 그대로 사용
    let quizData;
    try {
      quizData = JSON.parse(quizText);
    } catch (e) {
      console.log("JSON 파싱 실패, 텍스트 형식으로 처리");
      quizData = {
        questions: [],
      };
    }

    return {
      success: true,
      quiz: quizData,
      tokensUsed: response.usage,
    };
  } catch (error) {
    console.error("퀴즈 생성 오류:", error);
    throw new Error("퀴즈 생성 중 오류가 발생했습니다: " + error.message);
  }
}

export { openai };
