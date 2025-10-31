-- Add unique constraints (idempotent)
DO $$
BEGIN
  -- Unique constraint for organizations.name
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'organizations_name_unique'
  ) THEN
    EXECUTE 'ALTER TABLE public.organizations
             ADD CONSTRAINT organizations_name_unique
             UNIQUE (name);';
  END IF;

  -- Composite unique constraint for locations
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'locations_org_address_city_zip_unique'
  ) THEN
    EXECUTE 'ALTER TABLE public.locations
             ADD CONSTRAINT locations_org_address_city_zip_unique
             UNIQUE (organization_id, address, city, zip_code);';
  END IF;
END $$ LANGUAGE plpgsql;
