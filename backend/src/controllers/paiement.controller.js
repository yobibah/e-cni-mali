const prisma = require("../config/prisma");
const crypto = require("crypto");
const Yenga = require("../api/Yenga");
const YengaService = require("../services/Yenga.service");
const redis = require("../config/redis");

class PaiementController {
  constructor() {}

  static #GenererReference() {
    const date = new Date();
    const annee = date.getFullYear();
    const mois = String(date.getMonth() + 1).padStart(2, "0");
    const jour = String(date.getDate()).padStart(2, "0");
    const random = crypto.randomBytes(4).toString("hex").toUpperCase();
    return `ONI-${annee}${mois}${jour}-${random}`;
  }

  static #validerTelephone(tel) {
    const regex = /^(226[0-9]{8}|[0-9]{8})$/;
    return regex.test(tel);
  }

  // paiement deja initier et en attente d
  static async #VerifierPaiement(reference) {
    try {
      if (!reference) {
        return res.status(400).json({ error: "La reference est requise" });
      }

      const paiement = await prisma.paiement.findFirst({
        where: { reference },
      });

      if (!paiement) {
        return res.status(404).json({ error: "aucun paiement trouver" });
      }
    } catch (error) {}
  }

  static async initPaiement(req, res) {
    try {
      const reference = PaiementController.#GenererReference();
      const { demande_id } = req.body;
      const { id, email } = req.user;
      const utilisateur_id = id;

      if (!demande_id) {
        return res
          .status(400)
          .json({ error: "reference de la demande indisponible" });
      }

      const demande = await prisma.demande.findFirst({
        where: { id: demande_id },
      });

      if (!demande) {
        return res.status(404).json({ error: "cette demande est introuvable" });
      }

      const ispay = await prisma.paiement.findFirst({
        where: { demande_id },
      });

      if (ispay && ispay.statut === "REUSSI") {
        return res
          .status(409)
          .json({ error: "vous avez deja payer pour cette demande." });
      }

      if (ispay && ispay.statut === "EN_ATTENTE") {
        // return res
        //   .status(409)
        //   .jsVerifierPaiementon({ error: "votre paiement est en cours de traitement" });

        // verifier si le paiement est valide ou pas
        // const Yservice = await verifypa

        const result = await new YengaService().verifierIntention(
          ispay.transId,
        );
        // console.log({result});
        // verifier si le paiement est un succes ou pas
        if (result.status !== "DONE") {
          return res.status(200).json({
            success: true,
            message: "Paiement initialisé",
            data: {
              url: result.data.checkoutPageUrlWithPaymentToken,
              reference: result.reference,
              status: result.status,
            },
          });
        } else {
        }
      }

      const montant = 100;
      let titre, description;

      if (demande.type_demande === "NOUVELLE") {
        titre = "Nouvelle CNIB";
        description =
          "Frais de demande de nouvelle carte nationale d'identité malien";
      } else if (demande.type_demande === "RENOUVELLEMENT") {
        titre = "Renouvellement CNIB";
        description =
          "Frais de renouvellement de la carte nationale d'identité malien";
      } else {
        titre = "Déclaration de perte CNIB";
        description =
          "Frais de déclaration de perte de la carte nationale d'identité malien";
      }

      const yenga = new Yenga({ reference, titre, description, email });

      const result = await yenga.Payment();

      //debuguer les erreurs de paiement ici

      // console.info('info sur les paiments', result.data.checkoutPageUrlWithPaymentToken)

      // Enregistrer le paiement en base en attente
      await prisma.paiement.create({
        data: {
          reference,
          demande_id,
          montant,
          statut: "EN_ATTENTE",
          transId: result.paymentId,
          // mode_paiement: ' '
        },
      });
      console.log(result);

      return res.status(200).json({
        success: true,
        message: "Paiement initialisé",
        data: {
          url: result.data.checkoutPageUrlWithPaymentToken,
          reference: result.reference,
          status: result.status,
        },
      });
    } catch (err) {
      console.error("[PaiementController.initPaiement]", err);
      return res
        .status(500)
        .json({ error: "Erreur serveur lors de l'initialisation du paiement" });
    }
  }

  static async initPaiementByAdmin(req, res) {
    try {
      const reference = PaiementController.#GenererReference();
      const { demande_id, demandeur_id } = req.body;

      const utilisateur_id = demandeur_id;
      const cacheKey = `paiement`;

      if (!demande_id) {
        return res
          .status(400)
          .json({ error: "reference de la demande indisponible" });
      }

      const demande = await prisma.demande.findFirst({
        where: { id: demande_id },
      });

      if (!demande) {
        return res.status(404).json({ error: "cette demande est introuvable" });
      }

      const ispay = await prisma.paiement.findFirst({
        where: { demande_id },
      });

      if (ispay && ispay.statut === "REUSSI") {
        return res
          .status(409)
          .json({ error: "vous avez deja payer pour cette demande." });
      }

      if (ispay && ispay.statut === "EN_ATTENTE") {
        // return res
        //   .status(409)
        //   .jsVerifierPaiementon({ error: "votre paiement est en cours de traitement" });

        // verifier si le paiement est valide ou pas
        // const Yservice = await verifypa

        const result = await new YengaService().verifierIntention(
          ispay.transId,
        );
        // console.log({result});
        // verifier si le paiement est un succes ou pas
        if (result.status !== "DONE") {
          return res.status(200).json({
            success: true,
            message: "Paiement initialisé",
            data: {
              url: result.data.checkoutPageUrlWithPaymentToken,
              reference: result.reference,
              status: result.status,
            },
          });
        } else {
        }
      }

      const montant = 100;
      let titre, description;

      if (demande.type_demande === "NOUVELLE") {
        titre = "Nouvelle CNIB";
        description =
          "Frais de demande de nouvelle carte nationale d'identité malien";
      } else if (demande.type_demande === "RENOUVELLEMENT") {
        titre = "Renouvellement CNIB";
        description =
          "Frais de renouvellement de la carte nationale d'identité malien";
      } else {
        titre = "Déclaration de perte CNIB";
        description =
          "Frais de déclaration de perte de la carte nationale d'identité malien";
      }

      const yenga = new Yenga({ reference, titre, description, email });

      const result = await yenga.Payment();

      //debuguer les erreurs de paiement ici

      // console.info('info sur les paiments', result.data.checkoutPageUrlWithPaymentToken)

      // Enregistrer le paiement en base en attente
      await prisma.paiement.create({
        data: {
          reference,
          demande_id,
          montant,
          statut: "EN_ATTENTE",
          transId: result.paymentId,
          // mode_paiement: ' '
        },
      });
      // console.log(result);
      redis.del(cacheKey);

      return res.status(200).json({
        success: true,
        message: "Paiement initialisé",
        data: {
          url: result.data.checkoutPageUrlWithPaymentToken,
          reference: result.reference,
          status: result.status,
        },
      });
    } catch (err) {
      console.error("[PaiementController.initPaiement]", err);
      return res
        .status(500)
        .json({ error: "Erreur serveur lors de l'initialisation du paiement" });
    }
  }

  static async webhookCallback(req, res) {
    try {
      // console.log("QUERY =>", req.query);
      // console.log("BODY =>", req.body);

      const payload = {
        ...req.query,
        ...req.body,
      };

      const result = await Yenga.Callback(payload);

      // console.log("RESULT =>", result);

//       0 demande(s) supprimée(s)
// RESULT => { success: true, message: 'Paiement confirmé' }

if(!result.success){
return ;
}
return {
  
}

      return res.status(200).json(result);
    } catch (err) {
      console.error(err);

      return res.status(500).json({
        error: true,
        message: err.message,
      });
    }
  }
}

module.exports = PaiementController;
