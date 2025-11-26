import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { ContactMessageModel } from '../models/ContactMessage';

const router = Router();

// 문의하기 등록 (인증 불필요)
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('이름을 입력해주세요'),
    body('email').isEmail().withMessage('유효한 이메일을 입력해주세요'),
    body('subject').trim().notEmpty().withMessage('문의 유형을 선택해주세요'),
    body('message').trim().isLength({ min: 10 }).withMessage('문의 내용은 최소 10자 이상이어야 합니다'),
  ],
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: '입력값이 유효하지 않습니다',
          errors: errors.array(),
        });
        return;
      }

      const { name, email, subject, message } = req.body;

      const contact = await ContactMessageModel.create({
        name,
        email,
        subject,
        message,
      });

      res.status(201).json({
        success: true,
        message: '문의가 등록되었습니다',
        data: { contact },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
