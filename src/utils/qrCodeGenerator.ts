import QRCode from 'qrcode';

/**
 * Generates a high-resolution Data URL for the QR code.
 * Ensures high error correction and clean rendering.
 */
export async function generateQRCodeDataUrl(payload: string, width = 300): Promise<string> {
  try {
    return await QRCode.toDataURL(payload, {
      width,
      margin: 1,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0f172a', // Deep dark navy for maximum scanner contrast
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Failed to generate QR code data URL', err);
    return '';
  }
}

/**
 * Builds the standard secure payload for student QR codes.
 * Contains only the secure token verification endpoint, never raw sensitive personal data!
 */
export function buildSecureQRPayload(qrToken: string): string {
  // Use relative or full verify URL that can be read by both system scanners and external devices
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ess.edu.ng';
  return `${origin}/verify-student?token=${encodeURIComponent(qrToken)}`;
}

/**
 * Extracts the token from any scanned raw string (URL or direct token string)
 */
export function extractTokenFromScan(rawScanText: string): string {
  const text = rawScanText.trim();
  if (text.includes('token=')) {
    try {
      const url = new URL(text);
      const token = url.searchParams.get('token');
      if (token) return token.trim();
    } catch {
      const match = text.match(/[?&]token=([^&#]+)/);
      if (match && match[1]) return decodeURIComponent(match[1]).trim();
    }
  }
  return text;
}
