import { sql } from '@vercel/postgres';
import { INITIAL_PROJECT_PHASES, INITIAL_PAYMENT_MILESTONES } from '../constants';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  try {
    const { rows } = await sql`SELECT data FROM public.project_data WHERE id = 1;`;

    let data;
    if (rows.length > 0) {
      data = rows[0].data;
    } else {
      // If no data, initialize with default state
      const initialState = {
        projectName: 'Acompanhamento de Obra',
        phases: INITIAL_PROJECT_PHASES,
        logs: [
            {
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                message: 'Projeto inicializado na nuvem.',
            }
        ],
        driveFolderPath: 'Minha Obra/Fotos',
        paymentMilestones: INITIAL_PAYMENT_MILESTONES,
      };
      await sql`INSERT INTO public.project_data (id, data) VALUES (1, ${JSON.stringify(initialState)});`;
      data = initialState;
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
       },
    });

  } catch (error: any) {
    console.error('API Error (get-data):', error);
    const errorMessage = error.message.includes('relation "project_data" does not exist')
      ? 'A tabela do banco de dados não foi encontrada. Verifique se o comando de criação foi executado corretamente no painel da Vercel.'
      : 'Erro ao buscar dados do projeto.';
      
    return new Response(JSON.stringify({ error: errorMessage, details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}