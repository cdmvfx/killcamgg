-- CreateEnum
CREATE TYPE "GameModes" AS ENUM ('WARZONE', 'MULTIPLAYER', 'RANKED_MULTIPLAYER', 'RESURGENCE', 'DMZ');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BuildTag" ADD VALUE 'SNIPER_SUPPORT';
ALTER TYPE "BuildTag" ADD VALUE 'FAST_ADS';
ALTER TYPE "BuildTag" ADD VALUE 'FAST_MOVEMENT';
ALTER TYPE "BuildTag" ADD VALUE 'FAST_TTK';
ALTER TYPE "BuildTag" ADD VALUE 'FAST_RELOAD';
ALTER TYPE "BuildTag" ADD VALUE 'FAST_SWITCH';
ALTER TYPE "BuildTag" ADD VALUE 'FAST_FIRERATE';
ALTER TYPE "BuildTag" ADD VALUE 'LOW_RECOIL';
ALTER TYPE "BuildTag" ADD VALUE 'SMALL_ZOOM';
ALTER TYPE "BuildTag" ADD VALUE 'MEDIUM_ZOOM';
ALTER TYPE "BuildTag" ADD VALUE 'HIGH_ZOOM';

-- AlterTable
ALTER TABLE "Build" ADD COLUMN     "gamemodes" "GameModes"[],
ADD COLUMN     "tags" "BuildTag"[];
