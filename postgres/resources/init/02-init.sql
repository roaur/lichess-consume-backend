-- Create 'match' table
CREATE TABLE IF NOT EXISTS match (
  lichess_match_id text PRIMARY KEY,
  channel text,
  orientation text,
  fen text,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create 'players' table
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  match_id text REFERENCES match(lichess_match_id) ON DELETE CASCADE,
  color text),
  username text,
  title text,
  rating INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create 'moves' table
CREATE TABLE IF NOT EXISTS moves (
  id SERIAL PRIMARY KEY,
  match_id text REFERENCES match(lichess_match_id) ON DELETE CASCADE,
  move_number INTEGER,
  fen text,
  created_at TIMESTAMP DEFAULT NOW()
);
