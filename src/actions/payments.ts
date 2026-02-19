
'use server';

/**
 * @fileOverview Server-side payment processing for ATLAS.
 * Handles the logic for both Simulated and Real Stripe payments.
 * Includes a manual session verification fallback for environments without stable webhooks.
 */

import { initializeFirebase } from '@/firebase';
import { doc, updateDoc, increment, getDoc, collection, addDoc } from 'firebase/firestore';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-01-27.acacia' }) 
  : null;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';

/**
 * Initiates a purchase for Gems.
 */
export async function purchaseGems(userId: string, amount: number, price: number): Promise<{ success: boolean; message: string; url?: string }> {
  if (stripe) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${amount} ATLAS Gems`,
                description: 'Digital currency for character synthesis.',
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
        message: 'Checkout Session Initialized',
        url: session.url || undefined 
      };
    } catch (error) {
      console.error('Stripe Session Error:', error);
      return { success: false, message: 'Failed to initialize secure checkout.' };
    }
  }

  // FALLBACK: Simulation Mode
  await new Promise(resolve => setTimeout(resolve, 2000));
  try {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', userId);
    await updateDoc(userRef, { gems: increment(amount) });
    
    // Log simulation transaction
    await addDoc(collection(firestore, 'transactions'), {
        userId,
        type: 'gem_purchase',
        amount,
        price,
        timestamp: Date.now(),
        sessionId: 'sim_' + Date.now()
    });

    return { success: true, message: `Successfully synthesized ${amount} Gems! (Simulated)` };
  } catch (error) {
    return { success: false, message: 'The ATLAS Core rejected the transaction.' };
  }
}

/**
 * Handles account activation fee.
 */
export async function activateAccount(userId: string): Promise<{ success: boolean; message: string; url?: string }> {
  if (stripe) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'ATLAS Account Activation',
                description: 'One-time fee for lifetime premium access.',
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
        message: 'Checkout Session Initialized',
        url: session.url || undefined 
      };
    } catch (error) {
      console.error('Stripe Activation Error:', error);
      return { success: false, message: 'Failed to initialize secure checkout.' };
    }
  }

  // FALLBACK: Simulation Mode
  await new Promise(resolve => setTimeout(resolve, 2500));
  try {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', userId);
    await updateDoc(userRef, { hasPaidAccess: true, gems: increment(5) });
    
    // Log simulation transaction
    await addDoc(collection(firestore, 'transactions'), {
        userId,
        type: 'account_activation',
        amount: 5,
        price: 4.99,
        timestamp: Date.now(),
        sessionId: 'sim_act_' + Date.now()
    });

    return { success: true, message: 'Account activated! (Simulated)' };
  } catch (error) {
    return { success: false, message: 'Activation failed.' };
  }
}

/**
 * SECURE FALLBACK: Verifies a session directly with Stripe.
 * Used when webhooks are not configured or are experiencing latency.
 */
export async function verifySession(sessionId: string): Promise<{ success: boolean; message: string }> {
  if (!stripe || !sessionId) return { success: false, message: 'Verification not available.' };

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return { success: false, message: 'Payment has not been processed yet.' };
    }

    const metadata = session.metadata;
    if (!metadata || !metadata.userId) throw new Error('Invalid session metadata');

    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', metadata.userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) throw new Error('User not found');
    const userData = userSnap.data();

    // Check if this session was already logged to prevent double-fulfillment
    const transQuery = await getDoc(doc(firestore, 'transactions', sessionId));
    if (transQuery.exists()) {
        return { success: true, message: 'Transaction already processed.' };
    }

    // Fulfill based on type
    if (metadata.type === 'account_activation') {
      if (!userData.hasPaidAccess) {
        await updateDoc(userRef, { hasPaidAccess: true, gems: increment(5) });
      }
    } else if (metadata.type === 'gem_purchase') {
      await updateDoc(userRef, { gems: increment(parseInt(metadata.amount || '0')) });
    }

    // Log the transaction in the ledger
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
    return { success: false, message: 'Verification failed.' };
  }
}
