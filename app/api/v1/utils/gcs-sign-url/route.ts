import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

const bucketName = process.env.GCS_BUCKET_NAME!;
const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT,
  credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? JSON.parse(Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'base64').toString('utf-8'))
    : undefined,
});

export async function POST(req: NextRequest) {
  try {
    const { filename, contentType } = await req.json();
    if (!filename || !contentType) {
      return NextResponse.json({ error: 'Missing filename or contentType' }, { status: 400 });
    }
    const file = storage.bucket(bucketName).file(filename);
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
      contentType,
    });
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;
    return NextResponse.json({ url, publicUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to generate signed URL' }, { status: 500 });
  }
} 