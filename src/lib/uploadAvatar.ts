import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeFirebase } from '@/firebase/index';

/**
 * Converts a data URI to a Blob object
 */
function dataURItoBlob(dataURI: string): Blob {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

/**
 * Uploads a base64 data URI to Firebase Storage and returns the download URL
 * Uses Blobs for better reliability and performance with large files.
 */
export async function uploadAvatarToStorage(
  dataUri: string,
  userId: string,
  fileName: string = 'avatar.png'
): Promise<string> {
  if (!dataUri.startsWith('data:image')) {
    throw new Error('Invalid image data provided for upload.');
  }

  try {
    const { storage } = initializeFirebase();
    const timestamp = Date.now();
    const storagePath = `avatars/${userId}/${timestamp}_${fileName}`;
    const storageRef = ref(storage, storagePath);

    console.log(`[Storage] Synthesizing Blob for upload to: ${storagePath}`);
    const blob = dataURItoBlob(dataUri);

    console.log(`[Storage] Committing ${blob.size} bytes to cloud...`);
    const snapshot = await uploadBytes(storageRef, blob);
    
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log(`[Storage] Upload successful. URL generated.`);
    return downloadURL;
  } catch (error) {
    console.error('[Storage] Critical upload failure:', error);
    throw new Error(`Avatar storage failed: ${error instanceof Error ? error.message : 'Unknown cloud error'}`);
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
