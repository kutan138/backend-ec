// dto/reorder-category.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class ReorderItemDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    example: 0,
  })
  @IsInt()
  order: number;
}

export class ReorderCategoryDto {
  @ApiPropertyOptional({
    description: 'Parent category ID (null for root categories)',
    example: null,
    oneOf: [{ type: 'string', format: 'uuid' }, { type: 'null' }],
  })
  @IsOptional()
  @IsUUID()
  parentId?: string | null;

  @ApiProperty({
    description: 'List of categories to reorder',
    type: () => ReorderItemDto,
    isArray: true,
    example: [
      { id: '123e4567-e89b-12d3-a456-426614174000', order: 0 },
      { id: '223e4567-e89b-12d3-a456-426614174000', order: 1 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}
