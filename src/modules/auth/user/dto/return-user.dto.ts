import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsLowercase,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ReturnUserDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  id!: number;

  @ApiProperty({ example: 'user' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  @IsLowercase()
  username!: string;

  @ApiProperty({ example: 'user@local.ch' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'false' })
  @IsBoolean()
  @IsNotEmpty()
  isAdmin!: boolean;

  @ApiProperty({ example: new Date() })
  @IsDate()
  @IsNotEmpty()
  createdAt!: Date;

  @ApiProperty({ example: new Date() })
  @IsDate()
  @IsNotEmpty()
  updatedAt!: Date;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  version!: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  createdById!: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  updatedById!: number;
}
