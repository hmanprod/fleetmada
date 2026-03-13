import 'server-only';
import { v2 as cloudinary } from 'cloudinary';

let configured = false;

const ensureConfigured = () => {
  if (configured) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary configuration missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });

  configured = true;
};

const baseFolder = (process.env.CLOUDINARY_FOLDER || 'fleetmada').replace(/^\/+|\/+$/g, '');

export type CloudinaryUploadResult = {
  secureUrl: string;
  publicId: string;
  resourceType: string;
  bytes: number;
  format?: string;
};

export const buildCloudinaryFolder = (...parts: Array<string | null | undefined>) => {
  const cleaned = parts
    .filter((p): p is string => Boolean(p))
    .map(part => part!.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean);

  if (cleaned.length === 0) {
    return baseFolder;
  }

  return `${baseFolder}/${cleaned.join('/')}`;
};

export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  options: { folder?: string; fileName?: string; resourceType?: string; tags?: string[] } = {}
): Promise<CloudinaryUploadResult> => {
  ensureConfigured();
  const publicId = options.fileName ? options.fileName.replace(/\.[^/.]+$/, '') : undefined;
  return await new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        resource_type: options.resourceType || 'auto',
        folder: options.folder,
        public_id: publicId,
        use_filename: !publicId,
        unique_filename: true,
        overwrite: false,
        tags: options.tags
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Cloudinary upload failed'));
          return;
        }

        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          bytes: result.bytes,
          format: result.format
        });
      }
    );

    upload.end(buffer);
  });
};

const CLOUDINARY_HOST = 'res.cloudinary.com';

export const isCloudinaryUrl = (url: string) => {
  return url.includes(CLOUDINARY_HOST);
};

export const parseCloudinaryAssetFromUrl = (url: string): { publicId: string; resourceType: string } | null => {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes(CLOUDINARY_HOST)) return null;

    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length < 4) return null;

    const resourceType = segments[1];
    const uploadIndex = segments.indexOf('upload');
    if (uploadIndex === -1) return null;

    const afterUpload = segments.slice(uploadIndex + 1);
    const versionIndex = afterUpload.findIndex(segment => /^v\d+$/.test(segment));
    const publicSegments = versionIndex >= 0 ? afterUpload.slice(versionIndex + 1) : afterUpload;

    if (publicSegments.length === 0) return null;

    const publicIdWithExt = publicSegments.join('/');
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');

    if (!publicId) return null;

    return { publicId, resourceType };
  } catch {
    return null;
  }
};

export const deleteCloudinaryAssetByUrl = async (url: string) => {
  ensureConfigured();
  const parsed = parseCloudinaryAssetFromUrl(url);
  if (!parsed) {
    return { ok: false, reason: 'not_cloudinary' as const };
  }

  const fallbackTypes = ['image', 'raw', 'video'];
  const typesToTry = [parsed.resourceType, ...fallbackTypes].filter(
    (value, index, self) => self.indexOf(value) === index
  );

  let lastResult: { result?: string } | null = null;

  for (const resourceType of typesToTry) {
    try {
      const result = await cloudinary.uploader.destroy(parsed.publicId, { resource_type: resourceType });
      lastResult = result as { result?: string };
      if (result && result.result === 'ok') {
        return { ok: true, result };
      }
      if (result && result.result === 'not found') {
        return { ok: true, result };
      }
    } catch (error) {
      lastResult = { result: error instanceof Error ? error.message : 'error' };
    }
  }

  return { ok: false, reason: 'delete_failed' as const, result: lastResult };
};
