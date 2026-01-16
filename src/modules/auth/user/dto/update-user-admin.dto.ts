import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateUserAdminDto {
  @ApiProperty({ example: 'true' })
  @IsBoolean()
  @IsNotEmpty()
  isAdmin!: boolean;
}
