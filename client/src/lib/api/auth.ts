import { postJson, getJson } from "../axios";

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  dob?: string | null;
  address?: string | null;
  school?: string | null;
  interest?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  username: string;
  email: string;
  password: string;
  dob?: string;
  address?: string;
  school?: string;
  interest?: string;
}

export interface MeResponse {
  success: boolean;
  data: {
    user: User;
  };
}

export const authApi = {
  // 로그인
  login: (data: LoginRequest) => 
    postJson<AuthResponse, LoginRequest>("/api/auth/login", data),

  // 회원가입
  signup: (data: SignupRequest) => 
    postJson<AuthResponse, SignupRequest>("/api/auth/signup", data),

  // 현재 사용자 정보 조회
  me: () => 
    getJson<MeResponse>("/api/auth/me"),

  // 사용자 정보 수정
  updateMe: (data: Partial<Omit<User, "id" | "username" | "email" | "created_at" | "updated_at">>) =>
    postJson<MeResponse, typeof data>("/api/auth/me", data),
};

