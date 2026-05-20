-- Bases Airtable (cache de la base paramètres)
CREATE TABLE IF NOT EXISTS airtable_bases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  airtable_base_id text UNIQUE NOT NULL,
  nom text NOT NULL,
  nom_concours text,
  statut text,
  actif boolean DEFAULT true,
  table_personnes text,
  table_document text,
  table_concours text,
  table_inscription text,
  table_manifestation text,
  table_societes text,
  table_passages text,
  webhooks jsonb DEFAULT '{}',
  liens jsonb DEFAULT '{}',
  synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Association utilisateurs ↔ bases
CREATE TABLE IF NOT EXISTS user_bases (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  base_id uuid REFERENCES airtable_bases(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, base_id)
);

-- RLS
ALTER TABLE airtable_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bases ENABLE ROW LEVEL SECURITY;

-- Un utilisateur voit uniquement les bases auxquelles il est associé
CREATE POLICY "users_see_own_bases" ON airtable_bases
  FOR SELECT USING (
    id IN (SELECT base_id FROM user_bases WHERE user_id = auth.uid())
  );

-- Un utilisateur voit uniquement ses propres associations
CREATE POLICY "users_see_own_associations" ON user_bases
  FOR SELECT USING (auth.uid() = user_id);
