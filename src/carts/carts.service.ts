import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { AddCartItemDto } from './dto/add-cart-item.dto';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
  ) {}

  async create(createCartDto: CreateCartDto): Promise<Cart> {
    const cart = this.cartRepository.create(createCartDto);
    return this.cartRepository.save(cart);
  }

  async findByUserId(userId: string): Promise<Cart | null> {
    return this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
    });
  }

  async findOne(id: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      throw new NotFoundException(`Cart with ID "${id}" not found`);
    }

    return cart;
  }
  async addItem(
    cartId: string,
    addCartItemDto: AddCartItemDto,
  ): Promise<CartItem> {
    // Check if item already exists
    const existingItem = await this.cartItemRepository.findOne({
      where: { cartId, productId: addCartItemDto.productId },
    });

    if (existingItem) {
      existingItem.quantity += addCartItemDto.quantity;
      return this.cartItemRepository.save(existingItem);
    }

    const item = this.cartItemRepository.create({
      ...addCartItemDto,
      cartId,
    });
    return this.cartItemRepository.save(item);
  }

  async updateItemQuantity(
    itemId: string,
    quantity: number,
  ): Promise<CartItem> {
    if (quantity <= 0) {
      throw new ConflictException('Quantity must be greater than 0');
    }

    const item = await this.cartItemRepository.findOne({
      where: { id: itemId },
    });
    if (!item) {
      throw new NotFoundException(`Cart item with ID "${itemId}" not found`);
    }

    item.quantity = quantity;
    return this.cartItemRepository.save(item);
  }

  async removeItem(itemId: string): Promise<void> {
    const item = await this.cartItemRepository.findOne({
      where: { id: itemId },
    });
    if (!item) {
      throw new NotFoundException(`Cart item with ID "${itemId}" not found`);
    }
    await this.cartItemRepository.remove(item);
  }

  async clearCart(cartId: string): Promise<void> {
    const cart = await this.findOne(cartId);
    await this.cartItemRepository.delete({ cartId: cart.id });
  }
}
