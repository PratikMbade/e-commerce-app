-- Migration script to add user roles to existing database
-- Add UserRole enum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- Add role column to users table with default value
ALTER TABLE "users" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';

-- Update existing admin user (if exists)
UPDATE "users" SET "role" = 'ADMIN' WHERE "email" = 'admin@example.com';
