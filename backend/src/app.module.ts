// Update your app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // ← Import directly from @nestjs/config
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,        // Makes config available everywhere
      envFilePath: '.env',   // Path to your .env file
    }),
    AuthModule, 
    DatabaseModule, 
    CommonModule, CategoriesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}