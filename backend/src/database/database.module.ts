import { Global, Module } from '@nestjs/common'; // decorators
import { ConfigModule, ConfigService } from '@nestjs/config'; // needed to read env
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schemas/schema';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';
// database type to be used
export type DatabaseType = ReturnType<typeof drizzle<typeof schema>>;

@Global() // available everywhere, no imports needed
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATABASE_CONNECTION,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const connectionString = configService.get<string>('DATABASE_URL'); // gets env variable
        if (!connectionString) {
          throw new Error('DATABASE_URL is not defined');
        }
        const client = postgres(connectionString);
        return drizzle(client, { schema });
      },
    },
  ],
  exports: [DATABASE_CONNECTION], // other modules can inject using @Inject(DATABASE_CONNECTION)
})
export class DatabaseModule {}
