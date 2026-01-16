import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber } from 'class-validator';

export class ReturnArticleDto {
  @ApiProperty({ description: 'id', example: 1 })
  id!: number;

  @ApiProperty({ description: 'Article Name', example: 'Apple' })
  articleName!: string;

  @ApiProperty({
    description: 'Article Description',
    example: 'Apple is a fruit',
  })
  articleDescription!: string;

  @ApiProperty({ description: 'Article Price', example: 10 })
  articlePrice!: number;

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
