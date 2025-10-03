import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../dto/register.dto';

export function Roles(...roles: UserRole[]) {
  return SetMetadata('roles', roles);
}
