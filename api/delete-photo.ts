
import { sql } from '@vercel/postgres';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const { id } = await request.json();

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID da foto é obrigatório.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    await sql`DELETE FROM project_photos WHERE id = ${id};`;
    
    return new Response(JSON.stringify({ success: true, message: 'Foto removida com sucesso.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('API Error (delete-photo):', error);
    const errorMessage = 'Erro ao remover a foto do banco de dados.';
      
    return new Response(JSON.stringify({ error: errorMessage, details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
