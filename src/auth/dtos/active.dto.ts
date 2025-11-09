import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ActiveDto {
  @ApiProperty({ example: 'abc' })
  @IsString()
  token: string;
}
