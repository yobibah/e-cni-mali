const prisma = require("../config/prisma");
const ikkodi = require("../api/Ikoddi");
class cronDemande {
  constructor() {
    this.ikodi = new ikkodi();
  }

  async delDemandeNotFinish() {
    const dateLimite = new Date();
    dateLimite.setHours(dateLimite.getHours() - 6);

    try {
      const resultat = await prisma.demande.deleteMany({
        where: {
          date_creation: {
            lte: dateLimite,
          },
          statut: {
            not: "TERMINEE",
          },
          OR: [
            { paiement: null },
            {
              documents: {
                none: {},
              },
            },
            { rendezvous: null },
          ],
        },
      });

      console.log(`${resultat.count} demande(s) supprimée(s)`);
      return resultat;
    } catch (error) {
      console.error(" Erreur lors de la suppression :", error);
      throw error;
    }
  }

  async SendSmsToUser() {
    const dateLimite = new Date();
    dateLimite.setHours(dateLimite.getHours() - 2);
    try {
      const resultat = await prisma.demande.findMany({
        where: {
          date_creation: {
            lte: dateLimite,
          },
          statut: {
            not: "TERMINEE",
          },
          OR: [
            { paiement: null },
            {
              documents: {
                none: {},
              },
            },
            { rendezvous: null },
          ],
        },
        select: {
          utilisateur: {
            select: {
              telephone: true,
            },
          },
        },
      });
      const message =
        "Votre demande sera supprimée dans 4h si vous ne passez pas au paiement ou si vous ne fournissez pas vos documents ou si vous ne prenez pas de rendez-vous.";
      resultat.map((r) => {
        this.ikodi.sendsmsPerso(r.utilisateur.telephone, message);
      });
      console.log(`${resultat.count} message(s) envoyé(s)`);
      return resultat;
    } catch (error) {
      console.error(" Erreur lors de la suppression :", error);
      throw error;
    }
  }
}

module.exports = cronDemande;
