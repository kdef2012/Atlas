
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
  const timestamp = Date.now();
  const filePath = `users/${userId}/proofs/${file.name}-${timestamp}`;
  const storageRef = ref(storage, filePath);

  try {
    // 'uploadBytes' resolves with the upload snapshot.
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Uploaded a blob or file!', snapshot);

    // Get the public URL for the file.
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Upload failed:", error);
    // Re-throw the error to be handled by the calling function.
    throw error;
  }
}
