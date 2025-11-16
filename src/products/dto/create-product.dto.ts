import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ example: 'iPhone 15 Pro Max' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'Latest iPhone with advanced features' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 1299.99 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number;

  @ApiProperty({ example: 100, default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  stock?: number;

  @ApiProperty({ example: 'https://example.com/thumbnail.jpg' })
  @IsString()
  @IsOptional()
  thumbnail?: string;
}
