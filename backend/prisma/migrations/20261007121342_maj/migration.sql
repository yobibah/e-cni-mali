/*
  Warnings:

  - You are about to drop the `Agent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Agent" DROP CONSTRAINT "Agent_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "centreAgent" DROP CONSTRAINT "centreAgent_agent_id_fkey";

-- DropTable
DROP TABLE "Agent";
