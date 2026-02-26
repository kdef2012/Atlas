
'use client';

import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeFirebase } from './index';

/**
 * Uploads a file to a user-specific path in Firebase Storage.
 * 
 * @param userId The UID of the user uploading the file.
 * @param file The file to upload.
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export async function uploadProofOfWork(userId: string, file: File): Promise<string> {
  if (!userId) {
    throw new Error('ATLAS Signal Error: User ID required for discovery proof.');
  }

  // Ensure Firebase is initialized and get the storage instance.
  const { storage, auth } = initializeFirebase();

  // Double check auth state before proceeding to avoid storage/unauthorized
  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    throw new Error('ATLAS Signal Error: Authentication mismatch. Please re-authenticate.');
  }

  // Create a storage reference. 
  // IMPORTANT: Path must match storage.rules exactly: /users/{userId}/proofs/{fileName}
  const timestamp = Date.now();
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
  const filePath = `users/${userId}/proofs/${timestamp}_${cleanFileName}`;
  const storageRef = ref(storage, filePath);

  try {
    // Add metadata to ensure correct categorization
    const metadata = {
      contentType: file.type || 'image/png',
      customMetadata: {
        'owner': userId,
        'type': 'proof_of_work'
      }
    };

    console.log(`[Storage] Transmitting proof for user ${userId} to path: ${filePath}`);

    // 'uploadBytes' resolves with the upload snapshot.
    const snapshot = await uploadBytes(storageRef, file, metadata);
    
    // Get the public URL for the file.
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('ATLAS Signal Locked: Proof of Work verified and stored.');
    
    return downloadURL;
  } catch (error: any) {
    console.error("ATLAS Signal Failure: Upload protocol failed:", error);
    
    if (error.code === 'storage/unauthorized') {
      throw new Error(`Access Denied: The Nebula Core rejected your signal. Ensure you are logged in and authorized to write to path: ${filePath}`);
    }
    
    throw error;
  }
}
