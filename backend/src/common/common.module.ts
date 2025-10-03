import { Global, Module } from '@nestjs/common';
import { UuidValidationPipe } from './pipes/uuid-validation-pipe';

@Global()
@Module({
  providers: [UuidValidationPipe],
  exports: [UuidValidationPipe],
})
export class CommonModule {}
