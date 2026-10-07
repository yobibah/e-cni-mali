-- AlterTable
ALTER TABLE "utilisateur" ALTER COLUMN "date_naissance" DROP NOT NULL,
ALTER COLUMN "lieux_naissance" DROP NOT NULL,
ALTER COLUMN "prenom_pere" DROP NOT NULL,
ALTER COLUMN "prenom_mere" DROP NOT NULL,
ALTER COLUMN "profession" DROP NOT NULL,
ALTER COLUMN "numero_acte" DROP NOT NULL,
ALTER COLUMN "commune_acte" DROP NOT NULL,
ALTER COLUMN "date_acte" DROP NOT NULL,
ALTER COLUMN "numero_certificat" DROP NOT NULL,
ALTER COLUMN "tribunal" DROP NOT NULL;

-- CreateTable
CREATE TABLE "centreAgent" (
    "id" TEXT NOT NULL,
    "centre_id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,

    CONSTRAINT "centreAgent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "utilisateur_id" TEXT NOT NULL,
    "matricule" TEXT NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "centreAgent_centre_id_agent_id_key" ON "centreAgent"("centre_id", "agent_id");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_utilisateur_id_key" ON "Agent"("utilisateur_id");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_matricule_key" ON "Agent"("matricule");

-- AddForeignKey
ALTER TABLE "centreAgent" ADD CONSTRAINT "centreAgent_centre_id_fkey" FOREIGN KEY ("centre_id") REFERENCES "centres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "centreAgent" ADD CONSTRAINT "centreAgent_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;
