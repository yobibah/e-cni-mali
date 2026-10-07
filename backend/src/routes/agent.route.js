const express = require ('express');

const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const  agent  = require('../controllers/agent.controller');


router.post('/create-agent',agent.CreateAgent);
router.post('/scanner-qr',agent.VerifyDemandeur)

router.post('/login',agent.Login);

router.use(auth.Agent)
// il vont se connecter avec les donnners
router.get('/profil',agent.ProfilAgent);
router.put('/valider-demande/:id_demande',agent.ValiderDemande);

module.exports =router;
