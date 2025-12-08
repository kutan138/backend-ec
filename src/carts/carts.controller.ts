import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { MessageResponseDto } from 'src/auth/dtos/message-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CartsService } from './carts.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { CartItemResponseDto } from './dto/cart-item-response.dto';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartItemQuantityDto } from './dto/update-cart-item-quantity.dto';

@ApiTags('carts')
@Controller('carts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new cart' })
  @ApiBody({ type: CreateCartDto })
  @ApiResponse({
    status: 201,
    description: 'Cart created successfully',
    type: CartResponseDto,
  })
  async create(@Body() createCartDto: CreateCartDto): Promise<CartResponseDto> {
    return this.cartsService.create(createCartDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get cart by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Cart found',
    type: CartResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Cart not found',
  })
  async findByUserId(
    @Param('userId') userId: string,
  ): Promise<CartResponseDto | null> {
    return this.cartsService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a cart by ID' })
  @ApiResponse({
    status: 200,
    description: 'Cart found',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  async findOne(@Param('id') id: string): Promise<CartResponseDto> {
    return this.cartsService.findOne(id);
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiBody({ type: AddCartItemDto })
  @ApiResponse({
    status: 201,
    description: 'Item added successfully',
    type: CartItemResponseDto,
  })
  async addItem(
    @Param('id') cartId: string,
    @Body() addCartItemDto: AddCartItemDto,
  ): Promise<CartItemResponseDto> {
    return this.cartsService.addItem(cartId, addCartItemDto);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiBody({ type: UpdateCartItemQuantityDto })
  @ApiResponse({
    status: 200,
    description: 'Item updated successfully',
    type: CartItemResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Cart item not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Invalid quantity',
  })
  async updateItemQuantity(
    @Param('id') itemId: string,
    @Body() updateCartItemQuantityDto: UpdateCartItemQuantityDto,
  ): Promise<CartItemResponseDto> {
    return this.cartsService.updateItemQuantity(
      itemId,
      updateCartItemQuantityDto.quantity,
    );
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({
    status: 200,
    description: 'Item removed successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Cart item not found',
  })
  async removeItem(@Param('id') itemId: string): Promise<MessageResponseDto> {
    await this.cartsService.removeItem(itemId);
    return { message: 'Item removed successfully' };
  }

  @Delete(':id/clear')
  @ApiOperation({ summary: 'Clear all items from cart' })
  @ApiResponse({
    status: 200,
    description: 'Cart cleared successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Cart not found',
  })
  async clearCart(@Param('id') cartId: string): Promise<MessageResponseDto> {
    await this.cartsService.clearCart(cartId);
    return { message: 'Cart cleared successfully' };
  }
}
