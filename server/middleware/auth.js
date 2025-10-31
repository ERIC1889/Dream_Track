import { verifyToken } from '../utils/jwt.js';

/**
 * JWT 인증 미들웨어
 * Authorization 헤더에서 Bearer 토큰을 추출하고 검증합니다.
 */
export function authenticateToken(req, res, next) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '인증 토큰이 필요합니다.'
      });
    }

    // 토큰 검증
    const decoded = verifyToken(token);
    
    // 검증된 사용자 정보를 request에 추가
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: '유효하지 않거나 만료된 토큰입니다.'
    });
  }
}

/**
 * 선택적 인증 미들웨어 (토큰이 있으면 검증하고, 없으면 통과)
 */
export function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // 토큰이 유효하지 않아도 계속 진행
    next();
  }
}

