import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsInt, Min } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}
