import { Phase, TaskStatus } from './types';

export const INITIAL_PROJECT_PHASES: Phase[] = [
  {
    id: 1,
    name: '1. Início da Obra',
    deliveryDate: '21/09/2025',
    tasks: [
      { id: 101, name: 'Limpeza', status: TaskStatus.Pending, images: [] },
      { id: 102, name: 'Barraco', status: TaskStatus.Pending, images: [] },
    ],
  },
  {
    id: 2,
    name: '2. Estrutura e Cobertura',
    deliveryDate: '19/01/2026',
    tasks: [
      { id: 201, name: 'Fundação', status: TaskStatus.Pending, images: [] },
      { id: 202, name: 'Levantar parede', status: TaskStatus.Pending, images: [] },
      { id: 203, name: 'Laje', status: TaskStatus.Pending, images: [] },
      { id: 204, name: 'Telhado', status: TaskStatus.Pending, images: [] },
    ],
  },
  {
    id: 3,
    name: '3. Rebocos e Instalações',
    deliveryDate: '19/04/2026',
    tasks: [
      { id: 301, name: 'Reboco', status: TaskStatus.Pending, images: [] },
      { id: 302, name: 'Elétrica', status: TaskStatus.Pending, images: [] },
      { id: 303, name: 'Hidráulica', status: TaskStatus.Pending, images: [] },
      { id: 304, name: 'Ar-condicionado', status: TaskStatus.Pending, images: [] },
    ],
  },
  {
    id: 4,
    name: '4. Gesso e Pisos',
    deliveryDate: '18/07/2026',
    tasks: [
      { id: 401, name: 'Gesso', status: TaskStatus.Pending, images: [] },
      { id: 402, name: 'Forro', status: TaskStatus.Pending, images: [] },
      { id: 403, name: 'Piso', status: TaskStatus.Pending, images: [] },
      { id: 404, name: 'Acabamento', status: TaskStatus.Pending, images: [] },
    ],
  },
  {
    id: 5,
    name: '5. Portas e Louças',
    deliveryDate: '16/09/2026',
    tasks: [
      { id: 501, name: 'Porta', status: TaskStatus.Pending, images: [] },
      { id: 502, name: 'Janela', status: TaskStatus.Pending, images: [] },
      { id: 503, name: 'Pias', status: TaskStatus.Pending, images: [] },
      { id: 504, name: 'Metais', status: TaskStatus.Pending, images: [] },
      { id: 505, name: 'Elétrica final', status: TaskStatus.Pending, images: [] },
    ],
  },
  {
    id: 6,
    name: '6. Pintura e Entrega',
    deliveryDate: '15/11/2026',
    tasks: [
      { id: 601, name: 'Pintura interna e externa', status: TaskStatus.Pending, images: [] },
      { id: 602, name: 'Limpeza final', status: TaskStatus.Pending, images: [] },
    ],
  },
];
