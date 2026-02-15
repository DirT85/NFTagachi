import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

export async function GET(req: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    return new Promise<NextResponse>((resolve) => {
        // Use Node.js https module to bypass SSL checks (needed due to system clock mismatch)
        https.get(targetUrl, { rejectUnauthorized: false }, (res) => {
            if (res.statusCode !== 200) {
                console.error(`Proxy Fetch Failed (${res.statusCode}):`, targetUrl);
                resolve(NextResponse.json({ error: `Fetch failed: ${res.statusCode}` }, { status: 500 }));
                return;
            }

            const chunks: any[] = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => {
                const buffer = Buffer.concat(chunks);
                const headers = new Headers();
                headers.set('Content-Type', res.headers['content-type'] || 'application/octet-stream');
                headers.set('Cache-Control', 'public, max-age=31536000, immutable');
                headers.set('Access-Control-Allow-Origin', '*');
                resolve(new NextResponse(buffer, {
                    status: 200,
                    headers,
                }));
            });
        }).on('error', (err) => {
            console.error("Proxy Https Module Error:", err);
            resolve(NextResponse.json({ error: err.message }, { status: 500 }));
        });
    });
}
