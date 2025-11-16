import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Unique,
  Check,
} from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from 'src/products/entities/product.entity';

@Entity('cart_items')
@Unique(['cartId', 'productId'])
@Check(`"quantity" > 0`)
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @Column({ name: 'cart_id' })
  cartId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'product_id' })
  productId: string;

  @Column({ type: 'int' })
  quantity: number;
}
