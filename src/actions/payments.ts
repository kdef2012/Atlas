'use server';

/**
 * @fileOverview Server-side payment processing for ATLAS.
 * Handles the logic for both Simulated and Real Stripe payments.
 */

import { initializeFirebase } from '@/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-01-27.acacia' }) 
  : null;

/**
 * Initiates a purchase for Gems.
 */
export async function purchaseGems(userId: string, amount: number, price: number): Promise<{ success: boolean; message: string; url?: string }> {
  if (stripe) {
    console.log(`[Stripe Production] Generating Checkout Session for ${amount} gems...`);
    
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
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?status=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/store?status=cancelled`,
        metadata: {
          userId,
          type: 'gem_purchase',
          amount: amount.toString(),
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

  // FALLBACK: Simulation Mode (Active when STRIPE_SECRET_KEY is missing)
  console.log(`[Simulation Mode] Processing ${amount} gems at $${price}...`);
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    // In simulation, we update the DB directly. In production, the Stripe Webhook handles this.
    // Note: initializeFirebase() works on server side as well.
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', userId);
    
    await updateDoc(userRef, {
      gems: increment(amount)
    });

    return { 
      success: true, 
      message: `Successfully synthesized ${amount} Gems into your inventory! (Simulated)` 
    };
  } catch (error) {
    console.error('Gem purchase failed:', error);
    return { success: false, message: 'The ATLAS Core rejected the transaction.' };
  }
}

/**
 * Handles account activation fee.
 */
export async function activateAccount(userId: string): Promise<{ success: boolean; message: string; url?: string }> {
  if (stripe) {
    console.log(`[Stripe Production] Generating Activation Checkout for ${userId}...`);
    
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
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?status=activated`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/paywall?status=cancelled`,
        metadata: {
          userId,
          type: 'account_activation',
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
  console.log(`[Stripe Simulation] Processing $4.99 account activation for ${userId}...`);
  await new Promise(resolve => setTimeout(resolve, 2500));

  try {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', userId);
    
    await updateDoc(userRef, {
      hasPaidAccess: true,
      gems: increment(5) 
    });

    return { 
      success: true, 
      message: 'Account activated! Welcome to the premium Nebula experience. (Simulated)' 
    };
  } catch (error) {
    console.error('Account activation failed:', error);
    return { success: false, message: 'Activation failed.' };
  }
}
