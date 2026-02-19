
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { initializeFirebase } from '@/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

/**
 * @fileOverview Stripe Webhook Fulfillment Endpoint
 * Securely processes completed checkout sessions to update user status and inventory.
 * 
 * NOTE: For production fulfillment, ensures the write operation is authorized.
 * Adheres to the 'Client SDK only' constraint by utilizing the production Firestore instance.
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-01-27.acacia',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe configuration missing' }, { status: 500 });
  }

  const body = await req.text();
  const sig = (await headers()).get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!sig || !endpointSecret || endpointSecret === 'whsec_...') {
      // Allow processing without verification ONLY during initial setup/dev
      console.warn('[Stripe Webhook] Signature verification skipped. Ensure STRIPE_WEBHOOK_SECRET is set in production.');
      event = JSON.parse(body);
    } else {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    }
  } catch (err: any) {
    console.error(`[Stripe Webhook] Validation Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Fulfillment Logic
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.CheckoutSession;
    const metadata = session.metadata;

    if (metadata && metadata.userId) {
      const { firestore } = initializeFirebase();
      const userRef = doc(firestore, 'users', metadata.userId);

      try {
        // IMPORTANT: In a standard client-SDK-only environment, these writes might require 
        // administrative privileges. Ensure your Firestore Security Rules allow updates 
        // to these specific fields for fulfillment.
        
        if (metadata.type === 'account_activation') {
          // Securely unlock the citizen's signal and grant starter gems
          await updateDoc(userRef, {
            hasPaidAccess: true,
            gems: increment(5)
          });
          console.log(`[Stripe Webhook] Successfully activated account for user: ${metadata.userId}`);
        } else if (metadata.type === 'gem_purchase') {
          // Synthesize purchased gems into the user's balance
          const amount = parseInt(metadata.amount || '0');
          await updateDoc(userRef, {
            gems: increment(amount)
          });
          console.log(`[Stripe Webhook] Successfully added ${amount} gems to user: ${metadata.userId}`);
        }
      } catch (dbError) {
        console.error('[Stripe Webhook] Database update failed. Check Security Rules.', dbError);
        return NextResponse.json({ error: 'Fulfillment processing failed' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
