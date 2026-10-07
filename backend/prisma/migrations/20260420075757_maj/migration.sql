/*
  Warnings:

  - The `statut` column on the `utilisateurs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[telephone]` on the table `utilisateurs` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nud` to the `demandes` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type_demande` on the `demandes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `Lieux_naissance` to the `utilisateurs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date_naissance` to the `utilisateurs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prenom_mere` to the `utilisateurs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prenom_pere` to the `utilisateurs` table without a default value. This is not possible if the table is not empty.
  - Made the column `telephone` on table `utilisateurs` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "StatutCompte" AS ENUM ('ACTIF', 'INACTIF', 'SUSPENDU');

-- CreateEnum
CREATE TYPE "TypeDemande" AS ENUM ('NOUVELLE', 'RENOUVELLEMENT', 'PERTE');

-- AlterTable
ALTER TABLE "demandes" ADD COLUMN     "nud" TEXT NOT NULL,
DROP COLUMN "type_demande",
ADD COLUMN     "type_demande" "TypeDemande" NOT NULL;

-- AlterTable
ALTER TABLE "utilisateurs" ADD COLUMN     "Lieux_naissance" TEXT NOT NULL,
ADD COLUMN     "date_naissance" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "prenom_mere" TEXT NOT NULL,
ADD COLUMN     "prenom_pere" TEXT NOT NULL,
ALTER COLUMN "telephone" SET NOT NULL,
DROP COLUMN "statut",
ADD COLUMN     "statut" "StatutCompte" NOT NULL DEFAULT 'INACTIF';

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_telephone_key" ON "utilisateurs"("telephone");
