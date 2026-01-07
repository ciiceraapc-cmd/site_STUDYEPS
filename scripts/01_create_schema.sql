-- Create users profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create simulados (practice tests) table
CREATE TABLE IF NOT EXISTS simulados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  total_questions INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  difficulty_level TEXT CHECK (difficulty_level IN ('fácil', 'médio', 'difícil')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create simulado questions table
CREATE TABLE IF NOT EXISTS simulado_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulado_id UUID NOT NULL REFERENCES simulados(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('multiple_choice', 'true_false', 'essay')),
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user simulado responses table
CREATE TABLE IF NOT EXISTS simulado_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  simulado_id UUID NOT NULL REFERENCES simulados(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES simulado_questions(id) ON DELETE CASCADE,
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create simulado attempts (para rastrear tentativas completas)
CREATE TABLE IF NOT EXISTS simulado_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  simulado_id UUID NOT NULL REFERENCES simulados(id) ON DELETE CASCADE,
  score INTEGER,
  total_questions INTEGER,
  percentage_correct DECIMAL(5,2),
  time_spent_minutes INTEGER,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER NOT NULL DEFAULT 10,
  difficulty_level TEXT CHECK (difficulty_level IN ('fácil', 'médio', 'difícil')),
  challenge_type TEXT CHECK (challenge_type IN ('daily', 'weekly', 'milestone')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user challenges progress table
CREATE TABLE IF NOT EXISTS user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, challenge_id)
);

-- Create rewards store items table
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  cost_points INTEGER NOT NULL,
  category TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user rewards table (purchased/earned items)
CREATE TABLE IF NOT EXISTS user_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create study calendar table
CREATE TABLE IF NOT EXISTS study_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  topic TEXT NOT NULL,
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

-- Create AI chat history table
CREATE TABLE IF NOT EXISTS ai_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  topic TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user points/statistics table
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  total_simulados_completed INTEGER DEFAULT 0,
  total_challenges_completed INTEGER DEFAULT 0,
  study_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulado_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulado_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for simulado_responses
CREATE POLICY "Users can view their own responses" ON simulado_responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own responses" ON simulado_responses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for simulado_attempts
CREATE POLICY "Users can view their own attempts" ON simulado_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own attempts" ON simulado_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own attempts" ON simulado_attempts FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for user_challenges
CREATE POLICY "Users can view their own challenges" ON user_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert challenges for themselves" ON user_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own challenges" ON user_challenges FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for user_rewards
CREATE POLICY "Users can view their own rewards" ON user_rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert rewards for themselves" ON user_rewards FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for study_calendar
CREATE POLICY "Users can view their own calendar" ON study_calendar FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert calendar entries" ON study_calendar FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own calendar" ON study_calendar FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own calendar" ON study_calendar FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for ai_chat_history
CREATE POLICY "Users can view their own chat history" ON ai_chat_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert chat history" ON ai_chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_stats
CREATE POLICY "Users can view their own stats" ON user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own stats" ON user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own stats" ON user_stats FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_simulado_responses_user_id ON simulado_responses(user_id);
CREATE INDEX idx_simulado_responses_simulado_id ON simulado_responses(simulado_id);
CREATE INDEX idx_simulado_attempts_user_id ON simulado_attempts(user_id);
CREATE INDEX idx_simulado_attempts_simulado_id ON simulado_attempts(simulado_id);
CREATE INDEX idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX idx_user_challenges_challenge_id ON user_challenges(challenge_id);
CREATE INDEX idx_user_rewards_user_id ON user_rewards(user_id);
CREATE INDEX idx_study_calendar_user_id ON study_calendar(user_id);
CREATE INDEX idx_study_calendar_date ON study_calendar(date);
CREATE INDEX idx_ai_chat_history_user_id ON ai_chat_history(user_id);
CREATE INDEX idx_ai_chat_history_session_id ON ai_chat_history(session_id);
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
