import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
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

    if (
      !account_id ||
      !ticket ||
      !symbol ||
      !type ||
      lot == null ||
      profit == null ||
      !event
    ) {
      return new Response(
        JSON.stringify({ error: 'Missing fields' }),
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('trades')
      .insert([{
        account_id,
        ticket,
        symbol,
        type,
        lot,
        profit,
        event
      }]);

    if (error) {
      console.error(error);
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ status: 'ok' }),
      { status: 200 }
    );

  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500 }
    );
  }
}
