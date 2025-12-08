import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseDto } from 'src/products/dto/product-response.dto';

export class CartItemResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Cart item unique identifier',
  })
  id: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Cart unique identifier',
  })
  cartId: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Product unique identifier',
  })
  productId: string;

  @ApiProperty({
    example: 2,
    description: 'Quantity of the product',
    minimum: 1,
  })
  quantity: number;

  @ApiProperty({
    type: () => ProductResponseDto,
    description: 'Product details',
    required: false,
  })
  product?: ProductResponseDto;
}
