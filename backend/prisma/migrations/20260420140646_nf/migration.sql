/*
  Warnings:

  - You are about to drop the column `nud` on the `demandes` table. All the data in the column will be lost.
  - The `statut` column on the `demandes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `statut` column on the `paiements` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `statut_utilisation` column on the `recepisse` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `utilisateurs` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `reference` on table `paiements` required. This step will fail if there are existing NULL values in that column.
  - Made the column `date_paiement` on table `paiements` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Genre" AS ENUM ('HOMME', 'FEMME');

-- CreateEnum
CREATE TYPE "StatutDemande" AS ENUM ('EN_ATTENTE', 'EN_COURS', 'APPROUVEE', 'REJETEE', 'TERMINEE');

-- CreateEnum
CREATE TYPE "StatutPaiement" AS ENUM ('REUSSI', 'EN_ATTENTE', 'ECHOUE');

-- CreateEnum
CREATE TYPE "StatutRecipisser" AS ENUM ('VALIDE', 'INVALIDE');

-- DropForeignKey
ALTER TABLE "demandes" DROP CONSTRAINT "demandes_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "utilisateur_roles" DROP CONSTRAINT "utilisateur_roles_utilisateur_id_fkey";

-- AlterTable
ALTER TABLE "demandes" DROP COLUMN "nud",
DROP COLUMN "statut",
ADD COLUMN     "statut" "StatutDemande" NOT NULL DEFAULT 'EN_ATTENTE';

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "numero_acte" TEXT,
ADD COLUMN     "numero_nationalite" TEXT;

-- AlterTable
ALTER TABLE "paiements" DROP COLUMN "statut",
ADD COLUMN     "statut" "StatutPaiement" NOT NULL DEFAULT 'EN_ATTENTE',
ALTER COLUMN "reference" SET NOT NULL,
ALTER COLUMN "date_paiement" SET NOT NULL,
ALTER COLUMN "date_paiement" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "recepisse" DROP COLUMN "statut_utilisation",
ADD COLUMN     "statut_utilisation" "StatutRecipisser" NOT NULL DEFAULT 'VALIDE';

-- DropTable
DROP TABLE "utilisateurs";

-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" TEXT NOT NULL,
    "nud" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "mot_de_passe" TEXT NOT NULL,
    "date_naissance" TIMESTAMP(3) NOT NULL,
    "lieux_naissance" TEXT NOT NULL,
    "prenom_pere" TEXT NOT NULL,
    "prenom_mere" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "genre" "Genre" NOT NULL,
    "statut" "StatutCompte" NOT NULL DEFAULT 'INACTIF',
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "numero_acte" TEXT NOT NULL,
    "commune_acte" TEXT NOT NULL,
    "date_acte" TIMESTAMP(3) NOT NULL,
    "numero_certificat" TEXT NOT NULL,
    "tribunal" TEXT NOT NULL,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_photos" (
    "id" TEXT NOT NULL,
    "utilisateur_id" TEXT NOT NULL,
    "photo" TEXT NOT NULL,

    CONSTRAINT "user_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adresses" (
    "id" TEXT NOT NULL,
    "adres_residence" TEXT NOT NULL,
    "ville_province" TEXT NOT NULL,
    "utilisateur_id" TEXT NOT NULL,

    CONSTRAINT "adresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otps" (
    "id" TEXT NOT NULL,
    "utilisateur_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expire_at" TIMESTAMP(3) NOT NULL,
    "utilise" BOOLEAN NOT NULL DEFAULT false,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_nud_key" ON "Utilisateur"("nud");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_telephone_key" ON "Utilisateur"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_numero_acte_commune_acte_date_acte_key" ON "Utilisateur"("numero_acte", "commune_acte", "date_acte");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_numero_certificat_tribunal_key" ON "Utilisateur"("numero_certificat", "tribunal");

-- CreateIndex
CREATE UNIQUE INDEX "adresses_utilisateur_id_key" ON "adresses"("utilisateur_id");

-- AddForeignKey
ALTER TABLE "utilisateur_roles" ADD CONSTRAINT "utilisateur_roles_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandes" ADD CONSTRAINT "demandes_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_photos" ADD CONSTRAINT "user_photos_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adresses" ADD CONSTRAINT "adresses_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otps" ADD CONSTRAINT "otps_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;
