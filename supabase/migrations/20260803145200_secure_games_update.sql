-- Restrict UPDATE on games so only participants (or a player joining as purple) can modify a game.
DROP POLICY IF EXISTS "Anyone can update games" ON public.games;

CREATE POLICY "Players can update games" ON public.games
  FOR UPDATE TO anon, authenticated
  USING (
    auth.uid() = yellow_player
    OR auth.uid() = purple_player
    OR (purple_player IS NULL AND yellow_player IS NOT NULL AND auth.uid() != yellow_player)
  )
  WITH CHECK (
    auth.uid() = yellow_player
    OR auth.uid() = purple_player
  );
