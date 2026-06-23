import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: '665f1b2c3d4e5f6a7b8c9d0e' })
  @IsMongoId()
  companyId!: string;

  @ApiProperty({ example: 'Alice Smith' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ type: [String], example: ['alice@acme.example'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsEmail({}, { each: true })
  emails!: string[];
}
