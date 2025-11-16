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
} from '@nestjs/swagger';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('carts')
@Controller('carts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new cart' })
  @ApiResponse({
    status: 201,
    description: 'Cart created successfully',
    type: Cart,
  })
  create(@Body() createCartDto: CreateCartDto): Promise<Cart> {
    return this.cartsService.create(createCartDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get cart by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Cart found',
    type: Cart,
  })
  findByUserId(@Param('userId') userId: string): Promise<Cart | null> {
    return this.cartsService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a cart by ID' })
  @ApiResponse({
    status: 200,
    description: 'Cart found',
    type: Cart,
  })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  findOne(@Param('id') id: string): Promise<Cart> {
    return this.cartsService.findOne(id);
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({
    status: 201,
    description: 'Item added successfully',
    type: CartItem,
  })
  addItem(
    @Param('id') cartId: string,
    @Body() addCartItemDto: AddCartItemDto,
  ): Promise<CartItem> {
    return this.cartsService.addItem(cartId, addCartItemDto);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({
    status: 200,
    description: 'Item updated successfully',
    type: CartItem,
  })
  updateItemQuantity(
    @Param('id') itemId: string,
    @Body('quantity') quantity: number,
  ): Promise<CartItem> {
    return this.cartsService.updateItemQuantity(itemId, quantity);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Item removed successfully' })
  removeItem(@Param('id') itemId: string): Promise<void> {
    return this.cartsService.removeItem(itemId);
  }

  @Delete(':id/clear')
  @ApiOperation({ summary: 'Clear all items from cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
  clearCart(@Param('id') cartId: string): Promise<void> {
    return this.cartsService.clearCart(cartId);
  }
}
