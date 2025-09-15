
import { sql } from '@vercel/postgres';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const data = await request.json();

    if (!data || !data.phases || !data.projectName) {
      return new Response(JSON.stringify({ error: 'Dados inválidos recebidos.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Use JSON.stringify to pass the JSONB data correctly
    const dataJson = JSON.stringify(data);

    await sql`
      INSERT INTO public.project_data (id, data) 
      VALUES (1, ${dataJson}) 
      ON CONFLICT (id) 
      DO UPDATE SET data = EXCLUDED.data;
    `;
    
    return new Response(JSON.stringify({ success: true, message: 'Progresso salvo com sucesso.' }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
       },
    });

  } catch (error: any) {
    console.error('API Error (save-data):', error);
     const errorMessage = error.message.includes('relation "project_data" does not exist')
      ? 'A tabela do banco de dados não foi encontrada. Por favor, execute o comando SQL de criação da tabela no painel da Vercel.'
      : 'Erro ao salvar dados do projeto.';

    return new Response(JSON.stringify({ error: errorMessage, details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}