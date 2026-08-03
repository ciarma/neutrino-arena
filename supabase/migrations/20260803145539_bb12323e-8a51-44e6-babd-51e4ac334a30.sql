-- Restrict INSERT on games: the creator must set themselves as yellow_player.
DROP POLICY IF EXISTS "Anyone can create games" ON public.games;

CREATE POLICY "Creator can insert games" ON public.games
  FOR INSERT TO anon, authenticated
  WITH CHECK (auth.uid()::text = yellow_player);