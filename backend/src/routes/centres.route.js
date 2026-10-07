
const express = require('express')
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const centres = require('../controllers/centres.controller');



// router.use(auth.Agent)
// il vont se connecter avec les donnners

//routes public pour voir deja les centres disponibles sans se connecter
router.get('/',centres.GetCentres);

// router.use(auth.Admin);

router.post('/create-centre',centres.CreateCentre);
router.put('/update-centre/:id_centre',centres.UpdateCentre);
router.delete('/delete-centre/:id_centre', centres.DeleteCentre);
router.put('/update-status-centre/:id_centre',centres.SwitchStatus);
router.get('/detail-centre/:id_centre', centres.DetailCentre);
module.exports = router