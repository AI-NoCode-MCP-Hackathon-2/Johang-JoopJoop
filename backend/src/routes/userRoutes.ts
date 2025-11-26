import { Router } from 'express';
import { body } from 'express-validator';
import {
  updateProfile,
  deleteAccount,
  getRemainingChecks,
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.put(
  '/profile',
  [body('name').trim().notEmpty().withMessage('이름을 입력해주세요')],
  updateProfile
);

router.delete('/account', deleteAccount);

router.get('/remaining-checks', getRemainingChecks);

export default router;
