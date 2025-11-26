import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { testConnection } from './config/database';
import { initializeDatabase } from './config/initDB';
import { logger } from './utils/logger';
import { AppError } from './utils/errors';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import analysisRoutes from './routes/analysisRoutes';
import adminRoutes from './routes/adminRoutes';
import contactRoutes from './routes/contactRoutes';
import chatbotRoutes from './routes/chatbotRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: '요청 횟수 제한을 초과했습니다. 잠시 후 다시 시도해주세요.',
  standardHeaders: true,
  legacyHeaders: false,
});

const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/', limiter);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', message: '서버가 정상적으로 작동 중입니다' });
});

app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Johang-JoopJoop Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      users: '/api/users/*',
      analysis: '/api/analysis/*',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/chatbot', chatbotRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn(`AppError: ${err.message}`, { statusCode: err.statusCode });
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  logger.error('Unexpected error:', err);
  return res.status(500).json({
    success: false,
    message: '서버 오류가 발생했습니다',
  });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: '요청하신 API 엔드포인트를 찾을 수 없습니다',
  });
});

async function startServer() {
  try {
    logger.info('서버 시작 중...');

    await testConnection();
    logger.info('데이터베이스 연결 확인 완료');

    await initializeDatabase();
    logger.info('데이터베이스 초기화 완료');

    app.listen(PORT, () => {
      logger.info(`✅ 서버가 포트 ${PORT}에서 실행 중입니다`);
      logger.info(`   - 환경: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`   - Health Check: http://localhost:${PORT}/health`);
      logger.info(`   - API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    logger.error('서버 시작 실패:', error);
    process.exit(1);
  }
}

startServer();

export default app;
