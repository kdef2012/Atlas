
'use client';

/**
 * @fileOverview Simulated payment processing for ATLAS account activation and Gem purchases.
 * In a production environment, these would interface with Stripe API and handle webhooks.
 */

import { initializeFirebase } from '@/firebase';
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';

/**
 * Simulates a Stripe Checkout session for Gem packages.
 * awards gems to user on "success".
 */
export async function purchaseGems(userId: string, amount: number, price: number): Promise<{ success: boolean; message: string }> {
  console.log(`[Stripe Simulation] Initiating checkout for ${amount} gems at $${price}...`);
  
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
