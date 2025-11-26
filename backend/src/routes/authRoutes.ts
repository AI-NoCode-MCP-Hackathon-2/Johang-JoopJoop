import { Router } from 'express';
import { body } from 'express-validator';
import {
  signup,
  login,
  refreshAccessToken,
  getMe,
  changePassword,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('이름을 입력해주세요'),
    body('email').isEmail().withMessage('유효한 이메일을 입력해주세요'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('비밀번호는 최소 8자 이상이어야 합니다')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다'),
  ],
  signup
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('유효한 이메일을 입력해주세요'),
    body('password').notEmpty().withMessage('비밀번호를 입력해주세요'),
  ],
  login
);

router.post('/refresh', refreshAccessToken);

router.get('/me', authenticate, getMe);

router.post(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('현재 비밀번호를 입력해주세요'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('새 비밀번호는 최소 8자 이상이어야 합니다')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('새 비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다'),
  ],
  changePassword
);

export default router;
