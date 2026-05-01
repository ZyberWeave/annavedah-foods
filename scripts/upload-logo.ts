import { put } from '@vercel/blob';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

async function uploadLogo() {
  const filePath = path.join(process.cwd(), 'public', 'Logo.webp');
  const fileBuffer = fs.readFileSync(filePath);
  
  const blob = await put('email-assets/Logo.webp', fileBuffer, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  
  console.log('Logo uploaded to Vercel Blob!');
  console.log('URL:', blob.url);
}

uploadLogo().catch(console.error);
