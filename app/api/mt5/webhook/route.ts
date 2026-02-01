// app/api/mt5/webhook/route.ts
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    // 1️⃣ Seguridad: validar token del bot MT5
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.MT5_WEBHOOK_SECRET;

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2️⃣ Verificar variables de entorno (runtime)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return Response.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // 3️⃣ Inicializar Supabase DENTRO del POST
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 4️⃣ Leer datos del bot
    const body = await req.json();

    const {
      account_id,
      ticket,
      symbol,
      type,
      lot,
      profit,
      event
    } = body;

    if (!account_id || !ticket || !symbol) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 5️⃣ Insertar trade
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
      console.error('Supabase error:', error);
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return Response.json({ success: true });

  } catch (err: any) {
    console.error('Webhook error:', err);
    return Response.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
