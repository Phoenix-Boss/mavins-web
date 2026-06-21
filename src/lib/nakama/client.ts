// src/lib/nakama/client.ts
import { Client, Session } from '@heroiclabs/nakama-js';

const NAKAMA_HOST = process.env.NEXT_PUBLIC_NAKAMA_HOST || 'localhost';
const NAKAMA_PORT = parseInt(process.env.NEXT_PUBLIC_NAKAMA_PORT || '7350');
const NAKAMA_SSL = process.env.NEXT_PUBLIC_NAKAMA_SSL === 'true';
const NAKAMA_SERVER_KEY = process.env.NEXT_PUBLIC_NAKAMA_SERVER_KEY || 'defaultkey';

let nakamaClient: Client | null = null;
let currentSession: Session | null = null;

export const getNakamaClient = (): Client => {
  if (!nakamaClient) {
    nakamaClient = new Client(NAKAMA_SERVER_KEY, NAKAMA_HOST, String(NAKAMA_PORT), NAKAMA_SSL);
  }
  return nakamaClient;
};

export const setNakamaSession = (session: Session) => {
  currentSession = session;
};

export const getNakamaSession = (): Session | null => {
  return currentSession;
};

export const connectNakama = async (token: string): Promise<Session> => {
  const client = getNakamaClient();
  const session = await client.authenticateCustom(token, '', true);
  setNakamaSession(session);
  return session;
};

export const disconnectNakama = () => {
  currentSession = null;
  nakamaClient = null;
};

export const createSocket = async () => {
  const client = getNakamaClient();
  const session = getNakamaSession();
  if (!session) throw new Error('No active session');
  const socket = client.createSocket();
  await socket.connect(session, true);
  return socket;
};
