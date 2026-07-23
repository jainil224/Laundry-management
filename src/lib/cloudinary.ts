import cloudinaryConfig from '../../cloudinary-config.json';

// Helper function to compress image file into a lightweight base64 Data URL
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// Helper function to generate SHA-1 hash using browser native Web Crypto API
async function sha1(str: string): Promise<string> {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Uploads a file to Cloudinary with secure SHA-1 signing or unsigned preset fallback
 */
export const uploadToCloudinary = async (
  file: File,
  cloudName?: string,
  onProgress?: (percent: number) => void
): Promise<string> => {
  const cName = cloudName || cloudinaryConfig.cloudName;
  const apiKey = cloudinaryConfig.apiKey;
  const apiSecret = cloudinaryConfig.apiSecret;
  const preset = cloudinaryConfig.uploadPreset || 'ml_default';

  // If cloudName is placeholder or default, skip network request and use compressed base64 directly
  if (!cName || cName === 'clothes-management' || cName === 'your_cloud_name') {
    throw new Error('Cloudinary cloud_name not configured yet');
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'wardrobe_clothes';

  const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = await sha1(stringToSign);

  return new Promise((resolve, reject) => {
    const url = `https://api.cloudinary.com/v1_1/${cName}/image/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('folder', folder);
    formData.append('signature', signature);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.secure_url) {
            resolve(response.secure_url);
            return;
          }
        } catch (e) {}
      }
      reject(new Error(`Cloudinary status ${xhr.status}`));
    };

    xhr.onerror = () => reject(new Error('Network error during Cloudinary upload'));
    xhr.send(formData);
  });
};
