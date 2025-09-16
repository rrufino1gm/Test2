
import { sql } from '@vercel/postgres';

export const config = {
  runtime: 'edge',
  // Vercel Pro/Hobby allows up to 4.5MB, this is a safeguard.
  // The actual limit depends on the plan.
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const { data } = await request.json();

    if (!data || typeof data !== 'string' || !data.startsWith('data:') || !data.includes(';base64,')) {
      return new Response(JSON.stringify({ error: 'Dados de imagem inválidos. O formato esperado é um Data URL.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const result = await sql`
      INSERT INTO project_photos (data) 
      VALUES (${data}) 
      RETURNING id;
    `;
    
    const newPhotoId = result.rows[0].id;

    return new Response(JSON.stringify({ id: newPhotoId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('API Error (upload-photo):', error);
    const errorMessage = 'Erro ao salvar a foto no banco de dados.';
      
    return new Response(JSON.stringify({ error: errorMessage, details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
