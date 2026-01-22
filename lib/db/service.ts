import { getPrisma } from '@/lib/db/client';
import { Order, ProductStock } from './types';

export class DatabaseService {
  // Orders
  static async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const prisma = await getPrisma();
    const order = await prisma.order.create({
      data: {
        squarePaymentId: orderData.squarePaymentId,
        customerEmail: orderData.customerEmail,
        productIds: orderData.productIds,
        totalAmount: orderData.totalAmount,
        currency: orderData.currency,
        status: orderData.status,
      }
    });

    return this.mapOrderToOrder(order);
  }

  static async updateOrderStatus(squarePaymentId: string, status: Order['status']): Promise<Order | null> {
    try {
      const prisma = await getPrisma();
      const order = await prisma.order.update({
        where: { squarePaymentId }, // ✅ uniquement la clé unique
        data: { status, updatedAt: new Date() }
      });
      return this.mapOrderToOrder(order);
    } catch {
      return null;
    }
  }

  static async getOrderBySessionId(squarePaymentId: string): Promise<Order | null> {
    try {
      const prisma = await getPrisma();
      const order = await prisma.order.findUnique({
        where: { squarePaymentId }
      });
      return order ? this.mapOrderToOrder(order) : null;
    } catch {
      return null;
    }
  }

  // Product Stock
  static async getProductStock(productId: string | number): Promise<boolean> {
    try {
      const prisma = await getPrisma();

      const productIdStr = String(productId); // toujours string
      console.log('Fetching stock for productId:', productIdStr);

      const stock = await prisma.productStock.findUnique({
        where: { productId: productIdStr }
      });

      console.log('Found stock:', stock);

      // si stock trouvé, retourne inStock sinon true par défaut
      return stock?.inStock ?? true;
    } catch (error) {
      console.error('Error retrieving product stock:', error);
      return true;
    }
  }

  static async updateProductStock(productId: string, inStock: boolean): Promise<void> {
    try {
      const prisma = await getPrisma();
      await prisma.productStock.upsert({
        where: { productId },
        update: { inStock, updatedAt: new Date() },
        create: { productId, inStock, updatedAt: new Date() }
      });
    } catch (error) {
      console.error('Error updating product stock:', error);
    }
  }

  static async markProductAsSold(productId: string) {
    try {
      const prisma = await getPrisma();
      const updatedProduct = await prisma.productStock.update({
        where: { productId },
        data: { inStock: false },
      });
      return updatedProduct;
    } catch (err) {
      console.error(`Impossible de mettre à jour le produit ${productId}:`, err);
    }
}

  static async updateMultipleProductStock(productIds: string[], inStock: boolean): Promise<void> {
    try {
      const prisma = await getPrisma();
      await Promise.all(
        productIds.map(productId =>
          prisma.productStock.upsert({
            where: { productId },
            update: { inStock, updatedAt: new Date() },
            create: { productId, inStock, updatedAt: new Date() }
          })
        )
      );
    } catch (error) {
      console.error('Error updating multiple product stock:', error);
    }
  }

  // Mapping helpers
  private static mapOrderToOrder(prismaOrder: any): Order {
    return {
      id: prismaOrder.id,
      squarePaymentId: prismaOrder.squarePaymentId,
      customerEmail: prismaOrder.customerEmail,
      productIds: prismaOrder.productIds,
      totalAmount: prismaOrder.totalAmount,
      currency: prismaOrder.currency,
      status: prismaOrder.status,
      createdAt: prismaOrder.createdAt,
      updatedAt: prismaOrder.updatedAt
    };
  }

  private static mapOrderRow(row: any): Order {
    return {
      id: row.id,
      squarePaymentId: row.sqaure_payment_id,
      customerEmail: row.customer_email,
      productIds: row.product_ids,
      totalAmount: row.total_amount,
      currency: row.currency,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
