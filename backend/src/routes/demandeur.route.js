const express = require('express')

const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const demandeur = require('../controllers/demandeur.controller');
const admin = require('../controllers/admin.controller');
const upload = require("../middlewares/upload.middleware"); 
// const { demande } = require('../config/prisma');

router.post('/login',demandeur.Login);
router.post('/register-one',demandeur.RegisterStep1);
router.post('/register-two',demandeur.RegisterStep2);
router.post('/forgot-password',demandeur.forgotPassword)
router.post('/reset-password',demandeur.resetPassword)
router.post('/resend-otp',demandeur.ResendOtp)


// router.get('/crenaux',demandeur.creneaux)

router.use(auth.Demandeur)
router.post('/register-three',demandeur.VerifyOtp);
// il vont se connecter avec les donnners
router.post('/init-demand',demandeur.InitDemande);
router.post("/upload-docs",  upload.any(), demandeur.UploadsDoc);
router.post("/creneaux", demandeur.creneaux);
router.post("/rendezvous", demandeur.PrendreRendezVous);
router.get("/demandes",demandeur.GetDemande)
router.post('/demande',demandeur.detailDemande)
router.get('/profile',demandeur.Profil);
router.get("/recap/:demande_id", demandeur.Recap);
router.put('/update-profile',demandeur.UpdateProfile);
router.put('/update-password',demandeur.UpdatePassword);

router.get('/generate-recepisser/:demande_id/recipisse', demandeur.GetRecepisser);
router.delete('/annuler-demande/:demande_id/annuler',demandeur.AnnulerDemande)
module.exports = router

