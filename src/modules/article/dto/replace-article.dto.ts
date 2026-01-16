import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ReplaceArticleDto {
  @ApiProperty({ description: 'id', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  id!: number;

  @ApiProperty({ description: 'Article Name', example: 'Apple' })
  @IsString()
  @IsNotEmpty()
  articleName!: string;

  @ApiProperty({
    description: 'Article Description',
    example: 'Apple is a fruit',
  })
  @IsString()
  @IsNotEmpty()
  articleDescription!: string;

  @ApiProperty({ description: 'Article Price', example: 10 })
  @IsNumber()
  @IsNotEmpty()
  articlePrice!: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  version!: number;
}
