import { Response } from 'express';

export const handleError = (res: Response, err: any, status = 500) => {
  console.error(err);
  res.status(status).json({ 
    error: err.message || 'An unexpected error occurred'
  });
};
