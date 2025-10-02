
'use server';

import fetch from 'node-fetch';
import type { CartItem } from '@/hooks/use-cart';
import type { Order } from './admin';
import type { UserRole } from '@/hooks/use-auth';

const ZEPTO_API_URL = 'https://api.zeptomail.com/v1.1/email';
const ZEPTO_TOKEN = process.env.ZEPTO_TOKEN;
const FROM_EMAIL = 'noreply@luna-essentials.com';
const FROM_NAME = 'Luna';

async function sendEmail(payload: object) {
    if (!ZEPTO_TOKEN) {
        console.warn('ZEPTO_TOKEN is not defined. Skipping email sending for development/staging. Order processing will continue.');
        return Promise.resolve({ message: "Email skipped, no token." }); 
    }

    try {
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
            // Throw an error to be caught by the calling function
            throw new Error(`Failed to send email: ${errorBody.message || response.statusText}`);
        }

        return response.json();
    } catch (error) {
        console.error("Error in sendEmail function:", error);
        // Re-throw the error to be handled by the caller
        throw error;
    }
}

type OrderConfirmationEmailProps = {
    to: string;
    name: string;
    items: CartItem[];
    subtotal: number;
    reference: string;
    pointsEarned: number;
};

export async function sendOrderConfirmationEmail({ to, name, items, subtotal, reference, pointsEarned }: OrderConfirmationEmailProps) {
    const itemsHtml = items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product.name} (${item.size})</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">KES ${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    const pointsHtml = pointsEarned > 0 ? `
        <div style="margin-top: 20px; padding: 15px; background-color: #f0f8ff; border-radius: 5px; text-align: center;">
            <p style="margin: 0; font-size: 1.1em; color: #333;">✨ You've earned <strong>${pointsEarned} loyalty points</strong> with this order! ✨</p>
        </div>
    ` : '';

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
                            <td style="padding: 10px; text-align: right; font-weight: bold;">KES ${subtotal.toFixed(2)}</td>
                        </tr>
                         <tr>
                            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Shipping:</td>
                            <td style="padding: 10px; text-align: right; font-weight: bold;">FREE</td>
                        </tr>
                        <tr>
                            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #333;">Total:</td>
                            <td style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #333;">KES ${subtotal.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
                ${pointsHtml}
                 <p style="margin-top: 30px; font-size: 0.9em; color: #777;">We'll notify you again once your order has shipped.</p>
                <p style="margin-top: 30px; font-size: 0.9em; color: #777;">Best,<br/>The Luna Team</p>
            </div>
        `,
    };

    return sendEmail(emailPayload);
}

export async function sendNewOrderAdminNotification(order: Order) {
    const adminEmail = process.env.ADMIN_EMAIL_RECIPIENT;
    if (!adminEmail) {
        console.log('ADMIN_EMAIL_RECIPIENT not set, skipping admin notification.');
        return;
    }
    const itemsHtml = order.items.map(item => `<li>${item.quantity} x ${item.productName} (${item.size})</li>`).join('');

    const emailPayload = {
        from: { address: FROM_EMAIL, name: 'Luna System' },
        to: [{ email_address: { address: adminEmail, name: 'Luna Admin' } }],
        subject: `[New Order] - #${order.reference}`,
        htmlbody: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h1 style="color: #333;">New Order Received!</h1>
                <p>A new order has been placed on the website.</p>
                <ul>
                    <li><strong>Order ID:</strong> #${order.reference}</li>
                    <li><strong>Customer:</strong> ${order.userName} (${order.userEmail})</li>
                    <li><strong>Total:</strong> KES ${order.subtotal.toFixed(2)}</li>
                </ul>
                <h3>Items:</h3>
                <ul>${itemsHtml}</ul>
                <a href="https://your-store-url.com/admin/orders" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">View Order in Admin Panel</a>
            </div>
        `,
    };
    return sendEmail(emailPayload);
}

type OrderShippedEmailProps = {
    order: Order;
};

export async function sendOrderShippedEmail({ order }: OrderShippedEmailProps) {
    const { userEmail, userName, reference, trackingNumber } = order;

    const emailPayload = {
        from: { address: FROM_EMAIL, name: FROM_NAME },
        to: [{ email_address: { address: userEmail, name: userName } }],
        subject: `Your Luna Order has Shipped! (#${reference})`,
        htmlbody: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h1 style="color: #333;">Your order is on its way!</h1>
                <p>Hi ${userName},</p>
                <p>Great news! Your order #${reference} has been shipped.</p>
                ${trackingNumber ? `<p>You can track your package with the following tracking number: <strong>${trackingNumber}</strong></p>` : ''}
                <p>Thank you for your patience. We hope you love your products!</p>
                <p style="margin-top: 30px; font-size: 0.9em; color: #777;">Best,<br/>The Luna Team</p>
            </div>
        `,
    };

    return sendEmail(emailPayload);
}

type RoleChangeEmailProps = {
    to: string;
    name: string;
    newRole: UserRole;
};

export async function sendRoleChangeEmail({ to, name, newRole }: RoleChangeEmailProps) {
    const roleName = newRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    let roleDescription = '';
    switch (newRole) {
        case 'admin':
            roleDescription = 'You now have full administrative access to the Luna dashboard. You can manage products, orders, users, and site content.';
            break;
        case 'customer':
            roleDescription = 'You are a customer. You can browse products and make purchases.';
            break;
        case 'digital_marketer':
            roleDescription = 'You now have access to the Marketing section of the admin dashboard to create promo codes and tracking links.';
            break;
        case 'fulfillment':
            roleDescription = 'You now have access to the Orders section of the admin dashboard to process and ship orders.';
            break;
        case 'influencer':
            roleDescription = 'You can now access the Influencer Portal to get your referral links and track your performance.';
            break;
        case 'sales':
            roleDescription = 'You can now access the Sales Portal to manage your customer orders.';
            break;
    }

    const emailPayload = {
        from: { address: FROM_EMAIL, name: FROM_NAME },
        to: [{ email_address: { address: to, name: name } }],
        subject: `Your Role on Luna has been updated`,
        htmlbody: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h1 style="color: #333;">Your Account Role has Changed</h1>
                <p>Hi ${name},</p>
                <p>An administrator has updated your role on the Luna platform. Your new role is: <strong>${roleName}</strong>.</p>
                <p>${roleDescription}</p>
                <p>If you have any questions or believe this change was made in error, please contact our support team.</p>
                <p style="margin-top: 30px; font-size: 0.9em; color: #777;">Best,<br/>The Luna Team</p>
            </div>
        `,
    };

    return sendEmail(emailPayload);
}
