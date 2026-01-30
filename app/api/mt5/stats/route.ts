import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // 1️⃣ Últimas operaciones reales del bot
    const { data: trades, error: tradesError } = await supabase
      .from('trades')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (tradesError) throw tradesError;

    // 2️⃣ Cálculos reales
    const totalProfit = trades.reduce(
      (acc, t) => acc + Number(t.profit || 0),
      0
    );

    const totalLots = trades.reduce(
      (acc, t) => acc + Number(t.lot || 0),
      0
    );

    const totalOperations = trades.length;

    // 3️⃣ Último estado (último webhook recibido)
    const lastTrade = trades[0] || null;

    return new Response(
      JSON.stringify({
        status: 'ok',
        summary: {
          total_profit: Number(totalProfit.toFixed(2)),
          total_lot: Number(totalLots.toFixed(2)),
          total_operations: totalOperations,
        },
        last_trade: lastTrade,
        trades,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch MT5 stats' }),
      { status: 500 }
    );
  }
}
