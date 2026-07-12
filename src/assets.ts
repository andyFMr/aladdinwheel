import { get, set } from 'idb-keyval';

/**
 * Saves a base64 string or binary blob to IndexedDB
 */
export async function saveAssetToDB(id: string, base64Data: string): Promise<void> {
  await set(`asset_${id}`, base64Data);
}

/**
 * Retrieves a base64 string from IndexedDB
 */
export async function getAssetFromDB(id: string): Promise<string | null> {
  const data = await get(`asset_${id}`);
  return data ? String(data) : null;
}

/**
 * Helper to read a File object into a Base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}
