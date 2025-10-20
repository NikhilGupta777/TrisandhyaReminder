import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import type { Request } from "express";

function getS3Client() {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error("AWS credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.");
  }
  
  return new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

function getBucketName() {
  if (!process.env.AWS_S3_BUCKET_NAME) {
    throw new Error("AWS S3 bucket not configured. Please set AWS_S3_BUCKET_NAME environment variable.");
  }
  return process.env.AWS_S3_BUCKET_NAME;
}

let uploadToS3Instance: multer.Multer | null = null;

export function getUploadToS3() {
  if (!uploadToS3Instance) {
    const s3Client = getS3Client();
    const bucketName = getBucketName();
    
    uploadToS3Instance = multer({
      storage: multerS3({
        s3: s3Client,
        bucket: bucketName,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: (req: Request, file: Express.Multer.File, cb: (error: any, metadata?: any) => void) => {
          cb(null, { fieldName: file.fieldname });
        },
        key: (req: Request, file: Express.Multer.File, cb: (error: any, key?: string) => void) => {
          const folder = (req as any).uploadFolder || "uploads";
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          const basename = path.basename(file.originalname, ext);
          cb(null, `${folder}/${basename}-${uniqueSuffix}${ext}`);
        },
      }) as any,
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
      fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        const allowedMimeTypes = [
          "audio/mpeg",
          "audio/mp3",
          "audio/wav",
          "audio/ogg",
          "audio/aac",
          "audio/m4a",
          "audio/flac",
          "video/mp4",
          "video/webm",
          "image/jpeg",
          "image/png",
          "image/webp",
          "application/pdf",
          "text/plain",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${allowedMimeTypes.join(", ")}`));
        }
      },
    });
  }
  return uploadToS3Instance;
}

export const uploadToS3 = new Proxy({} as multer.Multer, {
  get(_target, prop) {
    return (getUploadToS3() as any)[prop];
  }
});

export async function deleteFromS3(fileKey: string): Promise<void> {
  const s3Client = getS3Client();
  const bucketName = getBucketName();
  
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
  });
  await s3Client.send(command);
}

export async function getS3SignedUrl(fileKey: string, expiresIn: number = 3600): Promise<string> {
  const s3Client = getS3Client();
  const bucketName = getBucketName();
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
  });
  return await getSignedUrl(s3Client, command, { expiresIn });
}

export function extractS3Key(url: string): string | null {
  const match = url.match(/amazonaws\.com\/(.+)$/);
  return match ? match[1] : null;
}
