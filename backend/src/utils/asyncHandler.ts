// utils/asyncHandler.ts
import { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncRequestHandler<T = Request> = (
  req: T,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;

export const asyncHandler = <T = Request>(
  fn: AsyncRequestHandler<T>
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req as T, res, next)).catch(next);
  };
};