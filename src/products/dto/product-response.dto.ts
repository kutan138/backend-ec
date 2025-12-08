import { ApiProperty } from '@nestjs/swagger';
import { ProductImageResponseDto } from './product-image-response.dto';

export class ProductResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Product unique identifier',
  })
  id: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Category unique identifier',
    required: false,
  })
  categoryId?: string;

  @ApiProperty({
    example: 'iPhone 15 Pro Max',
    description: 'Product name',
    maxLength: 255,
  })
  name: string;

  @ApiProperty({
    example: 'Latest iPhone with advanced features',
    description: 'Product description',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: 1299.99,
    description: 'Product price',
    minimum: 0,
  })
  price: number;

  @ApiProperty({
    example: 100,
    description: 'Product stock quantity',
    minimum: 0,
    default: 0,
  })
  stock: number;

  @ApiProperty({
    example: 'https://example.com/thumbnail.jpg',
    description: 'Product thumbnail URL',
    required: false,
  })
  thumbnail?: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Product creation date',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Product last update date',
  })
  updatedAt: Date;

  @ApiProperty({
    type: [ProductImageResponseDto],
    description: 'Product images',
    required: false,
  })
  images?: ProductImageResponseDto[];
}
