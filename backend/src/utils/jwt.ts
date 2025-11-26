import jwt from 'jsonwebtoken';
import { AppError } from './errors';

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
}

export function generateAccessToken(payload: JwtPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError('JWT_SECRET이 설정되지 않았습니다', 500);
  }

  // @ts-expect-error jsonwebtoken type issue with expiresIn
  const token = jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
  return token;
}

export function generateRefreshToken(payload: JwtPayload): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new AppError('JWT_REFRESH_SECRET이 설정되지 않았습니다', 500);
  }

  // @ts-expect-error jsonwebtoken type issue with expiresIn
  const token = jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
  return token;
}

export function verifyAccessToken(token: string): JwtPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError('JWT_SECRET이 설정되지 않았습니다', 500);
  }

  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('토큰이 만료되었습니다', 401);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('유효하지 않은 토큰입니다', 401);
    }
    throw new AppError('토큰 검증에 실패했습니다', 401);
  }
}

export function verifyRefreshToken(token: string): JwtPayload {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new AppError('JWT_REFRESH_SECRET이 설정되지 않았습니다', 500);
  }

  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('리프레시 토큰이 만료되었습니다', 401);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('유효하지 않은 리프레시 토큰입니다', 401);
    }
    throw new AppError('리프레시 토큰 검증에 실패했습니다', 401);
  }
}
