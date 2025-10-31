import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// MySQL 연결 풀 생성
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "dream_track",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// 데이터베이스 연결 테스트
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL 데이터베이스 연결 성공");
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ MySQL 데이터베이스 연결 실패:", error.message);
    return false;
  }
}

export { pool, testConnection };
