import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * JWT 토큰 생성
 * @param {Object} payload - 토큰에 포함할 데이터
 * @returns {string} JWT 토큰
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

/**
 * JWT 토큰 검증
 * @param {string} token - 검증할 토큰
 * @returns {Object} 디코딩된 페이로드
 * @throws {Error} 토큰이 유효하지 않은 경우
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('유효하지 않은 토큰입니다.');
  }
}

/**
 * JWT 토큰 디코딩 (검증 없이)
 * @param {string} token - 디코딩할 토큰
 * @returns {Object} 디코딩된 페이로드
 */
export function decodeToken(token) {
  return jwt.decode(token);
}

