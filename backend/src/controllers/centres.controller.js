const prisma = require("../config/prisma");

class CentresController {
  static async CreateCentre(req, res) {
    try {
      const { nom, region, province, commune, capacite_journaliere } = req.body;
      // degager les doublons du centres

      const exist = await prisma.centre.findFirst({
        where: {
          AND: [
            { nom: { equals: nom, mode: "insensitive" } },
            { region: { equals: region, mode: "insensitive" } },
          ],
        },
      });

      if (exist)
        return res.status(409).json({ error: "le centre existe deja" });

      // creer le centre

      await prisma.$transaction(async (tx) => {
        const centres = await tx.centre.create({
          data: {
            nom,
            region,
            province,
            commune,
            capacite_journaliere: parseInt(capacite_journaliere),
          },
        });
        return centres;
      });

      return res.status(201).json({ message: "centre creer avec succes" });
    } catch (err) {
      console.error("une erreur ", err);
      return res.status(500).json({ error: "une erreur est survenue" });
    }
  }

static async GetCentres(req, res) {
  try {
    const limit = 9;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    // const {id} = req.ADMIN;

    // // verifier si c'est vraiment un admin


    const [centres, total] = await Promise.all([
      prisma.centre.findMany({
        skip: skip,
        take: limit,
        select: { 
          id: true, 
          nom: true, 
          region: true, 
          commune:true,
          capacite_journaliere:true,
          province:true,
          statut:true
        },
        orderBy: { 
          nom: 'asc' 
        }
      }),
      prisma.centre.count()
    ]);
    
    const totalPages = Math.ceil(total / limit);


    
    return res.status(200).json({ 
      centres, 
      total,
      currentPage: page,
      totalPages,
      limit
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}

static async DeleteCentre(req,res){
    try{

        const{id_centre} = req.params;
        if(!id_centre) return res.status(400).json({error: 'parametres manquants'});

        const centre = await prisma.centre.findUnique({
            where:{
              id:  id_centre
            }
        });
        if(!centre) return res.status(404).json({error:'centre non trouver'});

        await prisma.centre.delete({
            where:{
                id:centre.id
            }
        });

        return res.status(200).json({message: 'centre supprimer avec success'});
    }
    catch(err){
      console.log('erreur est survenue',err);
      return res.status(500).json({error:'Une erreur est survenue lors de la suppression'})
    }
}

static async UpdateCentre(req,res){
  try{
    const{id_centre}= req.params;

    const {nom,region,commune,capacite_journaliere,province,statut} = req.body;

    // verifier les utilisateurs

    if(!id_centre){
        return res.status(400).json({error:'La reference du centre est requise'})
    }
    const centre = await prisma.centre.findUnique({
      where:{
        id:id_centre
      }
    });

    if(!centre)return res.status(404).json({error: 'Aucun centre trouver'});

    await prisma.$transaction(async(tx)=>{
      await tx.centre.update({
        where:{
          id:centre.id
        },
        data:{
          nom:nom ?? centre.nom,
          region: region ?? centre.region,
          commune: commune ?? centre.commune,
          capacite_journaliere: capacite_journaliere ?? centre.capacite_journaliere,
          statut : statut ?? centre.statut
        }
      })
    });

    return res.status(200).json({message:'Le centre a ete modifie avec succes'})
    
  }
  catch(error){
    console.log(error);

    return res.status(500).json({message:'Une erreur est survenue lors de la mise a jour'})

  }
}
static async SwitchStatus(req, res) {
  try {
    const { id_centre } = req.params;

    if (!id_centre) {
      return res.status(400).json({ error: "L'identifiant du centre est requis" });
    }

    const centre = await prisma.centre.findFirst({
      where: { id: id_centre }
    });

    if (!centre) {
      return res.status(404).json({ error: 'Aucun centre trouvé' });
    }

    // Basculement du statut
    const nouveauStatut = !centre.statut;

    // Mise à jour (la transaction n'est pas nécessaire pour une seule opération)
    await prisma.centre.update({
      where: { id: centre.id },
      data: { statut: nouveauStatut }
    });

    return res.status(200).json({
      message: 'Le statut du centre a été modifié',
      nouveauStatut
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut :', error);
    return res.status(500).json({
      error: 'Une erreur est survenue lors de la mise à jour'
    });
  }
}

static async DetailCentre(req,res){
  try {
    const {id_centre} = req.params;
    if(!id_centre){
      return res.status(400).json({error:'La reference du centre est requise '})
    }

    const centres = await prisma.centre.findFirst({
      where:{
        id:id_centre
      }
    });

    if(!id_centre){return res.status(404).json({error:'Aucun centre affilier a cette reference'})};

    return res.status(200).json({data:centres});
  } catch (error) {
    console.log('Une erreur est survenue ',error);

    return res.status(500).json({error:'Une erreur est survenue lors de la recuperation des donnees du centre'})
    
  }
}
};

module.exports =CentresController;