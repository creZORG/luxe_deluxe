import fetch from 'node-fetch';
import type { CartItem } from '@/hooks/use-cart';

const ZEPTO_API_URL = 'https://api.zeptomail.com/v1.1/email';
const ZEPTO_TOKEN = process.env.ZEPTO_TOKEN;
const FROM_EMAIL = 'noreply@luna-essentials.com';
const FROM_NAME = 'Luna';

async function sendEmail(payload: object) {
    if (!ZEPTO_TOKEN) {
        console.error('ZEPTO_TOKEN is not defined. Skipping email.');
        // In a real app, you might want to throw an error or handle this differently
        return Promise.resolve(); 
    }

    const response = await fetch(ZEPTO_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': ZEPTO_TOKEN,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorBody = await response.json();
        console.error('ZeptoMail API Error:', errorBody);
        throw new Error(`Failed to send email: ${errorBody.message || response.statusText}`);
    }

    return response.json();
}

type WelcomeEmailProps = {
    to: string;
    name: string;
};

export async function sendWelcomeEmail({ to, name }: WelcomeEmailProps) {
    const emailPayload = {
        from: { address: FROM_EMAIL, name: FROM_NAME },
        to: [{ email_address: { address: to, name: name } }],
        subject: 'Welcome to Luna!',
        htmlbody: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h1 style="color: #333;">Welcome, ${name}!</h1>
                <p>We are so excited to have you join the Luna family. Get ready to elevate your everyday essentials.</p>
                <p>You can start exploring our collections right away.</p>
                <a href="https://your-store-url.com" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">Shop Now</a>
                <p style="margin-top: 30px; font-size: 0.9em; color: #777;">Best,<br/>The Luna Team</p>
            </div>
        `,
    };

    return sendEmail(emailPayload);
}

type OrderConfirmationEmailProps = {
    to: string;
    name: string;
    items: CartItem[];
    subtotal: number;
    reference: string;
};

export async function sendOrderConfirmationEmail({ to, name, items, subtotal, reference }: OrderConfirmationEmailProps) {
    const itemsHtml = items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product.name} (${item.size})</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    const emailPayload = {
        from: { address: FROM_EMAIL, name: FROM_NAME },
        to: [{ email_address: { address: to, name: name } }],
        subject: `Your Luna Order Confirmation (#${reference})`,
        htmlbody: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h1 style="color: #333;">Thank you for your order, ${name}!</h1>
                <p>We've received your order and are getting it ready for shipment. Here are the details:</p>
                <h3>Order #${reference}</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="padding: 10px; border-bottom: 2px solid #333; text-align: left;">Product</th>
                            <th style="padding: 10px; border-bottom: 2px solid #333; text-align: left;">Quantity</th>
                            <th style="padding: 10px; border-bottom: 2px solid #333; text-align: right;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Subtotal:</td>
                            <td style="padding: 10px; text-align: right; font-weight: bold;">$${subtotal.toFixed(2)}</td>
                        </tr>
                         <tr>
                            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Shipping:</td>
                            <td style="padding: 10px; text-align: right; font-weight: bold;">FREE</td>
                        </tr>
                        <tr>
                            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #333;">Total:</td>
                            <td style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #333;">$${subtotal.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
                 <p style="margin-top: 30px; font-size: 0.9em; color: #777;">We'll notify you again once your order has shipped.</p>
                <p style="margin-top: 30px; font-size: 0.9em; color: #777;">Best,<br/>The Luna Team</p>
            </div>
        `,
    };

    return sendEmail(emailPayload);
}
