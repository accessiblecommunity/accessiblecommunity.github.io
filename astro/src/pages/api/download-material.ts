import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';
import { getSession } from 'src/lib/session-store';
import { downloadTokens } from './generate-download-token';

export const GET: APIRoute = async ({ request, url, clientAddress }) => {
  try {
    const searchParams = url.searchParams;
    const downloadToken = searchParams.get('token');

    if (!downloadToken) {
      return new Response('Missing download token', { status: 401 });
    }

    // Verify download token
    const tokenData = downloadTokens.get(downloadToken);
    
    if (!tokenData || Date.now() > tokenData.expiresAt || tokenData.used) {
      if (tokenData) {
        downloadTokens.delete(downloadToken); // Clean up
      }
      return new Response('Invalid or expired download token', { status: 401 });
    }

    // Mark token as used (one-time use only)
    tokenData.used = true;

    // Verify the associated session still exists
  const sessionData = getSession(tokenData.sessionId);
    
    if (!sessionData || Date.now() > sessionData.expiresAt) {
      downloadTokens.delete(downloadToken);
      return new Response('Session expired', { status: 401 });
    }

    // Verify browser fingerprint
    const userAgent = request.headers.get('user-agent') || '';
    const acceptLanguage = request.headers.get('accept-language') || '';
    const acceptEncoding = request.headers.get('accept-encoding') || '';
    const currentFingerprint = Buffer.from(`${userAgent}:${acceptLanguage}:${acceptEncoding}`).toString('base64');

    if (currentFingerprint !== sessionData.browserFingerprint) {
      downloadTokens.delete(downloadToken);
      return new Response('Unauthorized - Browser mismatch', { status: 401 });
    }

    const materialType = tokenData.materialType;

    // Validate material type
    const validMaterialTypes = [
      'setup-guide',
      'accessibility-guide', 
      'prop-templates',
      'assembly-instructions',
      'shopping-list'
    ];

    if (!validMaterialTypes.includes(materialType)) {
      return new Response('Not Found', { status: 404 });
    }

    // Construct file path based on material type
    let filePath: string;
    let fileName: string;
    let contentType: string;

    switch (materialType) {
      case 'setup-guide':
        filePath = path.join(process.cwd(), 'src', 'protected-materials', 'placeholder.pdf');
        fileName = `setup-guide-${sessionData.theme}.pdf`;
        contentType = 'application/pdf';
        break;
      case 'accessibility-guide':
        filePath = path.join(process.cwd(), 'src', 'protected-materials', 'placeholder.pdf');
        fileName = 'accessibility-guide.pdf';
        contentType = 'application/pdf';
        break;
      case 'prop-templates':
        filePath = path.join(process.cwd(), 'src', 'protected-materials', 'placeholder.pdf');
        fileName = `prop-templates-${sessionData.theme}.zip`;
        contentType = 'application/zip';
        break;
      case 'assembly-instructions':
        filePath = path.join(process.cwd(), 'src', 'protected-materials', 'placeholder.pdf');
        fileName = `assembly-instructions-${sessionData.theme}.pdf`;
        contentType = 'application/pdf';
        break;
      case 'shopping-list':
        filePath = path.join(process.cwd(), 'src', 'protected-materials', 'placeholder.pdf');
        fileName = `shopping-list-${sessionData.theme}.pdf`;
        contentType = 'application/pdf';
        break;
      default:
        return new Response('Not Found', { status: 404 });
    }

    try {
      // Check if file exists
      await fs.access(filePath);
      
      // Read file
      const fileBuffer = await fs.readFile(filePath);

      // Return file with appropriate headers
      return new Response(new Uint8Array(fileBuffer), {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Robots-Tag': 'noindex, nofollow'
        }
      });

    } catch (fileError) {
      console.error('File not found:', filePath);
      return new Response('File not found', { status: 404 });
    }

  } catch (error) {
    console.error('Error serving protected material:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
