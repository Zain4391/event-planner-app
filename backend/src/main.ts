import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // keep DTO properties only
    forbidNonWhitelisted: true, // Throw error for unknown properties only
    transform: true // Transform Payloads as DTO instances
  }))
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
