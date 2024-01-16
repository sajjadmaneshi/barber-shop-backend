import { ApiProperty } from '@nestjs/swagger';

export class ChangeExceptionDayClosedDto {
  @ApiProperty({ type: Boolean }) public isClosed: boolean;
}
