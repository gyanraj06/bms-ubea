-- Add phone2, phone3, phone4 columns to property_settings table
ALTER TABLE property_settings ADD COLUMN IF NOT EXISTS phone2 VARCHAR(50);
ALTER TABLE property_settings ADD COLUMN IF NOT EXISTS phone3 VARCHAR(50);
ALTER TABLE property_settings ADD COLUMN IF NOT EXISTS phone4 VARCHAR(50);
