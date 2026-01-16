import { ApiProperty } from '@nestjs/swagger';
import { IsLowercase, IsNotEmpty } from 'class-validator';

export class SignInDto {
  @ApiProperty({ example: 'user1234' })
  @IsNotEmpty()
  @IsLowercase()
  username: string;

  @ApiProperty({ example: 'user12A$' })
  @IsNotEmpty()
  password: string;
}
