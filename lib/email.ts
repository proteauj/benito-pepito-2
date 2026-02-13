// lib/email.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

type OrderItem = {
  id: string;
  title?: string;
  titleFr?: string;
  price: number;
};

export async function sendOrderEmail(
  order: {
    squarePaymentId: string;
    totalAmount: number;
    currency: string;
    items: OrderItem[];
    shippingMethod: 'pickup' | 'shipping';
    shippingAddress?: any;
  },
  customer: { email: string }
) {
  console.log('📨 SendGrid sendOrderEmail');

  const itemsHtml = order.items
    .map(
      (item) =>
        `<li>${item.titleFr || item.title} – ${item.price} $</li>`
    )
    .join('');

  const shippingHtml =
    order.shippingMethod === 'pickup'
      ? `
        <p><strong>Cueillette :</strong><br/>
        4 rue Dufresne<br/>
        Saint-Jean-sur-Richelieu</p>
      `
      : `
        <p><strong>Livraison :</strong><br/>
        ${order.shippingAddress?.name || ''}<br/>
        ${order.shippingAddress?.street}<br/>
        ${order.shippingAddress?.city}, ${order.shippingAddress?.province}<br/>
        ${order.shippingAddress?.postalCode}</p>
      `;

  /* =========================
     📩 EMAIL ARTISTE
  ========================= */
  await sgMail.send({
    to: 'benitopepitoartiste@gmail.com',
    from: process.env.SENDGRID_FROM!,
    subject: '🖼️ Nouvelle commande reçue',
    html: `
      <h2>Nouvelle commande</h2>

      <p><strong>Paiement Square :</strong> ${order.squarePaymentId}</p>

      <h3>Produits</h3>
      <ul>${itemsHtml}</ul>

      <p><strong>Total :</strong> ${order.totalAmount / 100} ${order.currency}</p>

      ${shippingHtml}

      <p><strong>Email client :</strong> ${customer.email}</p>
    `,
  });

  /* =========================
     📩 EMAIL CLIENT
  ========================= */
  await sgMail.send({
    to: customer.email,
    from: process.env.SENDGRID_FROM!,
    subject: '✨ Confirmation de votre commande',
    html: `
      <h2>Merci pour votre achat ✨</h2>

      <p>Votre commande a bien été reçue.</p>

      <h3>Œuvre(s)</h3>
      <ul>${itemsHtml}</ul>

      <p><strong>Total :</strong> ${order.totalAmount} ${order.currency}</p>

      ${shippingHtml}

      <p>
        Pour toute question, vous pouvez répondre à ce courriel.
      </p>

      <p>— Benito Pepito</p>
    `,
  });

  console.log('✅ Emails envoyés avec SendGrid');
}