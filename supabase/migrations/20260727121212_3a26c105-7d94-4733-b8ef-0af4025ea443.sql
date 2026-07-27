
CREATE TABLE public.games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  state JSONB NOT NULL,
  yellow_player TEXT,
  purple_player TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX games_code_idx ON public.games(code);

GRANT SELECT, INSERT, UPDATE ON public.games TO anon, authenticated;
GRANT ALL ON public.games TO service_role;

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read games" ON public.games FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can create games" ON public.games FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update games" ON public.games FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.games REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.games;
