import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/auth';
import { encryptSocialToken } from '@/lib/social/encryption';

type TelegramResult<T> = { ok: boolean; result?: T; description?: string };

export async function POST(req: NextRequest) {
  try {
    const { supabase } = createSupabaseServerClient(req);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const botToken = typeof body.botToken === 'string' ? body.botToken.trim() : '';
    const chatId = typeof body.chatId === 'string' ? body.chatId.trim() : '';
    if (!/^\d{6,12}:[A-Za-z0-9_-]{25,}$/.test(botToken) || !/^(@[A-Za-z0-9_]{5,}|-?\d+)$/.test(chatId)) {
      return NextResponse.json({ error: 'Enter a valid Telegram bot token and channel username or chat ID.' }, { status: 400 });
    }
    const [botResponse, chatResponse] = await Promise.all([
      fetch(`https://api.telegram.org/bot${botToken}/getMe`, { cache: 'no-store' }),
      fetch(`https://api.telegram.org/bot${botToken}/getChat?chat_id=${encodeURIComponent(chatId)}`, { cache: 'no-store' }),
    ]);
    const bot = await botResponse.json() as TelegramResult<{ username?: string }>;
    const chat = await chatResponse.json() as TelegramResult<{ title?: string; username?: string }>;
    if (!bot.ok) return NextResponse.json({ error: bot.description || 'Telegram rejected this bot token.' }, { status: 400 });
    if (!chat.ok) return NextResponse.json({ error: chat.description || 'The bot cannot access this Telegram destination.' }, { status: 400 });
    const { error } = await supabase.from('social_connections').upsert({
      user_id: user.id,
      platform: 'telegram',
      token_encrypted: encryptSocialToken(botToken),
      platform_account_name: chat.result?.title || chat.result?.username || chatId,
      metadata: { chat_id: chatId, bot_username: bot.result?.username ?? null },
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,platform' });
    if (error) throw error;
    return NextResponse.json({ connected: true, accountName: chat.result?.title || chat.result?.username || chatId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Telegram connection failed.' }, { status: 500 });
  }
}
