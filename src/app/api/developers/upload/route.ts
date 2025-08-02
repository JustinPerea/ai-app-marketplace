/**
 * Developer File Upload API Endpoint
 * 
 * Handles file uploads for app screenshots, icons, and other assets
 * Supports multiple file formats with validation and size limits
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { requireDeveloper } from '@/lib/auth/developer-auth';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'developer-assets');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/svg+xml'
];

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directory:', error);
  }
}

// Validate file type and size
function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}` 
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` 
    };
  }

  return { valid: true };
}

// Generate safe filename
function sanitizeFilename(originalName: string): string {
  const extension = originalName.split('.').pop() || '';
  const uuid = randomUUID();
  const timestamp = Date.now();
  return `${uuid}-${timestamp}.${extension}`;
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { user, developerId, error } = await requireDeveloper(request);
    
    if (error || !developerId) {
      return NextResponse.json(
        { error: error || 'Developer authentication required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('type') as string; // 'icon', 'screenshot', 'demo'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    await ensureUploadDir();

    // Generate safe filename
    const filename = sanitizeFilename(file.name);
    const filepath = join(UPLOAD_DIR, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filepath, buffer);

    // Generate public URL
    const publicUrl = `/uploads/developer-assets/${filename}`;

    console.log('File uploaded successfully:', {
      originalName: file.name,
      filename,
      size: file.size,
      type: file.type,
      fileType,
      publicUrl
    });

    return NextResponse.json({
      message: 'File uploaded successfully',
      filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      url: publicUrl,
      fileType
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Handle multiple file uploads
export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const { user, developerId, error } = await requireDeveloper(request);
    
    if (error || !developerId) {
      return NextResponse.json(
        { error: error || 'Developer authentication required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const fileType = formData.get('type') as string;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    if (files.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 files allowed per upload' },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    await ensureUploadDir();

    const uploadResults = [];
    const errors = [];

    for (const file of files) {
      try {
        // Validate each file
        const validation = validateFile(file);
        if (!validation.valid) {
          errors.push({ filename: file.name, error: validation.error });
          continue;
        }

        // Generate safe filename and save
        const filename = sanitizeFilename(file.name);
        const filepath = join(UPLOAD_DIR, filename);
        
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        await writeFile(filepath, buffer);

        const publicUrl = `/uploads/developer-assets/${filename}`;
        
        uploadResults.push({
          originalName: file.name,
          filename,
          size: file.size,
          type: file.type,
          url: publicUrl
        });

      } catch (error) {
        errors.push({ 
          filename: file.name, 
          error: 'Failed to upload file' 
        });
      }
    }

    console.log('Batch upload completed:', {
      successful: uploadResults.length,
      errors: errors.length,
      fileType
    });

    return NextResponse.json({
      message: `${uploadResults.length} files uploaded successfully`,
      files: uploadResults,
      errors: errors.length > 0 ? errors : undefined,
      fileType
    });

  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}