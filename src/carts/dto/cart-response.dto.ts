import { ApiProperty } from '@nestjs/swagger';
import { CartItemResponseDto } from './cart-item-response.dto';

export class CartResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Cart unique identifier',
  })
  id: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User unique identifier',
  })
  userId: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Cart creation date',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Cart last update date',
  })
  updatedAt: Date;

  @ApiProperty({
    type: [CartItemResponseDto],
    description: 'Items in the cart',
    required: false,
  })
  items?: CartItemResponseDto[];
}
