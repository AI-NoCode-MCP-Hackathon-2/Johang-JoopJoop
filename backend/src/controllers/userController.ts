import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/User';
import { AppError } from '../utils/errors';
import { validationResult } from 'express-validator';

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('인증이 필요합니다', 401);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('입력값이 유효하지 않습니다', 400);
    }

    const { name } = req.body;

    const updatedUser = await UserModel.updateProfile(req.user.userId, name);

    res.json({
      success: true,
      message: '프로필이 수정되었습니다',
      data: {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('인증이 필요합니다', 401);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('입력값이 유효하지 않습니다', 400);
    }

    const { password } = req.body;

    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      throw new AppError('사용자를 찾을 수 없습니다', 404);
    }

    if (user.provider === 'email') {
      if (!password) {
        throw new AppError('비밀번호를 입력해주세요', 400);
      }

      const isPasswordValid = await UserModel.verifyPassword(user, password);
      if (!isPasswordValid) {
        throw new AppError('비밀번호가 일치하지 않습니다', 401);
      }
    }

    await UserModel.delete(req.user.userId);

    res.json({
      success: true,
      message: '계정이 삭제되었습니다',
    });
  } catch (error) {
    next(error);
  }
}

export async function getRemainingChecks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('인증이 필요합니다', 401);
    }

    const remainingChecks = await UserModel.getRemainingChecks(req.user.userId);

    res.json({
      success: true,
      data: {
        remaining_checks_today: remainingChecks,
      },
    });
  } catch (error) {
    next(error);
  }
}
