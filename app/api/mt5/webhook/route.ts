import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
console.log("📡 MT5 DATA RECEIVED:", body);
    const {
      account_id,
      ticket,
      symbol,
      type,
      lot,
      profit,
      event
    } = body;

    // 🔒 Validación dura (producción)
    //if (
    //  !account_id ||
    //  ticket == null ||
    //  !symbol ||
     // !type ||
     // lot == null ||
     // profit == null ||
     // !event
    //) {
     // return Response.json(
     //   { error: 'Missing fields' },
     //   { status: 400 }
     // );
    //}

    // 🧠 Normalización MT5 → DB
    const trade = {
      account_id: String(account_id),
      ticket: Number(ticket),
      symbol: String(symbol),
      type: String(type),
      lot: Number(lot),
      profit: Number(profit),
      event: String(event),
      updated_at: new Date().toISOString()
    };

    // 🛑 Evitar duplicados (mismo ticket + evento)
    const { data: existing } = await supabase
      .from('trades')
      .select('id')
      .eq('ticket', trade.ticket)
      .eq('event', trade.event)
      .limit(1)
      .maybeSingle();

    if (existing) {
      return Response.json(
        { status: 'duplicate_ignored' },
        { status: 200 }
      );
    }

    // 💾 Insert real
    const { error } = await supabase
      .from('trades')
      .insert([trade]);

    if (error) {
      console.error('DB ERROR:', error);
      return Response.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    return Response.json(
      {
        status: 'ok',
        trade
      },
      { status: 200 }
    );

  } catch (err) {
    console.error('WEBHOOK ERROR:', err);
    return Response.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
