import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum ReviewDecision {
  ACCEPT = 'accept',
  REJECT = 'reject',
}

export class ReviewTaskDto {
  @ApiProperty({ enum: ReviewDecision })
  @IsEnum(ReviewDecision)
  @IsNotEmpty()
  decision!: ReviewDecision;
}
