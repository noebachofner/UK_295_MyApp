import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateArticleDto {
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
}
