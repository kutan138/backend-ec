import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateCartItemQuantityDto {
  @ApiProperty({
    example: 5,
    description: 'New quantity for the cart item',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;
}
