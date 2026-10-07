const PaiementController = require("../controllers/paiement.controller");
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");

router.get("/webhook", PaiementController.webhookCallback);

router.use(auth.Demandeur);

router.post("/paiement", PaiementController.initPaiement);

module.exports = router;
