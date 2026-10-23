import { createClient } from "@/lib/supabase/client";

/**
 * Uploads run from the browser straight to Storage, not through the server.
 * The caller's own session authorises them and the bucket policy checks the
 * folder is theirs, so there is nothing for a route handler to add.
 *
 * The filename is versioned rather than reused. Same path means same URL, and
 * both the browser and the image optimiser will serve the old picture from
 * cache — the same trap the landing page hero hit.
 */
export async function uploadAvatar(userId: string, file: File) {
  const supabase = createClient();
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${userId}/avatar-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { contentType: file.type });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}

/**
 * Documents go to a private bucket, so there is no URL to store — only the path.
 * Reading one back needs a signed URL, generated on the server at render time.
 */
export async function uploadCaregiverDocument(userId: string, file: File, kind: string) {
  const supabase = createClient();
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
  // The kind is in the path so a folder of uploads is readable at a glance, and
  // the timestamp keeps a replacement from being served from cache.
  const path = `${userId}/${kind}-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from("caregiver-documents")
    .upload(path, file, { contentType: file.type });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}

/** A signed URL is the only way to read a private object, and it expires. */
export async function signedDocumentUrl(path: string, expiresInSeconds = 3600) {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from("caregiver-documents")
    .createSignedUrl(path, expiresInSeconds);

  if (error) return null;

  return data.signedUrl;
}

/** Public bucket, so this is a plain URL with no expiry. */
export function avatarUrl(path: string) {
  const supabase = createClient();
  return supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
}
