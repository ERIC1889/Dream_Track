import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';
import { generateToken } from '../utils/jwt.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const SALT_ROUNDS = 10;

/**
 * POST /api/auth/signup
 * 회원가입 API
 */
router.post('/signup', async (req, res) => {
  const { name, username, email, password, dob, address, school, interest } = req.body;

  try {
    // 필수 필드 검증
    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '이름, 아이디, 이메일, 비밀번호는 필수 항목입니다.'
      });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '유효한 이메일 주소를 입력해주세요.'
      });
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '비밀번호는 최소 6자 이상이어야 합니다.'
      });
    }

    // 중복 확인 (username, email)
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: '이미 존재하는 아이디 또는 이메일입니다.'
      });
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 사용자 생성
    const [result] = await pool.query(
      `INSERT INTO users (name, username, email, password, dob, address, school, interest)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, username, email, hashedPassword, dob || null, address || null, school || null, interest || null]
    );

    // JWT 토큰 생성
    const token = generateToken({
      id: result.insertId,
      username,
      email
    });

    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      data: {
        user: {
          id: result.insertId,
          name,
          username,
          email,
          dob,
          address,
          school,
          interest
        },
        token
      }
    });
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /api/auth/login
 * 로그인 API
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 필수 필드 검증
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '이메일과 비밀번호를 입력해주세요.'
      });
    }

    // 사용자 조회
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }

    const user = users[0];

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }

    // JWT 토큰 생성
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email
    });

    // 비밀번호 제외하고 사용자 정보 반환
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: '로그인 성공',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/auth/me
 * 현재 로그인한 사용자 정보 조회 API
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // 사용자 정보 조회
    const [users] = await pool.query(
      'SELECT id, name, username, email, dob, address, school, interest, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: users[0]
      }
    });
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * PUT /api/auth/me
 * 사용자 정보 수정 API
 */
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, dob, address, school, interest } = req.body;

    // 업데이트할 필드만 선택
    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (dob) {
      updates.push('dob = ?');
      values.push(dob);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      values.push(address);
    }
    if (school !== undefined) {
      updates.push('school = ?');
      values.push(school);
    }
    if (interest !== undefined) {
      updates.push('interest = ?');
      values.push(interest);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: '업데이트할 정보가 없습니다.'
      });
    }

    values.push(userId);

    // 사용자 정보 업데이트
    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // 업데이트된 사용자 정보 조회
    const [users] = await pool.query(
      'SELECT id, name, username, email, dob, address, school, interest, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    res.status(200).json({
      success: true,
      message: '사용자 정보가 업데이트되었습니다.',
      data: {
        user: users[0]
      }
    });
  } catch (error) {
    console.error('사용자 정보 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

export default router;

