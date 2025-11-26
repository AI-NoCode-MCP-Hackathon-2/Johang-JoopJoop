export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = '잘못된 요청입니다') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = '인증이 필요합니다') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = '권한이 없습니다') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = '리소스를 찾을 수 없습니다') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = '이미 존재하는 리소스입니다') {
    super(message, 409);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = '서버 오류가 발생했습니다') {
    super(message, 500);
  }
}
