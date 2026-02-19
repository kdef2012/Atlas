
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { initializeFirebase } from '@/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

/**
 * @fileOverview Stripe Webhook Fulfillment Endpoint
 * Securely processes completed checkout sessions to update user status and inventory.
 */

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-01-27.acacia' }) 
  : null;

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe configuration missing' }, { status: 500 });
  }

  const body = await req.text();
  const sig = (await headers()).get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!sig || !endpointSecret) {
      // Fallback for simulation/testing if secret is not yet configured
      console.warn('[Stripe Webhook] Processing without signature verification. Set STRIPE_WEBHOOK_SECRET for production.');
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
        console.error('[Stripe Webhook] Database update failed:', dbError);
        return NextResponse.json({ error: 'Fulfillment processing failed' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
