-- Insert sample challenges
INSERT INTO challenges (id, title, description, points, difficulty_level, challenge_type)
VALUES
  ('750e8400-e29b-41d4-a716-446655440001', 'Primeira Prova', 'Complete seu primeiro simulado', 100, 'fácil', 'milestone'),
  ('750e8400-e29b-41d4-a716-446655440002', 'Estudador Dedicado', 'Complete 5 simulados no mesmo dia', 250, 'médio', 'daily'),
  ('750e8400-e29b-41d4-a716-446655440003', 'Sequência de 7 Dias', 'Estude 7 dias consecutivos', 500, 'difícil', 'weekly'),
  ('750e8400-e29b-41d4-a716-446655440004', 'Tutor IA Master', 'Faça 50 perguntas ao tutor IA', 150, 'médio', 'daily'),
  ('750e8400-e29b-41d4-a716-446655440005', 'Perfectionist', 'Acerte 100% em um simulado completo', 300, 'difícil', 'milestone'),
  ('750e8400-e29b-41d4-a716-446655440006', 'Conhecedor de Português', 'Complete todos os simulados de Português', 200, 'médio', 'milestone'),
  ('750e8400-e29b-41d4-a716-446655440007', 'Maratonista', 'Estude por mais de 100 horas totais', 400, 'difícil', 'milestone');

-- Insert rewards for store
INSERT INTO rewards (id, name, description, cost_points, category, image_url)
VALUES
  ('850e8400-e29b-41d4-a716-446655440001', 'Certificado Digital', 'Certificado de conclusão de estudos', 500, 'digital', '/rewards/certificate.png'),
  ('850e8400-e29b-41d4-a716-446655440002', 'Aumento de Sessão', '+30 minutos extras de estudo com tutor IA', 200, 'service', '/rewards/session.png'),
  ('850e8400-e29b-41d4-a716-446655440003', 'Material Premium', 'Acesso a material de estudo premium', 750, 'content', '/rewards/premium.png'),
  ('850e8400-e29b-41d4-a716-446655440004', 'Dica Especial', 'Dica personalizada de estudo', 150, 'hint', '/rewards/hint.png'),
  ('850e8400-e29b-41d4-a716-446655440005', 'Simulado Exclusivo', 'Acesso a simulado exclusivo avançado', 600, 'content', '/rewards/simulado.png');
