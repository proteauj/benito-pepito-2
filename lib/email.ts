// lib/email.ts
import nodemailer from 'nodemailer';

export async function sendOrderEmail(order: any, customer: any) {
console.log('📨 sendOrderEmail START');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'OK' : 'MISSING');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'OK' : 'MISSING');

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const itemsHtml = order.items
    .map((item: any) => `<li>${item.titleFr || item.title} – ${item.price} $</li>`)
    .join('');

  const shippingHtml =
    order.shippingMethod === 'pickup'
      ? `<p><strong>Ramassage :</strong><br/>4 rue Dufresne Saint-Jean-sur-Richelieu</p>`
      : `<p><strong>Livraison :</strong><br/>
         ${order.shippingAddress.name}<br/>
         ${order.shippingAddress.street}<br/>
         ${order.shippingAddress.city}, ${order.shippingAddress.province}<br/>
         ${order.shippingAddress.postalCode}</p>`;

  console.log('shippingHtml', shippingHtml);
  // Email artiste
  await transporter.sendMail({
    from: `"Benito Pepito" <${process.env.EMAIL_USER}>`,
    to: 'benitopepitoartiste@gmail.com',
    subject: '🖼️ Nouvelle commande reçue',
    html: `<h2>Nouvelle commande</h2>
           <p><strong>Paiement Square :</strong> ${order.squarePaymentId}</p>
           <h3>Produits</h3><ul>${itemsHtml}</ul>
           <p><strong>Total :</strong> ${order.totalAmount} ${order.currency}</p>
           ${shippingHtml}
           <p><strong>Email client :</strong> ${customer.email}</p>`,
  });

  // Email client
  await transporter.sendMail({
    from: `"Benito Pepito" <${process.env.EMAIL_USER}>`,
    to: customer.email,
    subject: '✨ Confirmation de votre commande',
    html: `<h2>Merci pour votre achat ✨</h2>
           <p>Votre commande a bien été reçue.</p>
           <h3>Œuvre(s)</h3><ul>${itemsHtml}</ul>
           <p><strong>Total :</strong> ${order.totalAmount} ${order.currency}</p>
           ${shippingHtml}
           <p>— Benito Pepito</p>`,
  });
}
