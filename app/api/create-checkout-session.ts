// pages/api/create-checkout-session.ts (ou .js)
import { NextApiRequest, NextApiResponse } from 'next';
import { DatabaseService } from '@/lib/db/service';
import { prisma } from 'lib/db/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  try {
    const { items, customerEmail, addresses } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Panier vide' });
    }

    // 🔹 Mettre à jour le stock
    items.forEach(item => {
      const qty = item.quantity ?? 0;
      const inStock = qty > 0;
      DatabaseService.updateProductStock(item.id, inStock);
    });

    // 🔹 Créer l'URL de paiement Square
    const squareUrl = 'https://square.link/u/J0elT0Hw'; // ton lien Square
    // Ici tu pourrais générer dynamiquement un lien Square Front-End Flow si tu veux plus de flexibilité

    // 🔹 Sauvegarder la commande en base si besoin
    // Créer l'adresse de facturation
    const billingAddr = await prisma.customerAddress.create({
    data: {
        type: 'billing',
        line1: addresses.billing.line1,
        line2: addresses.billing.line2 || null,
        city: addresses.billing.city,
        state: addresses.billing.state || null,
        postalCode: addresses.billing.postalCode,
        country: addresses.billing.country
    }
    });

    // Créer l'adresse de livraison
    const shippingAddr = await prisma.customerAddress.create({
    data: {
        type: 'shipping',
        line1: addresses.shipping.line1,
        line2: addresses.shipping.line2 || null,
        city: addresses.shipping.city,
        state: addresses.shipping.state || null,
        postalCode: addresses.shipping.postalCode,
        country: addresses.shipping.country
    }
    });

    // Créer la commande et lier les adresses
    const order = await prisma.order.create({
    data: {
        customerEmail,
        productIds: items.map(i => i.id),
        totalAmount: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        currency: 'CAD',
        status: 'pending',
        billingAddressId: billingAddr.id,
        shippingAddressId: shippingAddr.id
    }
    });

    return res.status(200).json({ squareUrl, orderId: order.id });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}