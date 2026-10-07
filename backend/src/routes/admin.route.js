const express = require("express");

const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const admin = require('../controllers/admin.controller')

router.post('/oni/admin/login',admin.Login);

router.use(auth.Admin);
router.get('/dash',admin.dash);
router.get('/evolution-demande',admin.EvolutionDemande)
router.get('/evolution-centre',admin.EvolutionCentre)
router.get('/evolution-paiement',admin.PayementEvolution)


router.put('/demandeur/update-profile/:id_demandeur',admin.UpdateProfile);
router.put('/demandeur/update-adresse/:id_demandeur',admin.UpdateAdresse);
router.patch('/demandeur/update-user-password/:id_demandeur',admin.UpdateMdp)

router.get('/liste-paiement',admin.ListePaiement);
router.get('/paiement/detail/:paiement_id',admin.DetailPaiement)

router.get('/exporter-utilisateur',admin.ExporterListeUtilisateur)
router.get('/exporter-demande',admin.ExporterListeDemande)
router.get('/exporter-paiement',admin.ExporterListePaiement)


router.get('/liste-demandeur',admin.demandeur)
router.get('/liste-demandeur/:id_demandeur',admin.DetailDemandeur);
router.post('/demandeur/personne-a-prevenir',admin.AddPersoPrevenir);
router.post('/demandeur/stwitch-status',admin.AutoSwitch)
router.get('/demandeur/demande-by-user/:demandeur_id',admin.DemandeurDemande)
router.get('/demandeur/lists',admin.DemandeurListe);
router.delete("/demandeur/delete-demandeur/:demandeur_id",admin.deleteDemandeur)
router.put("/demandeur/recover-demandeur/:demandeur_id",admin.RecoverDemandeur)
router.get('/demandeur/demande/:id_demande',admin.GetDemande)
router.put('/demande/update-demande/:id_demande',admin.UpdateDemande);

router.delete('/demandeur/delete-demande/:id_demande',admin.DeleteDemande);
router.put('/demandeur/recover-demande/:id_demande',admin.RecoverDemande);

router.post('/demandeur/create-user',admin.CreateUtilisateur);
router.get('/roles',admin.GetRole);


// il vont se connecter avec les donnners

module.exports = router;
