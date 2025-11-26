import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/User';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../utils/errors';
import { validationResult } from 'express-validator';

export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('입력값이 유효하지 않습니다', 400);
    }

    const { name, email, password } = req.body;

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new AppError('이미 사용 중인 이메일입니다', 409);
    }

    const user = await UserModel.create({
      name,
      email,
      password,
      provider: 'email',
    });

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          remaining_checks_today: user.remaining_checks_today,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('입력값이 유효하지 않습니다', 400);
    }

    const { email, password } = req.body;

    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new AppError('이메일 또는 비밀번호가 일치하지 않습니다', 401);
    }

    if (user.provider !== 'email') {
      throw new AppError(`${user.provider} 계정으로 로그인해주세요`, 400);
    }

    const isPasswordValid = await UserModel.verifyPassword(user, password);
    if (!isPasswordValid) {
      throw new AppError('이메일 또는 비밀번호가 일치하지 않습니다', 401);
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      message: '로그인이 완료되었습니다',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          remaining_checks_today: await UserModel.getRemainingChecks(user.id),
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function refreshAccessToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('리프레시 토큰이 필요합니다', 400);
    }

    const payload = verifyRefreshToken(refreshToken);

    const user = await UserModel.findById(payload.userId);
    if (!user) {
      throw new AppError('사용자를 찾을 수 없습니다', 404);
    }

    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      message: '액세스 토큰이 갱신되었습니다',
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('인증이 필요합니다', 401);
    }

    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      throw new AppError('사용자를 찾을 수 없습니다', 404);
    }

    const remainingChecks = await UserModel.getRemainingChecks(user.id);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          remaining_checks_today: remainingChecks,
          created_at: user.created_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('인증이 필요합니다', 401);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('입력값이 유효하지 않습니다', 400);
    }

    const { currentPassword, newPassword } = req.body;

    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      throw new AppError('사용자를 찾을 수 없습니다', 404);
    }

    if (user.provider !== 'email') {
      throw new AppError('소셜 로그인 계정은 비밀번호를 변경할 수 없습니다', 400);
    }

    const isPasswordValid = await UserModel.verifyPassword(user, currentPassword);
    if (!isPasswordValid) {
      throw new AppError('현재 비밀번호가 일치하지 않습니다', 401);
    }

    await UserModel.updatePassword(user.id, newPassword);

    res.json({
      success: true,
      message: '비밀번호가 변경되었습니다',
    });
  } catch (error) {
    next(error);
  }
}
