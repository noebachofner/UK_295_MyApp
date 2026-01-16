import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsLowercase,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'user1234' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  @IsLowercase()
  username!: string;

  @ApiProperty({ example: 'user@local.ch' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'user12A$' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/(?=.*[a-z])/, {
    message: 'Password must contain a lowercase letter',
  })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain an uppercase letter',
  })
  @Matches(/(?=.*\d)/, {
    message: 'Password must contain a number',
  })
  @Matches(/(?=.*[@$!%*?&])/, {
    message: 'Password must contain a special character [@$!%*?&]',
  })
  password!: string;
}
