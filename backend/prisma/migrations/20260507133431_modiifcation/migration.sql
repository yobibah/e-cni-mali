/*
  Warnings:

  - You are about to drop the `Utilisateur` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TypeDemande" ADD VALUE 'CARTE_DETERIORER';
ALTER TYPE "TypeDemande" ADD VALUE 'CHANGEMENT_DONNEES';

-- DropForeignKey
ALTER TABLE "adresses" DROP CONSTRAINT "adresses_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "demandes" DROP CONSTRAINT "demandes_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "otps" DROP CONSTRAINT "otps_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "user_photos" DROP CONSTRAINT "user_photos_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "utilisateur_roles" DROP CONSTRAINT "utilisateur_roles_utilisateur_id_fkey";

-- DropTable
DROP TABLE "Utilisateur";

-- CreateTable
CREATE TABLE "utilisateurs" (
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

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personnes_a_prevenir" (
    "persone_id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "utilisateur_id" TEXT NOT NULL,

    CONSTRAINT "personnes_a_prevenir_pkey" PRIMARY KEY ("persone_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_nud_key" ON "utilisateurs"("nud");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_telephone_key" ON "utilisateurs"("telephone");

-- AddForeignKey
ALTER TABLE "personnes_a_prevenir" ADD CONSTRAINT "personnes_a_prevenir_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilisateur_roles" ADD CONSTRAINT "utilisateur_roles_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandes" ADD CONSTRAINT "demandes_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_photos" ADD CONSTRAINT "user_photos_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adresses" ADD CONSTRAINT "adresses_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otps" ADD CONSTRAINT "otps_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
