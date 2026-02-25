-- =============================================================================
-- SEED: Una agencia de ejemplo para poder crear propiedades desde el admin
-- Ejecuta esto en el SQL Editor de Supabase después de las migraciones
-- =============================================================================

INSERT INTO agencies (id, name, slug, email, phone, is_active, plan)
VALUES (
  uuid_generate_v4(),
  'Mi Agencia',
  'mi-agencia',
  'contacto@miagencia.com',
  '+58 412 1234567',
  true,
  'starter'
)
ON CONFLICT (slug) DO NOTHING;
