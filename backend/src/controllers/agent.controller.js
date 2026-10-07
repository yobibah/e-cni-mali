const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const File = require("../services/file.service");
const doc = require("pdfkit");
const bcrypt = require("bcrypt");
class AgentController {
  static #demandeur = "DEMANDEUR";
  static #roles = "AGENT";

 static async Login(req, res) {
    try {
      const { email, password } = req.body;

      console.log('Body ',req.body);

      const agent = await prisma.utilisateur.findUnique({
        where: {
          email: email,

        },
        select: {
          id:true,
          mot_de_passe:true,
          nom: true, 
          prenom: true,
          roles: {
            select: {
              role: {
                select: {
                  libelle: true,
                },
              },
            },
          },
        },
      });

      if (!agent) {
        return res
          .status(404)
          .json({ error: "aucun utilisateur a cette adresse email" });
      }

      const isAdmin = agent.roles.some((r) => r.role.libelle === AgentController.#roles);

      if (!isAdmin) {
        return res.status(404).json({ error: "Email ou mots de passe incorrect " });
      }
      // console.log(agent)
      const verifyPass = await bcrypt.compare(password, agent.mot_de_passe);
      if (!verifyPass) {
        return res.status(401).json({ error: "Email ou mots de passe incorrect" });
      }

     const payloads = {
           id: agent.id,
           role: AgentController.#roles,
         };
   
         const token = jwt.sign({ payloads }, process.env.JWT_SECRET_DNEC_B, {
           expiresIn: "2h",
         });

      return res
        .status(200)
        .json({ token: token, nom:agent.nom,prenom:agent.prenom, message: "connexion reussi" });
    } catch (err) {
      console.log("Une erreur est survenue lors du login", err);
      return res.status(500).json({ error: "Une erreur est survenue" });
    }
  }
  static async VerifyDemandeur(req, res) {
    try {
      const { id } = req.body;
      if (!id) {
        return res
          .status(400)
          .json({ error: "le qr code presenter est incorrect" });
      }
      const hash = jwt.decode(id, process.env.JWT_SECRET_DNEC_B);

      if (hash === null || hash === undefined) {
        return res.status(400).json({ error: "Le qr est code est erroner" });
      }
      const demandeur = await prisma.utilisateur.findFirst({
        where: { id: hash.id_demandeur },
      });
      if (!demandeur) {
        return res
          .status(404)
          .json({ error: "Aucun demandeur associer cet qr code" });
      }

      const demande = await prisma.demande.findFirst({
        where: {
          utilisateur_id: demandeur.id,
          id: hash.id_demande,
        },
      });

      if (!demande) {
        return res
          .status(404)
          .json({ error: "Aucune demande liee a cet demandeur " });
      }

      // verifier s'il a payer les 2500 f ou pas

      const paiement = await prisma.paiement.findFirst({
        where: { demande_id: demande.id },
      });

      if (!paiement) {
        return res
          .status(409)
          .json({ error: "cette demande n'a pas ete regle" });
      }
      if (paiement.statut !== "REUSSI") {
        return res
          .status(409)
          .json({ error: "Paiement en attente de validation" });
      }
      if(demande.statut==='EN_COURS'){
        return res.status(409).json({error:'La demande est en cours de traitements'})
      }

      // recuper toutes les informations du demandeur
      const documents = await prisma.document.findMany({
        where: {
          demande_id: demande.id,
        },
      });

      if (documents.length === 0) {
        return res.status(404).json({ error: "aucun document troue" });
      }

      const docs = await Promise.all(
        documents.map(async (d) => ({
          url: await File.getSignedUrl(d.fichier),
          type: d.type_document,
        })),
      );

      return res.status(200).json({
        demandeur: demandeur,
        paiement: paiement,
        document: docs,
      });
      // return res.status(200).json(res);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  static async firstDemandeur(req, res) {
    try {
      const { id } = req.user;

      const agentCentre = 1;

      const rdv = await prisma.rendezVous.findMany();

      if (!rdv || rdv.length === 0) {
        return res.status(404).json({ error: "Aucun rendez-vous trouve" });
      }

      const creneauIds = rdv.map((r) => r.creneau_id);

      const creneaux = await prisma.creneau.findMany({
        where: {
          id: {
            in: creneauIds,
          },
        },
      });

      if (!creneaux || creneaux.length === 0) {
        return res.status(404).json({ error: "Aucun creneau disponible" });
      }
      const creneauF = creneaux.filter((c) => c.centre_id === agentCentre);
      if (creneauF.length === 0) {
        return res.status(404).json({
          error: "Aucun creneau pour ce centre",
        });
      }
      const rdvFiltres = rdv.filter((r) =>
        creneauF.some((c) => c.id === r.creneau_id),
      );

      return res.status(200).json({
        message: "OK",
        data: rdvFiltres,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error: "Erreur serveur",
      });
    }
  }

  static async CreateAgent(req, res) {
    try {
      const {
        nom,
        prenom,
        date_naissance,
        matricule,
        telephone,
        mot_de_passe,
        genre,
      } = req.body;

      if (!nom || !prenom || !date_naissance || !matricule) {
        return res.status(400).json({
          error: "Tous les champs sont requis",
        });
      }

      // Vérifier si l'utilisateur existe déjà
      const exist = await prisma.utilisateur.findFirst({
        where: {
          nom: {
            equals: nom,
            mode: "insensitive",
          },
          prenom: {
            equals: prenom,
            mode: "insensitive",
          },
          date_naissance: new Date(date_naissance),
        },
      });

      // Vérifier si l'utilisateur est déjà agent
      if (exist) {
        const agentExist = await prisma.agent.findFirst({
          where: {
            utilisateur_id: exist.id,
          },
        });

        if (agentExist) {
          return res.status(409).json({
            error: "Cet utilisateur existe déjà",
          });
        }
      }

      // Transaction
      const result = await prisma.$transaction(async (tx) => {
        // Création utilisateur
        const hash = await bcrypt.hash(mot_de_passe, 10);
        const utilisateur = await tx.utilisateur.create({
          data: {
            nom,
            prenom,
            date_naissance: new Date(date_naissance),
            statut: "ACTIF",
            mot_de_passe: hash,
            telephone,
            email: "",
            genre,
          },
        });

        // Création agent
        const agent = await tx.agent.create({
          data: {
            utilisateur_id: utilisateur.id,
            matricule,
          },
        });

        // Récupération rôle
        const role = await tx.role.upsert({
          where: {
            libelle: AgentController.#roles,
          },
          update: {},
          create: {
            libelle: AgentController.#roles,
          },
        });

        // Attribution rôle
        await tx.utilisateurRole.upsert({
          where: {
            utilisateur_id_role_id: {
              utilisateur_id: utilisateur.id,
              role_id: role.id,
            },
          },
          update: {},
          create: {
            utilisateur_id: utilisateur.id,
            role_id: role.id,
          },
        });

        return {
          utilisateur,
          agent,
        };
      });

      return res.status(201).json(result);
    } catch (err) {
      console.log("Erreur :", err);

      return res.status(500).json({
        error: "Une erreur est survenue",
      });
    }
  }

  static async ProfilAgent (req,res){
    try {
      const{id} = req.user;

      console.log('id',id);
      if(!id){
        return res.status(400).json({error:'La reference de l\'Agent est manquante'});
      }
      
      const agent  = await prisma.utilisateur.findFirst({
        where:{
          id:id
        },
        select:{
          email:true,
          telephone:true,
          nom:true,
          prenom:true,
          roles:{
            select:{
              role:true
            }
          }
        }
      });

      if(!agent){
        return res.status(404).json({error:'Aucun agent trouver'})
      };
      
      const isAgent = agent.roles.some((a)=>a.role.libelle ==='AGENT');

      if(!isAgent){
        return res.status(401).json({error:'Acces refuse'})
      }

      console.log(agent.roles.map((r)=>r.role.libelle))
      return res.status(200).json(agent)
      
    } catch (error) {
      console.log('Une erreur est suvenue ', error);
      return res.status(500).json({error:'Une erreur est survenue'})
      
    }
    
  }
  
  static async ValiderDemande(req,res){
    try {
      const {id_demande} = req.params;
      if(!id_demande){
        return res.status(400).json({
          error: "La reference de la demande est requise"
        });
      }
    const demande = await prisma.demande.findFirst({
      where:{
        id:id_demande
      }
    });

    if(!demande){
      return res.status(404).json({error:'Aucune demande trouve'});
    }

    await prisma.$transaction(async(tx)=>{
      await tx.demande.update({
        where:{
          id:demande.id
        },
        data:{
          statut:'EN_COURS'
        }
      })
    });

    return res.status(200).json({message:'Demande valider'})
    } catch (error) {
      console.log('Une erreur ',error);
        return res.status(500).json({error:'Une erreur est survenue'});
    }
  }
}
module.exports = AgentController;
