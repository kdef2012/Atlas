
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
  // Ensure Firebase is initialized and get the storage instance.
  const { storage } = initializeFirebase();

  // Create a storage reference. Files are stored in a path like:
  // /users/{userId}/proofs/{fileName}-{timestamp}
  // We sanitize the filename to prevent path issues or rule violations
  const timestamp = Date.now();
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
  const filePath = `users/${userId}/proofs/${cleanFileName}-${timestamp}`;
  const storageRef = ref(storage, filePath);

  try {
    // Add metadata to ensure correct categorization
    const metadata = {
      contentType: file.type || 'image/png',
    };

    // 'uploadBytes' resolves with the upload snapshot.
    const snapshot = await uploadBytes(storageRef, file, metadata);
    console.log('ATLAS Signal: Proof of Work uploaded successfully', snapshot.metadata.fullPath);

    // Get the public URL for the file.
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("ATLAS Signal Failure: Upload failed:", error);
    // Re-throw the error to be handled by the calling function.
    throw error;
  }
}
