// app/api/email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { order, customer } = await req.json();

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // 🖼️ résumé produits
    const itemsHtml = order.items?
      .map(
        (item: any) =>
          `<li>${item.titleFr || item.title} – ${item.price} $</li>`
      )
      .join(''):[];

    const shippingHtml =
      order.shippingMethod === 'pickup'
        ? `
          <p><strong>Ramassage :</strong><br/>
          Saint-Jean-sur-Richelieu<br/>
          L’adresse exacte sera communiquée sous peu.</p>
        `
        : `
          <p><strong>Livraison :</strong><br/>
          ${order.shippingAddress.name}<br/>
          ${order.shippingAddress.street}<br/>
          ${order.shippingAddress.city}, ${order.shippingAddress.province}<br/>
          ${order.shippingAddress.postalCode}
          </p>
        `;

    // =========================
    // 📩 EMAIL ARTISTE
    // =========================
    await transporter.sendMail({
      from: `"Benito Pepito" <${process.env.EMAIL_USER}>`,
      to: 'benitopepitoartiste@gmail.com',
      subject: '🖼️ Nouvelle commande reçue',
      html: `
        <h2>Nouvelle commande</h2>
        <p><strong>Paiement Square :</strong> ${order.squarePaymentId}</p>

        <h3>Produits</h3>
        <ul>${itemsHtml}</ul>

        <p><strong>Total :</strong> ${order.totalAmount} ${order.currency}</p>

        ${shippingHtml}

        <p><strong>Email client :</strong> ${customer.email}</p>
      `,
    });

    // =========================
    // 📩 EMAIL CLIENT
    // =========================
    await transporter.sendMail({
      from: `"Benito Pepito" <${process.env.EMAIL_USER}>`,
      to: customer.email,
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

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('EMAIL ERROR', err);
    return NextResponse.json(
      { error: 'Erreur envoi email' },
      { status: 500 }
    );
  }
}