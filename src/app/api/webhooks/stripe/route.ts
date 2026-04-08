
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { initializeFirebase } from '@/firebase';
import { doc, updateDoc, increment, collection, addDoc } from 'firebase/firestore';

/**
 * @fileOverview Stripe Webhook Fulfillment Endpoint
 * Securely processes completed checkout sessions to update user status and inventory.
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_build', {
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
        if (metadata.type === 'account_activation') {
          await updateDoc(userRef, {
            hasPaidAccess: true,
            gems: increment(5)
          });
        } else if (metadata.type === 'gem_purchase') {
          const amount = parseInt(metadata.amount || '0');
          await updateDoc(userRef, {
            gems: increment(amount)
          });
        }

        // Log to Global Ledger
        await addDoc(collection(firestore, 'transactions'), {
            userId: metadata.userId,
            type: metadata.type,
            amount: parseInt(metadata.amount || '0') || 0,
            price: parseFloat(metadata.price || '0'),
            timestamp: Date.now(),
            sessionId: session.id
        });

        console.log(`[Stripe Webhook] Successfully processed ${metadata.type} for user: ${metadata.userId}`);
      } catch (dbError) {
        console.error('[Stripe Webhook] Database fulfillment failed:', dbError);
        return NextResponse.json({ error: 'Fulfillment failed' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
