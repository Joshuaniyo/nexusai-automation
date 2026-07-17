import { NextRequest } from 'next/server';
import { handleCoordinatorRequest } from '@/lib/agents/request-handler';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  return handleCoordinatorRequest(req);
}
