// app/api/mt5/stats/route.ts
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  try {
    // 1️⃣ Verifica variables de entorno
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return Response.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // 2️⃣ Inicializa Supabase SOLO en runtime
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3️⃣ Consulta últimas operaciones
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // 4️⃣ Estadísticas básicas
    const totalTrades = data?.length || 0;
    const totalProfit =
      data?.reduce((sum, trade) => sum + (trade.profit || 0), 0) || 0;
    const totalLots =
      data?.reduce((sum, trade) => sum + (trade.lot || 0), 0) || 0;

    return Response.json({
      success: true,
      stats: {
        total_trades: totalTrades,
        total_profit: totalProfit,
        total_lots: totalLots,
        trades: data,
      },
    });
  } catch (err: any) {
    return Response.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
