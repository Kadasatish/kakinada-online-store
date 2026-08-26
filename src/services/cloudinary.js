const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const cloudinaryConfigured = Boolean(cloudName && uploadPreset);

export async function uploadToCloudinary(file) {
  if (!cloudinaryConfigured) {
    throw new Error("Cloudinary is not configured.");
  }

  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    { method: "POST", body }
  );

  if (!response.ok) {
    throw new Error("Cloudinary upload failed.");
  }

  const data = await response.json();
  return {
    url: data.secure_url,
    publicId: data.public_id,
    resourceType: data.resource_type
  };
}