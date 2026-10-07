/*
  Warnings:

  - You are about to drop the `utilisateurs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "adresses" DROP CONSTRAINT "adresses_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "demandes" DROP CONSTRAINT "demandes_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "otps" DROP CONSTRAINT "otps_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "personnes_a_prevenir" DROP CONSTRAINT "personnes_a_prevenir_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "user_photos" DROP CONSTRAINT "user_photos_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "utilisateur_roles" DROP CONSTRAINT "utilisateur_roles_utilisateur_id_fkey";

-- DropTable
DROP TABLE "utilisateurs";

-- CreateTable
CREATE TABLE "utilisateur" (
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

    CONSTRAINT "utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_nud_key" ON "utilisateur"("nud");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_email_key" ON "utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_telephone_key" ON "utilisateur"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_numero_acte_commune_acte_date_acte_key" ON "utilisateur"("numero_acte", "commune_acte", "date_acte");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_numero_certificat_tribunal_key" ON "utilisateur"("numero_certificat", "tribunal");

-- AddForeignKey
ALTER TABLE "personnes_a_prevenir" ADD CONSTRAINT "personnes_a_prevenir_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilisateur_roles" ADD CONSTRAINT "utilisateur_roles_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandes" ADD CONSTRAINT "demandes_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_photos" ADD CONSTRAINT "user_photos_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adresses" ADD CONSTRAINT "adresses_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otps" ADD CONSTRAINT "otps_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;
