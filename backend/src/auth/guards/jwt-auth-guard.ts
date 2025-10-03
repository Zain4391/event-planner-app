import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// implementation handled by the strategy
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
