class YengaService {
  #getHeaders() {
    return {
      "x-api-key": process.env.YENGA_API_KEY,
    //   "Content-Type": "application/json",
    };
  }

  // Vérifier le statut d'un paiement par son ID ou référence
async verifierPayment(transID) {
  try {

    const url = `${process.env.YENGA_URL}/${process.env.ORGANIZATION_ID}/merchant-payment/project/${process.env.PROJET_ID}/payment/${transID}`;

    console.log("URL =>", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": process.env.YENGA_API_KEY,
        "Accept": "application/json"
      }
    });

    console.log("STATUS =>", response.status);

    const text = await response.text();

    console.log("RESPONSE =>", text);

    // Réponse vide
    if (!text || text.trim() === "") {
      return {
        success: false,
        status: "EMPTY_RESPONSE",
        message: "L'API a retourné une réponse vide"
      };
    }

    // HTML
    if (text.startsWith("<!DOCTYPE")) {
      return {
        success: false,
        status: "INVALID_RESPONSE",
        message: "L'API retourne du HTML",
        html: text
      };
    }

    // JSON
    const data = JSON.parse(text);

    return {
      success: true,
      status: data.status || "UNKNOWN",
      data
    };

  } catch (error) {

    return {
      success: false,
      status: "NETWORK_ERROR",
      message: error.message,
      isNetworkError: true
    };
  }
}

  async verifierIntention(paymentIntentId) {
    try {
      const url = `${process.env.YENGA_URL}/${process.env.ORGANIZATION_ID}/payment-intent/project/${process.env.PROJET_ID}/intent/${paymentIntentId}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: this.#getHeaders(),
      });

      if (!response.ok) {
        return {
          success: false,
          status: "ERROR",
          message: `Erreur HTTP ${response.status}`
        };
      }

      const data = await response.json();
      return {
        success: true,
        status: data.transactionStatus, // "PENDING", "DONE"
        data: data
      };
      
    } catch (error) {
      return {
        success: false,
        status: "NETWORK_ERROR",
        message: error.message
      };
    }
  }

  async verifierPaiementApresTimeout(reference, paymentIntentId = null) {
    console.log(`Vérification manuelle du paiement ${reference}...`);
    
    // Essayer d'abord avec la référence
    let result = await this.verifierPayment(reference);
    
    if (result.success && result.status === "DONE") {
      return {
        estValide: true,
        statut: "PAYÉ",
        details: result.data
      };
    }
    

    if (paymentIntentId) {
      const intentResult = await this.verifierIntention(paymentIntentId);
      if (intentResult.success && intentResult.status === "DONE") {
        return {
          estValide: true,
          statut: "PAYÉ",
          details: intentResult.data
        };
      }
    }
    
    return {
      estValide: false,
      statut: result.status || "NON_TROUVÉ",
      message: "Le paiement n'a pas été confirmé"
    };
  }
}

module.exports = YengaService;