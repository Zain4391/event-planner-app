import { Request } from 'express';
import { userReturn } from './user.type';

export interface RequestWithUser extends Request {
  user: userReturn;
}
