-- Restrict SELECT on games: only participants or open games (purple not assigned yet) can read.
DROP POLICY IF EXISTS "Anyone can read games" ON public.games;

CREATE POLICY "Participants can read games" ON public.games
  FOR SELECT TO anon, authenticated
  USING (
    auth.uid()::text = yellow_player
    OR auth.uid()::text = purple_player
    OR purple_player IS NULL
  );