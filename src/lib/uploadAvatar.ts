import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';

/**
 * Uploads a base64 data URI to Firebase Storage and returns the download URL
 * @param dataUri - The base64 data URI (e.g., "data:image/png;base64,iVBORw0KG...")
 * @param userId - The user's ID for organizing storage
 * @param fileName - Optional custom filename
 * @returns Download URL from Firebase Storage
 */
export async function uploadAvatarToStorage(
  dataUri: string,
  userId: string,
  fileName: string = 'avatar.png'
): Promise<string> {
  try {
    const storage = getStorage();
    const timestamp = Date.now();
    // Use a clean path structure
    const storagePath = `avatars/${userId}/${timestamp}_${fileName}`;
    const storageRef = ref(storage, storagePath);

    console.log(`Starting upload to: ${storagePath}`);

    // Upload the base64 string directly using 'data_url' format
    const snapshot = await uploadString(storageRef, dataUri, 'data_url');
    
    // Get the public URL for the file
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log(`Upload complete. Download URL: ${downloadURL.substring(0, 50)}...`);
    return downloadURL;
  } catch (error) {
    console.error('Failed to upload avatar to storage:', error);
    throw new Error(`Avatar upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Uploads base avatar to storage (used during onboarding)
 */
export async function uploadBaseAvatar(
  dataUri: string,
  userId: string
): Promise<string> {
  return uploadAvatarToStorage(dataUri, userId, 'base_avatar.png');
}

/**
 * Uploads modified avatar to storage (used when applying cosmetics)
 */
export async function uploadModifiedAvatar(
  dataUri: string,
  userId: string
): Promise<string> {
  const timestamp = Date.now();
  return uploadAvatarToStorage(dataUri, userId, `avatar_${timestamp}.png`);
}
