-- Create sequence for display_number starting from 100
CREATE SEQUENCE IF NOT EXISTS applications_display_number_seq START WITH 100 INCREMENT BY 1;

-- Add display_number column (nullable first)
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "display_number" INTEGER;

-- Populate existing records with unique values starting from 100
DO $$
DECLARE
  app_record RECORD;
  counter INTEGER := 100;
BEGIN
  FOR app_record IN
    SELECT id FROM "applications" WHERE "display_number" IS NULL ORDER BY id
  LOOP
    UPDATE "applications" SET "display_number" = counter WHERE id = app_record.id;
    counter := counter + 1;
  END LOOP;

  -- Update sequence to continue from the last assigned value
  PERFORM setval('applications_display_number_seq', counter);
END $$;

-- Make column NOT NULL after populating
ALTER TABLE "applications" ALTER COLUMN "display_number" SET NOT NULL;

-- Set default value to use the sequence
ALTER TABLE "applications" ALTER COLUMN "display_number" SET DEFAULT nextval('applications_display_number_seq');

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS "applications_display_number_key" ON "applications"("display_number");
