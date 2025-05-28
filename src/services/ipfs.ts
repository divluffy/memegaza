// src/services/ipfs.ts

import { create, IPFSHTTPClient } from "ipfs-http-client";

// تحميل بيانات Infura من المتغيرات البيئية
const projectId = process.env.REACT_APP_INFURA_PROJECT_ID;
const projectSecret = process.env.REACT_APP_INFURA_PROJECT_SECRET;

// تأكد من وجود القيم
if (!projectId || !projectSecret) {
  throw new Error("Missing INFURA_PROJECT_ID or INFURA_PROJECT_SECRET in .env");
}

// Basic auth header باستخدام btoa بدل Buffer
const auth = "Basic " + btoa(`${projectId}:${projectSecret}`);

// إنشاء عميل IPFS مع المصادقة
export const ipfsClient: IPFSHTTPClient = create({
  url: "https://ipfs.infura.io:5001/api/v0",
  headers: {
    authorization: auth,
  },
});

/**
 * Upload an image file to IPFS after validating size/dimensions.
 */
export async function uploadFile(file: File): Promise<string> {
  // 1. تأكد من الحجم < 100 KB
  if (file.size > 100 * 1024) {
    throw new Error("File size exceeds 100 KB");
  }

  // 2. فحص الأبعاد (مثلاً حتى 512×512)
  await new Promise<void>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        if (img.width > 512 || img.height > 512) {
          reject(new Error("Image dimensions exceed 512×512"));
        } else {
          resolve();
        }
      };
      img.onerror = () =>
        reject(new Error("Failed to load image for size check"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

  // 3. رفع الملف
  const added = await ipfsClient.add(file);
  return `https://ipfs.infura.io/ipfs/${added.path}`;
}

/**
 * Upload metadata JSON to IPFS.
 */
export async function uploadJSON(json: object): Promise<string> {
  const str = JSON.stringify(json);
  const added = await ipfsClient.add(str);
  return `https://ipfs.infura.io/ipfs/${added.path}`;
}
