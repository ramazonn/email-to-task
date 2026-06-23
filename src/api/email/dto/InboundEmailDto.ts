import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class InboundEmailDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  providerMessageId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  from!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  to!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  text!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  html?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  receivedAt?: string;
}
