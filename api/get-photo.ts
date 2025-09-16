
import { sql } from '@vercel/postgres';

export const config = {
  runtime: 'edge',
};

// This function converts a base64 string to an ArrayBuffer.
// It's needed because the Edge runtime doesn't have Buffer.
const base64ToArrayBuffer = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};


export default async function handler(request: Request) {
  if (request.method !== 'GET') {
     return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response(JSON.stringify({ error: 'ID da foto é obrigatório.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const { rows } = await sql`SELECT data FROM project_photos WHERE id = ${id};`;

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Foto não encontrada.' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    const dataUrl = rows[0].data;
    const parts = dataUrl.split(',');
    
    if (parts.length !== 2) {
       throw new Error('Formato de Data URL inválido no banco de dados.');
    }

    const meta = parts[0];
    const base64Data = parts[1];
    
    const mimeMatch = meta.match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) {
        throw new Error('Não foi possível extrair o MIME type do Data URL.');
    }
    const mimeType = mimeMatch[1];
    
    const buffer = base64ToArrayBuffer(base64Data);
    
    return new Response(buffer, {
        status: 200,
        headers: {
            'Content-Type': mimeType,
            'Content-Length': buffer.byteLength.toString(),
            // Cache a imagem por um ano no navegador do cliente e em CDNs
            'Cache-Control': 'public, max-age=31536000, immutable',
        },
    });

  } catch (error: any) {
    console.error(`API Error (get-photo, id: ${id}):`, error);
    return new Response(JSON.stringify({ error: 'Erro ao buscar a foto.', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
