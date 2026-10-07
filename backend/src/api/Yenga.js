const prisma = require("../config/prisma");
const crypto = require("crypto");
const OPERATORS_OTP = ["CORIS", "MOOV", "SANK"];

class Yenga {
  constructor({ reference, titre, description, email }) {
    this.montant = 100;
    this.reference = reference;
    this.titre = titre;
    this.description = description;
    this.price = 100;
    this.email = email;
    this.apiEnv = "test";

    if (!this.montant || isNaN(this.montant)) {
      throw new Error("montant invalide : doit être un nombre non nul");
    }
  }

  #baseUrl() {
    return `${process.env.YENGA_URL}/${process.env.ORGANIZATION_ID}/projects/${process.env.PROJET_ID}`;
  }

  #webHook() {
    return `${process.env.SECRET_WEBHOOKS}`;
  }

  #getHeaders() {
    return {
      "x-api-key": process.env.YENGA_API_KEY,
      "Content-Type": "application/json",
    };
  }

  #buildArticles() {
    return [
      { title: this.titre, description: this.description, price: this.price },
    ];
  }

  async initPayment() {
    const url = `${this.#baseUrl()}/direct-payment/init`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: this.#getHeaders(),
        body: JSON.stringify({
          paymentAmount: this.montant,
          reference: this.reference,
          articles: this.#buildArticles(),
          customerEmailToNotify: this.email,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data?.message || "Erreur lors de l'initialisation du paiement",
        );
      }
      return data;
    } catch (error) {
      console.error("[Yenga.initPayment]", error.message);
      throw error;
    }
  }

  async sendOtp({ tel, paymentIntentId, operatorCode }) {
    const url = `${this.#baseUrl()}/direct-payment/send-otp`;
    try {
      if (!OPERATORS_OTP.includes(operatorCode)) {
        throw new Error(
          `L'opérateur ${operatorCode} ne prend pas en charge l'OTP`,
        );
      }
      const response = await fetch(url, {
        method: "POST",
        headers: this.#getHeaders(),
        body: JSON.stringify({
          paymentIntentId,
          operatorCode,
          countryCode: "BF",
          customerMSISDN: tel,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'envoi de l'OTP");
      }
      return data;
    } catch (error) {
      console.error("[Yenga.sendOtp]", error.message);
      throw error;
    }
  }

  async initAndPay({ operatorCode, tel, otp }) {
    const url = `${this.#baseUrl()}/direct-payment/init-and-pay`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: this.#getHeaders(),
        body: JSON.stringify({
          paymentAmount: this.montant,
          articles: this.#buildArticles(),
          reference: this.reference,
          customerEmailToNotify: this.email,
          operatorCode,
          countryCode: "BF",
          customerMSISDN: tel,
          otp,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Erreur lors du paiement direct");
      }
      return data;
    } catch (error) {
      console.error("[Yenga.initAndPay]", error.message);
      throw error;
    }
  }

  async Payment() {
    const url = `${process.env.YENGA_URL}/${process.env.ORGANIZATION_ID}/payment-intent/${process.env.PROJET_ID}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: this.#getHeaders(),
        body: JSON.stringify({
          paymentAmount: this.montant, 
          articles: this.#buildArticles(),
          reference: this.reference,
          customerEmailToNotify: this.email,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        const validationMsg = data?.validationErrors
          ?.map((err) => Object.values(err).join(", "))
          .join(" | ");

        throw new Error(
          validationMsg ||
            data?.message ||
            data?.error ||
            "Erreur lors de l'initialisation du paiement",
        );
      }
      return {
        data: data,
        paymentId: data.id,
        url: data.checkoutPageUrlWithPaymentToken,
        reference: data.reference,
        status: data.transactionStatus,
      };
    } catch (error) {
      console.error("[Yenga.Payment]", error.message);
      throw error;
    }
  }

  static verifyYengaPaySignature(payload, signatureEnvoyee) {
    const secret = process.env.SECRET_WEBHOOKS;
    const signed = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(payload))
      .digest("hex");
    return signed === signatureEnvoyee;
  }

static async Callback(payload) {
  try {

    // console.log("YENGA PAYLOAD =>", payload);

    const yengapay_status =
      payload.yengapay_status ||
      payload.status ||
      payload.transaction_status;

    const yengapay_payment_id =
      payload.yengapay_payment_id ||
      payload.payment_id ||
      payload.transaction_id;

    if (!yengapay_payment_id) {
      return {
        error: true,
        message: "payment id introuvable"
      };
    }

    // retrouver le paiement
    const paiement = await prisma.paiement.findFirst({
      where: {
        transId: yengapay_payment_id
      }
    });

    if (!paiement) {
      return {
        error: true,
        message: "Aucun paiement trouvé"
      };
    }

    // éviter double traitement
    if (paiement.statut === "REUSSI") {
      return {
        success: true,
        message: "Paiement déjà traité"
      };
    }

    // succès
    if (
      yengapay_status === "successful" ||
      yengapay_status === "SUCCESS" ||
      yengapay_status === "success"
    ) {

      await prisma.paiement.update({
        where: {
          id: paiement.id
        },
        data: {
          statut: "REUSSI",
          update_at: new Date()
        }
      });

      await prisma.demande.update({
        where: {
          id: paiement.demande_id
        },
        data: {
          date_creation: new Date(),
          statut: "APPROUVEE"
        }
      });

      return {
        success: true,
        message: "Paiement confirmé"
      };
    }

    // echec
    await prisma.paiement.update({
      where: {
        id: paiement.id
      },
      data: {
        statut: "ECHOUE",
        update_at: new Date()
      }
    });

    return {
      error: true,
      message: "Paiement échoué"
    };

  } catch (err) {
    console.error("[Yenga.Callback]", err);
    throw err;
  }
}


}

module.exports = Yenga;