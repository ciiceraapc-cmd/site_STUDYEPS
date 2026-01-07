-- Insert sample simulados
INSERT INTO simulados (id, title, description, category, total_questions, duration_minutes, difficulty_level)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Português - Básico', 'Teste seus conhecimentos em língua portuguesa com questões básicas', 'Português', 10, 20, 'fácil'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Matemática - Intermediária', 'Questões de matemática com nível intermediário de dificuldade', 'Matemática', 15, 30, 'médio'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Ciências - Avançado', 'Desafio suas habilidades em ciências naturais e física', 'Ciências', 20, 45, 'difícil'),
  ('550e8400-e29b-41d4-a716-446655440004', 'História - Geral', 'Questões variadas sobre história do Brasil e mundial', 'História', 12, 25, 'médio'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Geografia - Básica', 'Aprenda sobre geografia física e política brasileira', 'Geografia', 10, 20, 'fácil');

-- Insert sample questions for first simulado
INSERT INTO simulado_questions (id, simulado_id, question_text, question_type, options, correct_answer, explanation)
VALUES
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 
   'Qual é a capital do Brasil?', 
   'multiple_choice',
   '["Brasília", "Rio de Janeiro", "São Paulo", "Salvador"]',
   'Brasília',
   'Brasília é a capital federal do Brasil, inaugurada em 1960.'),
  
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001',
   'O português é a língua oficial do Brasil?',
   'true_false',
   '["Verdadeiro", "Falso"]',
   'Verdadeiro',
   'Sim, o português é a língua oficial da República Federativa do Brasil.'),

  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001',
   'Qual obra foi escrita por Machado de Assis?',
   'multiple_choice',
   '["Dom Casmurro", "Grande Sertão: Veredas", "Capitães da Areia", "Memórias Póstumas de Brás Cubas"]',
   'Dom Casmurro',
   'Dom Casmurro é uma das obras mais famosas de Machado de Assis, publicada em 1899.');
