
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeFirebase } from '@/firebase/index';

/**
 * Converts a data URI to a Blob object
 */
function dataURItoBlob(dataURI: string): Blob {
  const parts = dataURI.split(',');
  if (parts.length < 2) throw new Error('Invalid data URI');
  
  const byteString = atob(parts[1]);
  const mimeString = parts[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

/**
 * Uploads a base64 data URI to Firebase Storage and returns the download URL
 * Uses Blobs for better reliability and adds explicit metadata for security rules.
 */
export async function uploadAvatarToStorage(
  dataUri: string,
  userId: string,
  fileName: string = 'avatar.png'
): Promise<string> {
  if (!dataUri.startsWith('data:image')) {
    throw new Error('Invalid image data provided for upload.');
  }

  if (!userId) {
    throw new Error('User ID is required for character synthesis storage.');
  }

  try {
    const { storage } = initializeFirebase();
    const timestamp = Date.now();
    // Path MUST match the storage.rules exactly: /avatars/{userId}/...
    const storagePath = `avatars/${userId}/${timestamp}_${fileName}`;
    const storageRef = ref(storage, storagePath);

    console.log(`[Storage] Initiating character render upload for user ${userId} to: ${storagePath}`);
    const blob = dataURItoBlob(dataUri);
    
    // Explicitly setting metadata helps Storage Rules validate the upload
    const metadata = {
      contentType: blob.type || 'image/png',
      customMetadata: {
        'owner': userId,
        'uploadedAt': new Date().toISOString(),
        'type': 'character_synthesis'
      }
    };

    const snapshot = await uploadBytes(storageRef, blob, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log(`[Storage] Character synthesis complete. Public URL: ${downloadURL}`);
    return downloadURL;
  } catch (error: any) {
    console.error('[Storage] Critical character synthesis failure:', error);
    
    if (error.code === 'storage/unauthorized') {
      throw new Error(`Access Denied: Your signal was rejected by the character forge. Path: avatars/${userId}/...`);
    }
    
    throw new Error(`Character synthesis storage failed: ${error.message || 'Unknown cloud error'}`);
  }
}

/**
 * Uploads base avatar to storage (used during onboarding)
 */
export async function uploadBaseAvatar(
  dataUri: string,
  userId: string
): Promise<string> {
  return uploadAvatarToStorage(dataUri, userId, 'base_twinskie.png');
}

/**
 * Uploads modified avatar to storage (used when applying cosmetics)
 */
export async function uploadModifiedAvatar(
  dataUri: string,
  userId: string
): Promise<string> {
  return uploadAvatarToStorage(dataUri, userId, `twinskie_variant_${Date.now()}.png`);
}
