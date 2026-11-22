import { supabase } from '../supabaseClient';

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'No image file selected.' };
  }

  if (file.type && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error:
        'Unsupported image format. Please choose a JPG, PNG, WebP, GIF, or AVIF image.',
    };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return {
      valid: false,
      error: `Image is too large (${formatFileSize(
        file.size
      )}). Maximum allowed size is 5 MB.`,
    };
  }

  return { valid: true, error: '' };
}

export async function uploadToProjectImages({
  file,
  folder,
  fileNamePrefix = '',
  upsert = false,
}) {
  const check = validateImageFile(file);
  if (!check.valid) {
    throw new Error(check.error);
  }

  const rawExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const safeExt = rawExt.replace(/[^a-z0-9]/g, '') || 'jpg';
  const randomSuffix = Math.random().toString(36).slice(2, 9);
  const baseName = fileNamePrefix
    ? `${fileNamePrefix}-${Date.now()}-${randomSuffix}.${safeExt}`
    : `${Date.now()}-${randomSuffix}.${safeExt}`;
  const path = `${folder}/${baseName}`;

  const { error } = await supabase.storage
    .from('project-images')
    .upload(path, file, {
      contentType: file.type || 'image/jpeg',
      upsert,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from('project-images').getPublicUrl(path);
  return {
    path,
    publicUrl: data.publicUrl,
  };
}
