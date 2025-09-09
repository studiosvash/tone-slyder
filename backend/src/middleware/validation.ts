import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export function validateRequest(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'validation_error',
        message: error.details[0].message,
        details: error.details
      });
    }
    
    req.body = value;
    next();
  };
}
