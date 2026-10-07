-- AlterTable
ALTER TABLE "centres" ADD COLUMN     "delelet_at" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "demandes" ADD COLUMN     "delelet_at" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "paiements" ADD COLUMN     "delelet_at" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "utilisateur" ADD COLUMN     "delelet_at" BOOLEAN NOT NULL DEFAULT false;
