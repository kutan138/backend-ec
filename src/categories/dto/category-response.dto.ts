import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Category unique identifier',
  })
  id: string;

  @ApiProperty({
    example: 'Electronics',
    description: 'Category name',
    maxLength: 120,
  })
  name: string;

  @ApiProperty({
    example: 'Electronic devices and accessories',
    description: 'Category description',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Parent category ID',
    required: false,
  })
  parentId?: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Category creation date',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Category last update date',
  })
  updatedAt: Date;
}
