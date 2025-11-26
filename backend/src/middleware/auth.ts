import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';
import { AppError } from '../utils/errors';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('인증 토큰이 필요합니다', 401);
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(role: 'user' | 'admin') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError('인증이 필요합니다', 401);
      }

      if (req.user.role !== role && req.user.role !== 'admin') {
        throw new AppError('권한이 없습니다', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  try {
    if (!req.user) {
      throw new AppError('인증이 필요합니다', 401);
    }

    if (req.user.role !== 'admin') {
      throw new AppError('관리자 권한이 필요합니다', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
}
