import { Request, Response, NextFunction } from 'express';

export const validatePost = (req: Request, res: Response, next: NextFunction) => {
  const { content } = req.body;
  if (!content || content.trim() === '') {
    return res.status(400).json({ message: 'Content is required' });
  }
  next();
};