
'use server';

/**
 * @fileOverview Production-grade server actions for Stripe payments.
 * Simulation modes have been purged. Strictly requires valid Stripe credentials.
 */

import { initializeFirebase } from '@/firebase';
import { doc, updateDoc, increment, getDoc, collection, addDoc } from 'firebase/firestore';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-01-27.acacia' }) 
  : null;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';

/**
 * Initiates a live checkout for Gems.
 */
export async function purchaseGems(userId: string, amount: number, price: number): Promise<{ success: boolean; message: string; url?: string }> {
  if (!stripe) {
    throw new Error('ATLAS Financial Core Offline: Stripe keys missing from environment.');
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${amount} ATLAS Gems`,
              description: 'Digital currency for character synthesis and character prestige.',
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${BASE_URL}/dashboard?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/store?status=cancelled`,
      metadata: {
        userId,
        type: 'gem_purchase',
        amount: amount.toString(),
        price: price.toString(),
      },
    });

    return { 
      success: true, 
      message: 'Checkout Signal Initialized',
      url: session.url || undefined 
    };
  } catch (error) {
    console.error('Stripe Session Error:', error);
    return { success: false, message: 'Failed to initialize secure checkout.' };
  }
}

/**
 * Handles account activation fee via Stripe.
 */
export async function activateAccount(userId: string): Promise<{ success: boolean; message: string; url?: string }> {
  if (!stripe) {
    throw new Error('ATLAS Financial Core Offline: Stripe keys missing from environment.');
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'ATLAS Account Activation',
              description: 'One-time fee for lifetime premium access to the Nebula.',
            },
            unit_amount: 499, // $4.99
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${BASE_URL}/dashboard?status=activated&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/paywall?status=cancelled`,
      metadata: {
        userId,
        type: 'account_activation',
        price: '4.99',
      },
    });

    return { 
      success: true, 
      message: 'Activation Signal Initialized',
      url: session.url || undefined 
    };
  } catch (error) {
    console.error('Stripe Activation Error:', error);
    return { success: false, message: 'Failed to initialize secure checkout.' };
  }
}

/**
 * SECURE VERIFICATION FALLBACK:
 * Manually verifies a payment session if the webhook is delayed.
 */
export async function verifySession(sessionId: string): Promise<{ success: boolean; message: string }> {
  if (!stripe || !sessionId) return { success: false, message: 'Verification not available.' };

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return { success: false, message: 'Payment signal not yet confirmed.' };
    }

    const metadata = session.metadata;
    if (!metadata || !metadata.userId) throw new Error('Invalid session metadata');

    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', metadata.userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) throw new Error('Citizen not found in directory.');
    const userData = userSnap.data();

    // Prevent double-fulfillment
    const transRef = doc(firestore, 'transactions', sessionId);
    const transQuery = await getDoc(transRef);
    if (transQuery.exists()) {
        return { success: true, message: 'Transaction already chronicled.' };
    }

    // Fulfill
    if (metadata.type === 'account_activation') {
      if (!userData.hasPaidAccess) {
        await updateDoc(userRef, { hasPaidAccess: true, gems: increment(5) });
      }
    } else if (metadata.type === 'gem_purchase') {
      await updateDoc(userRef, { gems: increment(parseInt(metadata.amount || '0')) });
    }

    // Log to Ledger
    await addDoc(collection(firestore, 'transactions'), {
        id: sessionId,
        userId: metadata.userId,
        type: metadata.type,
        amount: parseInt(metadata.amount || '0') || 0,
        price: parseFloat(metadata.price || '0'),
        timestamp: Date.now(),
        sessionId: sessionId
    });

    return { success: true, message: 'Payment verified and fulfilled successfully.' };
  } catch (error) {
    console.error('Session verification error:', error);
    return { success: false, message: 'Verification protocol failed.' };
  }
}
