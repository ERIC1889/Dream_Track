import express from "express";
import { pool } from "../config/db.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  analyzePreliminaryAssessment,
  generateDeepQuestions,
  generateRoadmap,
} from "../utils/openai.js";

const router = express.Router();

/**
 * POST /api/analysis/analyze
 * 기본 진단 결과를 AI로 분석
 */
router.post("/analyze", authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const userId = req.user.id;

    // 사용자 정보 조회
    const [users] = await connection.query(
      "SELECT id, name, school, dob FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "사용자를 찾을 수 없습니다.",
      });
    }

    const user = users[0];

    // 나이 계산
    let age = null;
    if (user.dob) {
      const today = new Date();
      const birthDate = new Date(user.dob);
      age = today.getFullYear() - birthDate.getFullYear();
    }

    // 기본 진단 결과 조회
    const [preliminaryResults] = await connection.query(
      "SELECT id FROM preliminary_results WHERE user_id = ? AND is_completed = TRUE",
      [userId]
    );

    if (preliminaryResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "완료된 기본 진단 결과가 없습니다.",
      });
    }

    const preliminaryResultId = preliminaryResults[0].id;

    // 기본 진단 응답 조회
    const [assessments] = await connection.query(
      `SELECT question_no, question_type, question_text, answer
       FROM preliminary_assessments
       WHERE user_id = ?
       ORDER BY question_no ASC`,
      [userId]
    );

    if (assessments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "기본 진단 응답이 없습니다.",
      });
    }

    // 트랜잭션 시작 (동시 요청 방지)
    await connection.beginTransaction();

    // 기존 분석이 있으면 삭제 (트랜잭션 내에서 처리)
    await connection.query("DELETE FROM ai_analysis WHERE user_id = ?", [
      userId,
    ]);
    console.log("분석 생성 시작 (기존 데이터 삭제 완료)");

    // AI로 분석 수행
    console.log("AI 분석 시작...");
    const analysisResult = await analyzePreliminaryAssessment(assessments, {
      name: user.name,
      school: user.school,
      age,
    });

    if (!analysisResult.success) {
      throw new Error("AI 분석에 실패했습니다.");
    }

    const analysis = analysisResult.analysis;

    // fullText에서 텍스트 추출
    const fullText = analysis.fullText || "";

    // JSON 데이터 준비 (MySQL JSON 컬럼에 저장할 데이터)
    const analysisJsonData = JSON.stringify({
      fullText: fullText,
      timestamp: new Date().toISOString(),
    });

    console.log("저장할 JSON 데이터 길이:", analysisJsonData.length);

    // 분석 결과 저장 (트랜잭션은 이미 시작됨)
    const [insertResult] = await connection.query(
      `INSERT INTO ai_analysis 
       (user_id, preliminary_result_id, analysis_data, strengths, interests, career_direction, areas_to_improve)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        preliminaryResultId,
        analysisJsonData, // 유효한 JSON 문자열
        "", // strengths는 텍스트에서 추출 가능
        "", // interests는 텍스트에서 추출 가능
        "", // career_direction은 텍스트에서 추출 가능
        "", // areas_to_improve는 텍스트에서 추출 가능
      ]
    );

    await connection.commit();

    console.log("AI 분석 완료 및 저장 성공");

    res.status(200).json({
      success: true,
      message: "AI 분석이 완료되었습니다.",
      data: {
        analysisId: insertResult.insertId,
        analysis,
        tokensUsed: analysisResult.tokensUsed,
        isNew: true,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("AI 분석 오류:", error);
    res.status(500).json({
      success: false,
      message: error.message || "AI 분석 중 오류가 발생했습니다.",
    });
  } finally {
    connection.release();
  }
});

/**
 * GET /api/analysis/result
 * 사용자의 분석 결과 조회
 */
router.get("/result", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [analysis] = await pool.query(
      `SELECT * FROM ai_analysis WHERE user_id = ?`,
      [userId]
    );

    if (analysis.length === 0) {
      return res.status(404).json({
        success: false,
        message: "분석 결과가 없습니다.",
      });
    }

    const result = analysis[0];
    const analysisData =
      typeof result.analysis_data === "string"
        ? JSON.parse(result.analysis_data)
        : result.analysis_data;

    res.status(200).json({
      success: true,
      data: {
        analysisId: result.id,
        analysis: analysisData,
        createdAt: result.created_at,
      },
    });
  } catch (error) {
    console.error("분석 결과 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "분석 결과 조회 중 오류가 발생했습니다.",
    });
  }
});

/**
 * POST /api/analysis/generate-deep-questions
 * 분석 결과를 바탕으로 심층 질문 생성 (갭 분석 포함)
 */
router.post("/generate-deep-questions", authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const userId = req.user.id;

    // 분석 결과 조회
    const [analysisResults] = await connection.query(
      "SELECT * FROM ai_analysis WHERE user_id = ?",
      [userId]
    );

    if (analysisResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "먼저 기본 진단 분석을 완료해야 합니다.",
      });
    }

    const analysisRecord = analysisResults[0];
    const analysis =
      typeof analysisRecord.analysis_data === "string"
        ? JSON.parse(analysisRecord.analysis_data)
        : analysisRecord.analysis_data;

    // 기존 심층 질문 확인
    const [existingQuestions] = await connection.query(
      "SELECT * FROM deep_questions WHERE user_id = ? ORDER BY question_id ASC",
      [userId]
    );

    if (existingQuestions.length > 0) {
      // 기존 결과 조회
      const [existingResults] = await connection.query(
        "SELECT gap_summary FROM deep_results WHERE user_id = ?",
        [userId]
      );

      // 기존 질문 반환
      return res.status(200).json({
        success: true,
        message: "기존 심층 질문을 반환합니다.",
        data: {
          gapSummary:
            existingResults.length > 0 ? existingResults[0].gap_summary : "",
          deepDiveQuestions: existingQuestions.map((q) => ({
            id: q.question_id,
            question: q.question_text,
            answer: q.answer || "",
          })),
          isNew: false,
        },
      });
    }

    // 기본 진단 응답 조회 (context 제공)
    const [preliminaryAssessments] = await connection.query(
      `SELECT question_text, answer
       FROM preliminary_assessments
       WHERE user_id = ?
       ORDER BY question_no ASC`,
      [userId]
    );

    // AI로 심층 질문 생성
    console.log("심층 질문 생성 시작...");
    const questionsResult = await generateDeepQuestions(
      analysis,
      preliminaryAssessments
    );

    if (!questionsResult.success) {
      throw new Error("심층 질문 생성에 실패했습니다.");
    }

    const { gapSummary, deepDiveQuestions } = questionsResult;

    // 심층 질문 저장
    await connection.beginTransaction();

    for (const question of deepDiveQuestions) {
      await connection.query(
        `INSERT INTO deep_questions 
         (user_id, analysis_id, question_id, question_text)
         VALUES (?, ?, ?, ?)`,
        [userId, analysisRecord.id, question.id, question.question]
      );
    }

    // deep_results에 갭 분석 저장
    await connection.query(
      `INSERT INTO deep_results 
       (user_id, analysis_id, gap_summary, is_completed)
       VALUES (?, ?, ?, FALSE)
       ON DUPLICATE KEY UPDATE 
       gap_summary = ?,
       analysis_id = ?`,
      [userId, analysisRecord.id, gapSummary, gapSummary, analysisRecord.id]
    );

    await connection.commit();

    console.log("심층 질문 생성 및 저장 완료");

    res.status(200).json({
      success: true,
      message: "심층 질문이 생성되었습니다.",
      data: {
        gapSummary,
        deepDiveQuestions,
        tokensUsed: questionsResult.tokensUsed,
        isNew: true,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("심층 질문 생성 오류:", error);
    res.status(500).json({
      success: false,
      message: error.message || "심층 질문 생성 중 오류가 발생했습니다.",
    });
  } finally {
    connection.release();
  }
});

/**
 * GET /api/analysis/deep-questions
 * 사용자의 심층 질문 조회
 */
router.get("/deep-questions", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [questions] = await pool.query(
      "SELECT * FROM deep_questions WHERE user_id = ? ORDER BY question_id ASC",
      [userId]
    );

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "심층 질문이 없습니다.",
      });
    }

    // gap_summary 조회
    const [results] = await pool.query(
      "SELECT gap_summary FROM deep_results WHERE user_id = ?",
      [userId]
    );

    res.status(200).json({
      success: true,
      data: {
        gapSummary: results.length > 0 ? results[0].gap_summary : "",
        deepDiveQuestions: questions.map((q) => ({
          id: q.question_id,
          question: q.question_text,
          answer: q.answer || "",
        })),
      },
    });
  } catch (error) {
    console.error("심층 질문 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "심층 질문 조회 중 오류가 발생했습니다.",
    });
  }
});

/**
 * POST /api/analysis/submit-deep-answer
 * 심층 질문 개별 답변 제출
 */
router.post("/submit-deep-answer", authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const userId = req.user.id;
    const { questionId, answer } = req.body;

    if (!questionId || !answer) {
      return res.status(400).json({
        success: false,
        message: "질문 ID와 답변이 필요합니다.",
      });
    }

    console.log(`📝 답변 제출: user_id=${userId}, question_id=${questionId}`);

    // 해당 질문에 답변 업데이트
    const [result] = await connection.query(
      `UPDATE deep_questions 
       SET answer = ?, answered_at = NOW()
       WHERE user_id = ? AND question_id = ?`,
      [answer, userId, questionId]
    );

    console.log(`✅ UPDATE 결과: affectedRows=${result.affectedRows}`);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "해당 질문을 찾을 수 없습니다.",
      });
    }

    // 모든 질문이 답변되었는지 확인
    const [questions] = await connection.query(
      "SELECT COUNT(*) as total, SUM(CASE WHEN answer IS NOT NULL THEN 1 ELSE 0 END) as answered FROM deep_questions WHERE user_id = ?",
      [userId]
    );

    // 타입 변환 (MySQL은 숫자를 문자열이나 BigInt로 반환할 수 있음)
    const total = Number(questions[0].total);
    const answered = Number(questions[0].answered);
    const allAnswered = total > 0 && total === answered;

    console.log(`📊 답변 현황: ${answered}/${total} (완료: ${allAnswered})`);
    console.log(
      `🔍 타입 체크: total=${typeof questions[0]
        .total}, answered=${typeof questions[0].answered}`
    );

    // 모두 답변된 경우 deep_results 업데이트
    if (allAnswered) {
      const [updateResult] = await connection.query(
        `UPDATE deep_results 
         SET is_completed = TRUE, completed_at = NOW()
         WHERE user_id = ?`,
        [userId]
      );
      console.log(
        `🎉 deep_results 업데이트 완료! affectedRows=${updateResult.affectedRows}`
      );
    }

    res.status(200).json({
      success: true,
      message: "답변이 저장되었습니다.",
      data: {
        questionId,
        allAnswered,
      },
    });
  } catch (error) {
    console.error("답변 제출 오류:", error);
    res.status(500).json({
      success: false,
      message: error.message || "답변 제출 중 오류가 발생했습니다.",
    });
  } finally {
    connection.release();
  }
});

/**
 * GET /api/analysis/deep-question/:questionId
 * 특정 심층 질문 조회
 */
router.get(
  "/deep-question/:questionId",
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const questionId = parseInt(req.params.questionId);

      const [questions] = await pool.query(
        "SELECT * FROM deep_questions WHERE user_id = ? AND question_id = ?",
        [userId, questionId]
      );

      if (questions.length === 0) {
        return res.status(404).json({
          success: false,
          message: "질문을 찾을 수 없습니다.",
        });
      }

      const question = questions[0];

      res.status(200).json({
        success: true,
        data: {
          id: question.question_id,
          question: question.question_text,
          answer: question.answer || "",
        },
      });
    } catch (error) {
      console.error("질문 조회 오류:", error);
      res.status(500).json({
        success: false,
        message: "질문 조회 중 오류가 발생했습니다.",
      });
    }
  }
);

/**
 * POST /api/analysis/generate-roadmap
 * 로드맵 생성 (기본 진단 분석 + 심층 질문 답변 기반)
 */
router.post("/generate-roadmap", authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const userId = req.user.id;

    // 기본 진단 분석 결과 조회
    const [analysisResults] = await connection.query(
      "SELECT * FROM ai_analysis WHERE user_id = ?",
      [userId]
    );

    if (analysisResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "기본 진단 분석 결과가 없습니다.",
      });
    }

    const analysisRecord = analysisResults[0];
    const analysisResult =
      typeof analysisRecord.analysis_data === "string"
        ? JSON.parse(analysisRecord.analysis_data)
        : analysisRecord.analysis_data;

    // 심층 진단 결과 조회
    const [deepResults] = await connection.query(
      "SELECT * FROM deep_results WHERE user_id = ? AND is_completed = TRUE",
      [userId]
    );

    if (deepResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "완료된 심층 진단이 없습니다.",
      });
    }

    const deepResult = deepResults[0];

    // 심층 질문 및 답변 조회
    const [deepQuestions] = await connection.query(
      "SELECT question_id, question_text, answer FROM deep_questions WHERE user_id = ? ORDER BY question_id ASC",
      [userId]
    );

    if (deepQuestions.some((q) => !q.answer)) {
      return res.status(400).json({
        success: false,
        message: "모든 심층 질문에 답변해야 로드맵을 생성할 수 있습니다.",
      });
    }

    // 기존 로드맵 확인
    const [existingRoadmaps] = await connection.query(
      "SELECT id, roadmap_data, created_at FROM roadmaps WHERE user_id = ?",
      [userId]
    );

    if (existingRoadmaps.length > 0) {
      // 기존 로드맵 반환
      const existingRoadmap = existingRoadmaps[0];
      const roadmapData =
        typeof existingRoadmap.roadmap_data === "string"
          ? JSON.parse(existingRoadmap.roadmap_data)
          : existingRoadmap.roadmap_data;

      return res.status(200).json({
        success: true,
        message: "기존 로드맵을 반환합니다.",
        data: {
          roadmap: roadmapData,
          isNew: false,
          createdAt: existingRoadmap.created_at,
        },
      });
    }

    // 로드맵 생성을 위한 데이터 준비
    const deepQuestionData = {
      gapSummary: deepResult.gap_summary,
      deepDiveQuestions: deepQuestions.map((q) => ({
        id: q.question_id,
        question: q.question_text,
        answer: q.answer,
      })),
    };

    // AI로 로드맵 생성
    console.log("로드맵 생성 시작...");
    const roadmapResult = await generateRoadmap(
      analysisResult,
      deepQuestionData
    );

    if (!roadmapResult.success) {
      throw new Error("로드맵 생성에 실패했습니다.");
    }

    const roadmap = roadmapResult.roadmap;

    console.log("🔍 AI 로드맵 구조 확인:", {
      isArray: Array.isArray(roadmap),
      hasMilestones: !!roadmap.milestones,
      keys: Object.keys(roadmap).slice(0, 10),
      type: typeof roadmap,
    });

    // 트랜잭션 시작
    await connection.beginTransaction();

    // 로드맵 메타데이터 저장
    const [roadmapInsert] = await connection.query(
      `INSERT INTO roadmaps 
       (user_id, analysis_id, deep_result_id, roadmap_data, title, description, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        analysisRecord.id,
        deepResult.id,
        JSON.stringify(roadmap),
        roadmap.title || "나의 진로 로드맵",
        roadmap.description || "",
        roadmap.start_date || new Date().toISOString().split("T")[0],
        roadmap.end_date || null,
      ]
    );

    const roadmapId = roadmapInsert.insertId;

    // AI 응답이 배열인 경우와 객체인 경우 모두 처리
    let milestonesArray = [];
    if (Array.isArray(roadmap)) {
      // roadmap 자체가 배열인 경우
      milestonesArray = roadmap;
    } else if (roadmap.milestones && Array.isArray(roadmap.milestones)) {
      // roadmap.milestones가 배열인 경우
      milestonesArray = roadmap.milestones;
    }

    console.log(`📌 처리할 마일스톤 개수: ${milestonesArray.length}`);

    // 마일스톤 저장 (캘린더용)
    if (milestonesArray.length > 0) {
      for (let i = 0; i < milestonesArray.length; i++) {
        const milestone = milestonesArray[i];

        // 카테고리 매핑 (AI가 다른 용어를 사용할 경우 대비)
        let category = milestone.category || "자기개발";
        const categoryMap = {
          교내: "교내활동",
          교외: "교외활동",
          자기계발: "자기개발",
          자기개발: "자기개발",
          학습: "자기개발",
          skills: "자기개발",
          knowledge: "자기개발",
          experience: "교외활동",
          cert: "교외활동",
        };
        category =
          categoryMap[category] ||
          categoryMap[category.toLowerCase()] ||
          "자기개발";

        // 시작 날짜와 종료 날짜 계산
        const startDate = milestone.target_date || milestone.startDate || null;
        let endDate = milestone.end_date || milestone.endDate || null;

        // end_date가 없고 duration_weeks가 있으면 계산
        if (
          !endDate &&
          startDate &&
          (milestone.duration_weeks || milestone.durationWeeks)
        ) {
          const durationWeeks =
            milestone.duration_weeks || milestone.durationWeeks;
          const start = new Date(startDate);
          const end = new Date(start);
          end.setDate(end.getDate() + durationWeeks * 7);
          endDate = end.toISOString().split("T")[0];
        }

        await connection.query(
          `INSERT INTO roadmap_milestones 
           (roadmap_id, user_id, milestone_order, title, description, category, target_date, end_date, duration_weeks, tasks, resources)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            roadmapId,
            userId,
            i + 1,
            milestone.title,
            milestone.description || "",
            category,
            startDate,
            endDate,
            milestone.duration_weeks || milestone.durationWeeks || null,
            JSON.stringify(milestone.tasks || []),
            JSON.stringify(milestone.resources || []),
          ]
        );
      }
    }

    await connection.commit();

    console.log("로드맵 생성 및 저장 완료");

    res.status(200).json({
      success: true,
      message: "로드맵이 생성되었습니다.",
      data: {
        roadmap,
        tokensUsed: roadmapResult.tokensUsed,
        isNew: true,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("로드맵 생성 오류:", error);
    res.status(500).json({
      success: false,
      message: error.message || "로드맵 생성 중 오류가 발생했습니다.",
    });
  } finally {
    connection.release();
  }
});

/**
 * GET /api/analysis/roadmap
 * 사용자의 로드맵 조회
 */
router.get("/roadmap", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // 로드맵 조회
    const [roadmaps] = await pool.query(
      "SELECT * FROM roadmaps WHERE user_id = ?",
      [userId]
    );

    if (roadmaps.length === 0) {
      return res.status(404).json({
        success: false,
        message: "로드맵이 없습니다.",
      });
    }

    const roadmap = roadmaps[0];
    const roadmapData =
      typeof roadmap.roadmap_data === "string"
        ? JSON.parse(roadmap.roadmap_data)
        : roadmap.roadmap_data;

    // 마일스톤 조회
    const [milestones] = await pool.query(
      `SELECT * FROM roadmap_milestones 
       WHERE roadmap_id = ? 
       ORDER BY milestone_order ASC`,
      [roadmap.id]
    );

    // milestones 테이블의 실제 데이터를 반환
    const formattedMilestones = milestones.map((m) => ({
      id: m.id,
      order: m.milestone_order,
      title: m.title,
      description: m.description,
      category: m.category,
      target_date: m.target_date, // 시작 날짜
      end_date: m.end_date, // 종료 날짜
      duration_weeks: m.duration_weeks,
      completed: m.is_completed, // completed로 변경 (is_ 제거)
      completed_at: m.completed_at,
      tasks: typeof m.tasks === "string" ? JSON.parse(m.tasks) : m.tasks,
      resources:
        typeof m.resources === "string" ? JSON.parse(m.resources) : m.resources,
    }));

    res.status(200).json({
      success: true,
      data: {
        roadmap: roadmapData, // AI가 생성한 원본 로드맵 데이터 (참고용)
        milestones: formattedMilestones, // 실제 마일스톤 데이터 (캘린더용)
        metadata: {
          title: roadmap.title,
          description: roadmap.description,
          start_date: roadmap.start_date,
          end_date: roadmap.end_date,
          created_at: roadmap.created_at,
        },
      },
    });
  } catch (error) {
    console.error("로드맵 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "로드맵 조회 중 오류가 발생했습니다.",
    });
  }
});

/**
 * PUT /api/analysis/roadmap/milestone/:milestoneId/complete
 * 마일스톤 완료 처리
 */
router.put(
  "/roadmap/milestone/:milestoneId/complete",
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const milestoneId = parseInt(req.params.milestoneId);

      const [result] = await pool.query(
        `UPDATE roadmap_milestones 
       SET is_completed = TRUE, completed_at = NOW()
       WHERE id = ? AND user_id = ?`,
        [milestoneId, userId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "마일스톤을 찾을 수 없습니다.",
        });
      }

      res.status(200).json({
        success: true,
        message: "마일스톤이 완료 처리되었습니다.",
      });
    } catch (error) {
      console.error("마일스톤 완료 처리 오류:", error);
      res.status(500).json({
        success: false,
        message: "마일스톤 완료 처리 중 오류가 발생했습니다.",
      });
    }
  }
);

export default router;
