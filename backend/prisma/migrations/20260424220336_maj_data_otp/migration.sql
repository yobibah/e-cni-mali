/*
  Warnings:

  - A unique constraint covering the columns `[utilisateur_id]` on the table `otps` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "otps_utilisateur_id_key" ON "otps"("utilisateur_id");
