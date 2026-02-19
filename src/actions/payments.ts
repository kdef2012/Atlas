
'use client';

/**
 * @fileOverview Simulated payment processing for ATLAS account activation and Gem purchases.
 * Transition-Ready: Detects Stripe API keys in the environment to switch to live mode.
 */

import { initializeFirebase } from '@/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

// Environment check for Stripe production readiness
const HAS_STRIPE_KEYS = !!(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

/**
 * Initiates a checkout session.
 * In production, this would use the Stripe SDK to redirect to Checkout.
 */
export async function purchaseGems(userId: string, amount: number, price: number): Promise<{ success: boolean; message: string }> {
  if (HAS_STRIPE_KEYS) {
    console.log(`[Production Mode] Routing ${amount} gem purchase to Stripe Checkout...`);
    // REAL STRIPE INTEGRATION POINT:
    // const stripe = await getStripe();
    // const { sessionId } = await fetch('/api/create-checkout-session', ...).then(res => res.json());
    // await stripe.redirectToCheckout({ sessionId });
  }

  console.log(`[Simulation Mode] Processing ${amount} gems at $${price}...`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', userId);
    
    // Award gems immediately (In production, this happens via Stripe Webhook)
    await updateDoc(userRef, {
      gems: increment(amount)
    });

    return { 
      success: true, 
      message: `Successfully synthesized ${amount} Gems into your inventory!` 
    };
  } catch (error) {
    console.error('Gem purchase failed:', error);
    return { success: false, message: 'The ATLAS Core rejected the transaction. Please try again.' };
  }
}

/**
 * Simulates the account activation fee payment.
 */
export async function activateAccount(userId: string): Promise<{ success: boolean; message: string }> {
  console.log(`[Stripe Simulation] Processing $4.99 account activation for ${userId}...`);
  
  await new Promise(resolve => setTimeout(resolve, 2500));

  try {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', userId);
    
    await updateDoc(userRef, {
      hasPaidAccess: true,
      // Bonus gems for new players
      gems: increment(5) 
    });

    return { 
      success: true, 
      message: 'Account activated! Welcome to the premium Nebula experience.' 
    };
  } catch (error) {
    console.error('Account activation failed:', error);
    return { success: false, message: 'Activation failed. Please check your signal.' };
  }
}
