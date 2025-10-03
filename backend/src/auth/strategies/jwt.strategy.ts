import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import type { DatabaseType } from '../../database/database.module';
import { jwtPayload } from '../types/jwt-payload.type';
import { userReturn } from '../types/user.type';
import * as schema from '../../database/schemas/schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: DatabaseType,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: jwtPayload): Promise<userReturn> {
    try {
      const id = payload.id;

      const userDB = await this.db
        .select({
          id: schema.users.id,
          email: schema.users.email,
          firstName: schema.users.firstName,
          lastName: schema.users.lastName,
          role: schema.users.role,
          isActive: schema.users.isActive,
          createdAt: schema.users.createdAt,
          updatedAt: schema.users.updatedAt,
        })
        .from(schema.users)
        .where(eq(schema.users.id, id))
        .limit(1);
      if (userDB.length === 0) {
        throw new UnauthorizedException('User not found');
      }

      const user = userDB[0];
      if (!user.isActive) {
        throw new UnauthorizedException('User Account is inActive');
      }

      return user;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('User Authentication Failed');
    }
  }
}
