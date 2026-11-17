DELETE FROM core.user_profiles WHERE user_id = 'db5c8931-d63f-4cad-9987-620ae86ba3ad';

select * from core.user_profiles;

INSERT INTO organization_settings (
    id,
    organization_id,
    organization_id,
    setting_key,
    setting_value,
    created_at,
    updated_at
  )
VALUES (
    'id:uuid',
    'organization_id:uuid',
    'organization_id:uuid',
    'setting_key:character varying',
    'setting_value:jsonb',
    'created_at:timestamp with time zone',
    'updated_at:timestamp with time zone'
  );