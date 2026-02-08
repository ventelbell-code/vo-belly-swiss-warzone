import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    // 1️⃣ Seguridad: validar token del bot MT5
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.MT5_WEBHOOK_SECRET;

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2️⃣ Variables de entorno
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return Response.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // 3️⃣ Inicializar Supabase (SIEMPRE dentro del handler)
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 4️⃣ Leer body
    const body = await req.json();
    console.log('📥 Webhook recibido:', body);

    const {
      event,
      account_id,
      broker,
      balance,
      equity,
      ticket,
      symbol,
      type,
      lot,
      profit
    } = body;

    // =========================
    // 🟢 HEARTBEAT / ESTADO BOT
    // =========================
    if (event === 'heartbeat') {
      if (!account_id) {
        return Response.json(
          { error: 'Missing account_id' },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from('bot_status')
        .upsert({
          account_id,
          broker: broker || 'Unknown',
          balance: balance ?? null,
          equity: equity ?? null,
          last_seen: new Date().toISOString()
        }, {
          onConflict: 'account_id'
        });

      if (error) {
        console.error('Supabase heartbeat error:', error);
        return Response.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return Response.json({ success: true, type: 'heartbeat' });
    }

    // =========================
    // 🔵 TRADE REAL
    // =========================
    if (event === 'trade') {
      if (!account_id || !ticket || !symbol) {
        return Response.json(
          { error: 'Missing required trade fields' },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from('trades')
        .insert({
          account_id,
          ticket,
          symbol,
          type,
          lot,
          profit,
          event,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Supabase trade error:', error);
        return Response.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return Response.json({ success: true, type: 'trade' });
    }

    // =========================
    // ❌ EVENTO DESCONOCIDO
    // =========================
    return Response.json(
      { error: 'Unknown event type' },
      { status: 400 }
    );

  } catch (err: any) {
    console.error('Webhook error:', err);
    return Response.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
