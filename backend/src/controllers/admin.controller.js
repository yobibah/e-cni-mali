const prisma = require("../config/prisma");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Majsortie = require("../utils/majSortie");
const connection = require("../config/redis");
const DemandeurRessource = require("../resources/demandeur");
const validatePhone = require("../utils/verifyNumber");
const { sendToUser } = require("../sockets/socket.service");
const ExportData = require("../services/export.service");
const minio = require("../services/file.service");
const redis = connection;
class AdminController {
  static #role = "ADMIN";
  static #TTL = 50 * 60;
  static async Login(req, res) {
    try {
      const { email, mot_de_passe } = req.body;

      // console.log('Body ',req.body);

      const admin = await prisma.utilisateur.findUnique({
        where: {
          email: email,
        },
        select: {
          id: true,
          mot_de_passe: true,
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

      if (!admin) {
        return res
          .status(404)
          .json({ error: "aucun utilisateur a cette adresse email" });
      }

      const isAdmin = admin.roles.some((r) => r.role.libelle === "ADMIN");

      if (!isAdmin) {
        return res.status(404).json({ error: "Acces refuser" });
      }

      const verifyPass = await bcrypt.compare(mot_de_passe, admin.mot_de_passe);
      if (!verifyPass) {
        return res.status(401).json({ error: "mots de passe incorectxx" });
      }

      const payloads = {
        id: admin.id,
        role: "ADMIN",
      };

      const token = jwt.sign({ payloads }, process.env.JWT_SECRET_DNEC_B, {
        expiresIn: "2h",
      });

      return res
        .status(200)
        .json({ token: token, message: "connexion reussi" });
    } catch (err) {
      console.log("Une erreur est survenue lors du login", err);
      return res.status(500).json({ error: "Une erreur est survenue" });
    }
  }

  static async dash(req, res) {
    try {
      const [user, role, demande, paiement, centre] = await Promise.all([
        prisma.utilisateur.findMany(),
        prisma.role.findMany(),
        prisma.demande.findMany({
          include: {
            utilisateur: true,
            rendezvous: {
              include: {
                creneau: {
                  include: { centre: true },
                },
              },
            },
          },
        }),
        prisma.paiement.findMany(),
        prisma.centre.findMany(),
      ]);

      const ajourdhui = new Date().toLocaleDateString("FR-fr");
      const nbDemandeAuj = demande.filter(
        (n) =>
          new Date(n.date_creation).toLocaleDateString("FR-fr") === ajourdhui,
      ).length;
      const nbInscAuj = user.filter(
        (u) =>
          new Date(u.date_creation).toLocaleDateString("FR-fr") === ajourdhui,
      ).length;

      const hier = new Date();
      hier.setDate(hier.getDate() - 1);

      const nbInscHier = user.filter((u) => {
        const dateUser = new Date(u.date_creation);

        return (
          dateUser.toLocaleDateString("fr-FR") ===
          hier.toLocaleDateString("fr-FR")
        );
      }).length;

      const paij = paiement.filter(
        (p) =>
          new Date(p.date_paiement).toLocaleDateString("FR-fr") === ajourdhui &&
          p.statut == "REUSSI",
      ).length;
      const montant = paiement
        .filter(
          (p) =>
            new Date(p.date_paiement).toLocaleDateString("FR-fr") ===
              ajourdhui && p.statut == "REUSSI",
        )
        .reduce((total, r) => total + Number(r.montant), 0);

      const typeMapping = {
        NOUVELLE: "Première demande",
        RENOUVELLEMENT: "Renouvellement",
        PERTE: "Perte",
        CARTE_DETERIORER: "Carte détériorée",
        CHANGEMENT_DONNEES: "Changement de données",
      };

      const statusMapping = {
        EN_ATTENTE: "En attente",
        EN_COURS: "En cours",
        APPROUVEE: "Approuvée",
        REJETEE: "Rejetée",
        TERMINEE: "Terminée",
      };

      const demandesList = demande.map((d) => {
        const centreNom =
          d.rendezvous?.creneau?.centre?.nom || "Centre non attribué";

        return {
          reference: d.id.slice(0, 8).toUpperCase(),
          demandeur: Majsortie(`${d.utilisateur.nom} ${d.utilisateur.prenom}`),
          type: typeMapping[d.type_demande] || d.type_demande,
          centre: centreNom,
          status: statusMapping[d.statut] || d.statut,
        };
      });

      // Affichage pour vérifier
      // console.log(demandesList);
      // console.log(nbInscAuj);
      const percent =
        nbInscHier === 0 ? 0 : ((nbInscAuj - nbInscHier) / nbInscHier) * 100;

      // console.log("pourcentage", percent);
      // console.log( Majsortie(demandesList) )
      const lisCentres = ["ouagadougou", "bobo-dioulasso", "koudougou"];

      const couleurs = {
        ouagadougou: "#0F6E56",
        "bobo-dioulasso": "#5DCAA5",
        koudougou: "#9FE1CB",
      };

      const centres = centre
        .filter((item) => lisCentres.includes(item.nom.toLowerCase()))
        .map((item) => ({
          name: item.nom,
          value: item.total,
          color: couleurs[item.nom.toLowerCase()],
        }));

      const autres = centre
        .filter((item) => !lisCentres.includes(item.nom.toLowerCase()))
        .reduce((sum, item) => sum + item.total, 0);

      centres.push({
        name: "Autres",
        value: autres,
        color: "#E1F5EE",
      });
      const data = {
        nbDemande: nbDemandeAuj,
        nbInscrit: nbInscAuj,
        percentAuj: percent,
        pay: paij,
        montant,
        user: demandesList,
        // role,
        // demande,
        // paiement,
        centres,
      };
      return res.json(data);
    } catch (err) {
      console.log("erreur serveur", err);
      return res.status(400).json({ error: "une erreur est survenue" });
    }
  }

  // static async addRolesTo(req,res){
  //   try {
  //     const {user_id,}
  //   } catch (error) {

  //   }

  // }

  static async demandeur(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;
      const roles = "DEMANDEUR";

      let response = {};
      const cacheKey = `demandeur:${limit}:page:${page}`;
      // const data = await connection.get(cacheKey);
      // if (data) {
      //   const d = JSON.parse(data) ;
      //   response = (d.map((r)=>  DemandeurRessource(r)))
      //   return res.status(200).json(d);
      // }

      // console.log(response);

      const [utilisateur, total] = await Promise.all([
        prisma.utilisateur.findMany({
          skip,
          take: limit,
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        }),

        prisma.utilisateur.count({}),
      ]);

      // console.log(utilisateur)

      const demandeur = utilisateur
        // .filter((d) => d.roles.some((r) => r.role.libelle === roles))
        .sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation));
      // console.log(demandeur)
      response = demandeur.map((r) => DemandeurRessource(r));
      // console.log(response);

      await connection.set(
        cacheKey,
        JSON.stringify(demandeur),
        "EX",
        AdminController.#TTL,
      );
      // const total = demandeur.length;

      return res.json({
        data: Majsortie(response),
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      });
    } catch (err) {
      console.log("erreur", err);
      return res.status(500).json({ error: "Une erreur est suvenue " });
    }
  }

  static async DetailDemandeur(req, res) {
    try {
      const { id_demandeur } = req.params;

      if (!id_demandeur) {
        return res
          .status(400)
          .json({ error: "La reference du demandeur est manquante " });
      }
      const demandeur = await prisma.utilisateur.findFirst({
        where: {
          id: id_demandeur.toLowerCase(),
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
          demandes: true,
          personnesPrevenir: true,
        },
      });
      // console.log(demandeur);

      if (!demandeur) {
        return res.status(404).json({ error: "Pas de demandeur Trouver" });
      }

      // let paiement = [];

      // // for

      // // const rep = demandeur.map((d)=>{
      // //   const partie = d.email.split('@');
      // //   const nom = partie[0];
      // //   const domaine = partie [1];

      // //   const masqueMail = nom.substring(0,3)+'****';
      // //   return d.email = masqueMail+'@'+domaine

      // // });
      let pay;
      for (const demande of demandeur.demandes) {
        const paiement = await prisma.paiement.findFirst({
          where: {
            demande_id: demande.id,
          },
        });

        if (paiement) {
          pay = paiement;
          break; // Sortir si vous voulez le premier paiement trouvé
        }
      }

      // Ajouter le paiement à l'objet demandeur (pas dans demandes)
      // if (pay) {
      //     demandeur.paiement = pay;
      // }
      const demandesAvecPaiement = await Promise.all(
        demandeur.demandes.map(async (demande) => {
          const paiement = await prisma.paiement.findFirst({
            where: {
              demande_id: demande.id,
            },
          });

          return {
            ...demande,
            paiement: paiement || null,
          };
        }),
      );

      demandeur.demandes = demandesAvecPaiement;

      // const partie = demandeur.email.split("@");
      // const nom = partie[0];
      // const domaine = partie[1];

      // const masqueMail = nom.substring(0, 3) + "****";
      // demandeur.email = masqueMail + "@" + domaine;

      return res.json(demandeur);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Une erreur est survenue." });
    }
  }

  static async AddPersoPrevenir(req, res) {
    try {
      const { user_id, nom, prenom, telephone } = req.body;

      const { valid, formatted, message } = validatePhone(telephone);

      if (!valid) {
        return res.status(400).json({ error: message });
      }

      const demandeur = await prisma.utilisateur.findFirst({
        where: {
          id: user_id,
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!demandeur) {
        return res
          .status(404)
          .json({ error: "Aucun demandeur trouver pour cet identifiant" });
      }

      const isDemandeur = demandeur.roles.some(
        (r) => r.role.libelle === "DEMANDEUR",
      );
      if (!isDemandeur) {
        return res.status(401).json({
          error:
            "Cet utilisateur n'est pas autoriser a inscrire une personne a prevenir",
        });
      }

      await prisma.$transaction(async (tx) => {
        const persoA = await tx.personne_A_Prevenir.create({
          data: {
            utilisateur_id: user_id,
            nom,
            prenom,
            telephone: formatted,
          },
        });
        return persoA;
      });

      return res.status(200).json("personne a prevenir ajoute avec succes");
    } catch (err) {
      console.log("une erreur est survenue", err);
      return res.status(500).json({ error: "Oups une erreur est survenue" });
    }
  }

  static async AutoSwitch(req, res) {
    const { demandeur_id } = req.body;

    const status = ["ACTIF", "INACTIF", "SUSPENDU"];
    //                 0          1       2

    // console.log('demandeurId', );

    if (!demandeur_id) {
      return res.status(400).json({ error: "Les references son requises" });
    }
    // const id =
    const demandeur = await prisma.utilisateur.findFirst({
      where: {
        id: demandeur_id,
      },
    });

    if (!demandeur) {
      return res.status(404).json({ error: "Aucun concours trouve" });
    }

    if (demandeur.delelet_at) {
      return res.status(403).json({
        error:
          "Le compte suivant a ete supprimer , impossible de modifier le statut",
      });
    }
    let statusDemandeur = demandeur.statut;

    const isIncludes = status.includes(statusDemandeur);
    // console.log(isIncludes);
    if (!isIncludes) {
      return res.status(400).json({
        error:
          "Le status de l\'utilisateur est errone, veuillez modifier manuellement",
      });
    }

    const index = status.indexOf(statusDemandeur);

    // console.log(index);

    switch (index) {
      case 0:
        statusDemandeur = status[1];
        break;
      case 1:
        statusDemandeur = status[2];
        break;
      case 2:
        statusDemandeur = status[0];
        break;
    }

    await prisma.$transaction(async (tx) => {
      await tx.utilisateur.update({
        where: {
          id: demandeur.id,
        },
        data: {
          statut: statusDemandeur,
        },
      });
    });

    return res.status(200).json({
      message: `Status mis a jour avec success`,
    });
  }

  static async DemandeurDemande(req, res) {
    try {
      const { demandeur_id } = req.params;

      if (!demandeur_id) {
        return res
          .status(200)
          .json({ error: "Les references du demandeur sont requises" });
      }

      const demande = await prisma.demande.findMany({
        where: {
          utilisateur_id: demandeur_id,
        },
        include: {
          paiement: true,
          rendezvous: {
            include: {
              creneau: {
                include: {
                  centre: true,
                },
              },
            },
          },
        },
      });

      return res.json(demande);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Une erreur est survenue" });
    }
  }

  static async DemandeurListe(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;

      const [demande, total] = await Promise.all([
        prisma.demande.findMany({
          take: limit,
          skip,
          include: {
            paiement: {
              select: {
                statut: true,
                transId: true,
              },
            },
            rendezvous: {
              include: {
                creneau: {
                  select: {
                    centre: {
                      select: {
                        nom: true,
                      },
                    },
                  },
                },
              },
            },
            utilisateur: {
              select: {
                nom: true,
                prenom: true,
              },
            },
          },
        }),
        prisma.demande.count(),
      ]);

      // console.log("cette demande est :", demande);
      return res.json({
        demande,
        page,
        limit,
        totalDemande: total,
        totalPages: Math.ceil(total / limit),
      });
    } catch (err) {
      console.log("une erreur est survenue", err);

      return res.status(500).json({ error: "Une erreur est survenue" });
    }
  }

  static async GetDemande(req, res) {
    try {
      const { id_demande } = req.params;

      const demande = await prisma.demande.findFirst({
        where: { id: id_demande },
        select: {
          id: true,
          type_demande: true,
          statut: true,
          date_creation: true,
          paiement: {
            select: {
              statut: true,
              montant: true,
              reference: true,
              date_paiement: true,
            },
          },
          rendezvous: {
            select: {
              statut: true,
              creneau: {
                select: {
                  date: true,
                  heure: true,
                  centre: {
                    select: {
                      nom: true,
                      region: true,
                      commune: true,
                    },
                  },
                },
              },
            },
          },
          documents: {
            select: {
              id: true,
              fichier: true,
            },
          },
        },
      });

      if (!demande) {
        return res.status(404).json({ error: "Demande introuvable" });
      }

      const centres = await prisma.centre.findMany({
        select: {
          id: true,
          nom: true,
        },
      });

      // Génération des URLs signées pour chaque document
      const documentsWithUrls = await Promise.all(
        demande.documents.map(async (doc) => {
          try {
            const url = await minio.getSignedUrl(doc.fichier);
            return {
              id: doc.id,
              fichier: doc.fichier,
              url: url || null,
            };
          } catch (error) {
            console.error(`Erreur génération URL pour ${doc.fichier}:`, error);
            return {
              id: doc.id,
              fichier: doc.fichier,
              url: null,
            };
          }
        }),
      );

      const rep = {
        id: demande.id,
        type_demande: demande.type_demande,
        statut: demande.statut,
        date_creation: demande.date_creation?.toISOString().split("T")[0],
        isPaiement: !!demande.paiement,

        paiement: demande.paiement
          ? {
              statut: demande.paiement.statut,
              montant: demande.paiement.montant || 2500,
              date_paiement: demande.paiement.date_paiement,
            }
          : null,

        rendezvous: demande.rendezvous?.creneau
          ? {
              statut: demande.rendezvous.statut,
              date: demande.rendezvous.creneau.date
                ? new Date(demande.rendezvous.creneau.date)
                    .toISOString()
                    .split("T")[0]
                : null,
              heure: demande.rendezvous.creneau.heure,
              centre: demande.rendezvous.creneau.centre
                ? {
                    nom: demande.rendezvous.creneau.centre.nom,
                    region: demande.rendezvous.creneau.centre.region,
                    commune: demande.rendezvous.creneau.centre.commune,
                  }
                : null,
            }
          : null,

        documents: documentsWithUrls, // URLs signées
        centre: centres,
      };

      return res.status(200).json(rep);
    } catch (err) {
      console.error("Une erreur est survenue", err);
      return res.status(500).json({ error: "Une erreur est survenue" });
    }
  }
  ss;

  static async UpdateDemande(req, res) {
    try {
      const {
        status_demande,
        status_paiement,
        type_demande,
        status_rdv,
        centre_id,
      } = req.body;
      const { id_demande } = req.params;

      if (!id_demande) {
        return res
          .status(400)
          .json({ error: "Les references de la demande sont requises" });
      }

      const demande = await prisma.demande.findFirst({
        where: {
          id: id_demande,
        },
      });

      if (!demande) {
        return res.status(404).json({ error: "Aucune demande trouvee" });
      }

      await prisma.$transaction(async (tx) => {
        const dem = await tx.demande.update({
          where: {
            id: demande.id,
          },
          data: {
            statut: status_demande ?? demande.statut,
            type_demande: type_demande ?? demande.type_demande,
          },
        });
        const paiement = await tx.paiement.update({
          where: {
            demande_id: demande.id,
          },
          data: {
            statut: status_paiement,
          },
        });
        const rdv = await tx.rendezVous.update({
          where: {
            demande_id: demande.id,
          },
          data: {
            statut: status_rdv,
          },
        });
        //  const creneau =  await tx.creneau.update({
        //     where:{
        //       id:rdv.creneau_id
        //     },
        //     data:{
        //       centre_id:centre_id
        //     }

        //   })
      });

      sendToUser(demande.utilisateur_id, "Mise a jour de la demande", {
        type: "DEMANDE_MODIFIEE",
        message: "Votre demande a été modifiée",
        demandeId: demande.id,
      });

      return res.json({ message: "La demande a ete mise a jour" });
    } catch (err) {
      console.log("une erreur est survenue", err);
      return res.status(500).json({
        error: "Une erreur est survenue lors de la mise a jour de la demande",
      });
    }
  }

  static async updateDemandeur(req, res) {
    try {
      const { user_id } = req.params;

      const {} = req.body;
    } catch (error) {}
  }

  static async deleteDemandeur(req, res) {
    try {
      const { demandeur_id } = req.params;
      if (!demandeur_id) {
        return res
          .status(400)
          .json({ error: "La reference du demandeur est requise" });
      }

      const demandeur = await prisma.utilisateur.findFirst({
        where: {
          id: demandeur_id.toLowerCase(),
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      //  const isDemandeur = demandeur.roles.some((r)=>r.role.libelle==="DEMANDEUR");

      //  if(!isDemandeur){
      //   return res
      //  }

      await prisma.$transaction(async (tx) => {
        await tx.utilisateur.update({
          where: { id: demandeur.id },
          data: {
            delelet_at: true,
            statut: "SUSPENDU",
          },
        });
      });

      return res.json({ message: "demande supprimer avec succes" });
    } catch (err) {
      console.log("Une est survenue ", err);
      return res
        .status(500)
        .json({ error: "Une erreur est survenue lors de la suppression" });
      // // supprimer la demande en la mettant sur deleteat at
      // console.log('le detail de la demande est ', demande)
    }
  }

  static async DeleteDemande(req, res) {
    try {
      const { id_demande } = req.params;

      if (!id_demande) {
        return res
          .status(404)
          .json({ error: "La reference de la demande est indisponible" });
      }
      const demande = await prisma.demande.findFirst({
        where: {
          id: id_demande,
        },
      });

      if (!demande) {
        return res.status(404).json({ error: "Aucune demande trouver" });
      }

      await prisma.$transaction(async (tx) => {
        const uptd = await tx.demande.update({
          where: { id: demande.id },
          data: {
            delelet_at: true,
          },
        });

        return uptd;
      });
      // console.log('demande supprimer ',uptd)

      return res.json({ message: "demande supprimer avec succes" });
    } catch (err) {
      console.log("Une erreur est survenue", err);
      return res
        .status(500)
        .json({ error: "Une erreur est survenue lors de la suppression" });
    }
  }

  static async RecoverDemande(req, res) {
    try {
      const { id_demande } = req.params;

      if (!id_demande) {
        return res
          .status(404)
          .json({ error: "La reference de la demande est indisponible" });
      }
      const demande = await prisma.demande.findFirst({
        where: {
          id: id_demande,
        },
      });

      if (!demande) {
        return res.status(404).json({ error: "Aucune demande trouver" });
      }

      // supprimer la demande en la mettant sur deleteat at
      // console.log('le detail de la demande est ', demande)
      await prisma.$transaction(async (tx) => {
        const uptd = await tx.demande.update({
          where: { id: demande.id },
          data: {
            delelet_at: false,
          },
        });

        return uptd;
      });
      // console.log('demande supprimer ',uptd)

      return res.json({ message: "demande supprimer avec succes" });
    } catch (err) {
      console.log("Une erreur est survenue", err);
      return res
        .status(500)
        .json({ error: "Une erreur est survenue lors de la recuperation" });
    }
  }

  static async RecoverDemandeur(req, res) {
    try {
      const { demandeur_id } = req.params;

      if (!demandeur_id) {
        return res.status(400).json({ error: "Les references sont requises" });
      }

      const demandeur = await prisma.utilisateur.findFirst({
        where: {
          id: demandeur_id.toLowerCase(),
        },
      });

      if (!demandeur) {
        return res.status(404).json({ error: "Aucun utilisateur trouve" });
      }

      if (!demandeur.delelet_at) {
        return res.status(403).json({ error: "cet compte est deja actif" });
      }

      // update mtn
      await prisma.$transaction(async (tx) => {
        await tx.utilisateur.update({
          where: { id: demandeur.id },
          data: {
            delelet_at: false,
            statut: "INACTIF",
          },
        });
      });

      return res.json({ message: "utilisateur recuperer" });
    } catch (err) {
      console.log("une erreur est survenue", err);
      return res.status(500).json({ error: "Une erreur est survenue" });
    }
  }

  static async GetRole(req, res) {
    try {
      const cacheKey = "roles";
      const data = await redis.get(cacheKey);
      if (data) {
        return res.status(200).json({ data: JSON.parse(data) });
      }

      const roles = await prisma.role.findMany({
        select: {
          id: true,
          libelle: true,
        },
      });

      await redis.set(
        cacheKey,
        JSON.stringify(roles),
        "EX",
        AdminController.#TTL,
      );
      return res.status(200).json({ data: roles });
    } catch (error) {
      console.log("Une errreur est survenue ", error);

      return res.status(500).json({ error: "Une erreur est survenue  ..." });
    }
  }

  static async CreateUtilisateur(req, res) {
    try {
      const {
        nom,
        prenom,
        telephone,
        email,
        mot_de_passe,
        date_naissance,
        lieux_naissance,
        genre,
        statut,
        prenom_pere,
        prenom_mere,
        role,
        numero_act,
        date_acte,
        numero_certificat,
        commune_acte,
        tribunal,
        ville,
        secteur,
      } = req.body;

      // verifier si l'utilisateur existe deja

      // console.log(req.body)

      const exists = await prisma.utilisateur.findFirst({
        where: {
          OR: [{ telephone: telephone }, { email: email }],
        },
      });

      if (exists) {
        return res.status(409).json({ error: "Cet utilisateur existe Deja." });
      }
      // crerr

      // verifier si le role affilier existe vraiment

      const rolExist = await prisma.role.findFirst({
        where: {
          id: role,
        },
      });

      if (!rolExist) {
        return res
          .status(404)
          .json({ error: "Le role selctioner n'existe pas " });
      }

      const isAgent = rolExist.libelle === "AGENT";

      const hash = await bcrypt.hash(mot_de_passe, 10);

      const sexe = genre === "MASCULIN" ? "HOMME" : "FEMME";

      await prisma.$transaction(async (tx) => {
        const user = await tx.utilisateur.create({
          data: {
            nom,
            prenom,
            telephone,
            email,
            mot_de_passe: hash,
            date_naissance: new Date(date_naissance),
            lieux_naissance,
            genre: sexe,
            statut,
            prenom_pere,
            prenom_mere,
            numero_acte: numero_act,
            date_acte: new Date(date_acte),
            numero_certificat,
            commune_acte,
            tribunal,
          },
        });

        const adresse = await tx.adresse.upsert({
          where: { utilisateur_id: user.id },
          update: { adres_residence: secteur, ville_province: ville },
          create: {
            utilisateur_id: user.id,
            adres_residence: secteur,
            ville_province: ville,
          },
        });

        const role = await tx.utilisateurRole.create({
          data: {
            utilisateur_id: user.id,
            role_id: rolExist.id,
          },
        });

        return { user, role, adresse };
      });

      const cacheKey = `demandeur`;
      await redis.del(cacheKey);

      return res.status(200).json({ message: "Utilisateur avec succes" });
    } catch (error) {
      console.log("une erreeur est survenue lors de l'enregistrement ", error);
      return res.status(500).json({ error: "Une erreur est survenue" });
    }
  }

  static async ListePaiement(req, res) {
    try {
      const limit = 10;
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * limit;

      const cacheKey = `paiement`;

      const data = await redis.get(cacheKey);

      if (data) {
        return res.status(200).json({ data: JSON.parse(data) });
      }

      const [paiement, total] = await Promise.all([
        prisma.paiement.findMany({
          take: limit,
          skip,
          select: {
            id: true,
            date_paiement: true,
            mode_paiement: true,
            montant: true,
            statut: true,
            delelet_at: true,

            demande: {
              select: {
                type_demande: true,
                utilisateur: {
                  select: {
                    id: true,
                    nom: true,
                    prenom: true,
                    delelet_at: true,
                  },
                },
              },
            },
          },
        }),
        prisma.paiement.count(),
      ]);

      const response = {
        paiement,
        total,
        limit,
        totalPages: Math.ceil(total / limit),
        page,
      };

      await redis.set(
        cacheKey,
        JSON.stringify(response),
        "EX",
        AdminController.#TTL,
      );
      return res.json({ data: response });
    } catch (error) {
      console.log("error fetch paiement ", error);
      return res.status(500).json({ error: "Une erreur est survenue" });
    }
  }

  static async DetailPaiement(req, res) {
    try {
      const { paiement_id } = req.params;

      if (!paiement_id) {
        return res
          .status(400)
          .json({ error: "La reference de paiement est requise" });
      }

      const paiement = await prisma.paiement.findFirst({
        where: {
          id: paiement_id,
        },
        select: {
          id: true,
          date_paiement: true,
          mode_paiement: true,
          montant: true,
          statut: true,
          delelet_at: true,

          demande: {
            select: {
              statut: true,
              type_demande: true,
              utilisateur: {
                select: {
                  id: true,
                  nom: true,
                  prenom: true,
                  delelet_at: true,
                },
              },
            },
          },
        },
      });

      if (!paiement) {
        return res.status(404).json({ error: "Aucun paiement trouve" });
      }

      return res.status(200).json({ data: paiement });
    } catch (error) {
      console.log("erreur de recuperation ", error);
      return res.status(500).json({ error: "Une erreur est survenue" });
    }
  }

  static async UpdateStatusPaiement(req, res) {}
  static async ExporterListeUtilisateur(req, res) {
    try {
      const users = await prisma.utilisateur.findMany({
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      const data = DemandeurRessource(users);

      const headers = Object.keys(data[0]);

      const rows = data.map((item) => Object.values(item));

      const excelData = [headers, ...rows];

      await ExportData(excelData, res, "Liste_des_utilisateurs.xlsx");
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Erreur lors de l'export",
      });
    }
  }

  static async ExporterListeDemande(req, res) {
    try {
      const demande = await prisma.demande.findMany({
        include: {
          utilisateur: true,
          rendezvous: true,
          paiement: true,
        },
      });
      const data = demande.map((f) => {
        const { utilisateur, paiement } = f;

        return {
          reference: f.id,
          type: f.type_demande,
          date_creation: f.date_creation,
          date_modification: f.date_modification ?? null,
          statut: f.statut,

          demandeur: utilisateur
            ? `${utilisateur.nom} ${utilisateur.prenom}`
            : "Utilisateur supprimé",

          date_naissance: utilisateur?.date_naissance ?? null,

          statut_paiement: paiement?.statut ?? "NON_PAYE",
        };
      });

      const headers = Object.keys(data[0]);

      const rows = data.map((item) => Object.values(item));

      const excelData = [headers, ...rows];

      await ExportData(excelData, res, "Liste_des_utilisateurs.xlsx");
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Erreur lors de l'export",
      });
    }
  }

  static async ExporterListePaiement(req, res) {
    try {
      const paiement = await prisma.paiement.findMany({});

      const data = paiement;

      const headers = Object.keys(data[0]);

      const rows = data.map((item) => Object.values(item));

      const excelData = [headers, ...rows];

      await ExportData(excelData, res, "Liste_des_utilisateurs.xlsx");
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Erreur lors de l'export",
      });
    }
  }

  static async UpdateProfile(req, res) {
    try {
      const { id_demandeur } = req.params;

      const {
        nom,
        prenom,
        date_naissance,
        lieux_naissance,
        genre,
        profession,
        prenom_pere,
        prenom_mere,
        roles,
      } = req.body;

      if (!id_demandeur) {
        return res
          .status(400)
          .json({ error: "Les reference de  l'utilisateur sont requise" });
      }

      const demandeur = await prisma.utilisateur.findFirst({
        where: {
          id: id_demandeur,
        },
      });

      if (!demandeur) {
        return res.status(404).json({ error: "Aucun utilisateur trouve" });
      }

      const role = await prisma.role.findMany({
        where: {
          libelle: {
            in: roles,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
        },
      });

      // console.log('les roles founds ', role);

      const userRoles = await prisma.utilisateurRole.findMany({
        where: {
          utilisateur_id: demandeur.id,
        },
        select: {
          role_id: true,
        },
      });

      // console.log("les roles que possedes l'utilisateur ", userRoles);

      const roleIds = role.map((r) => r.id);
      const userRoleIds = userRoles.map((r) => r.role_id);

      const rolesToAdd = roleIds.filter((id) => !userRoleIds.includes(id));

      const rolesToRemove = userRoleIds.filter((id) => !roleIds.includes(id));

      // console.log('Rôles à ajouter:', rolesToAdd);
      // console.log('Rôles à supprimer:', rolesToRemove);

      await prisma.$transaction(async (tx) => {
        await tx.utilisateur.update({
          where: {
            id: demandeur.id,
          },
          data: {
            nom: nom ?? demandeur.nom,
            prenom: prenom ?? demandeur.prenom,
            date_naissance: date_naissance
              ? new Date(date_naissance)
              : demandeur.date_naissance,
            lieux_naissance: lieux_naissance ?? demandeur.lieux_naissance,
            profession: profession ?? demandeur.profession,
            genre: genre ?? demandeur.genre,
            prenom_mere: prenom_mere ?? demandeur.prenom_mere,
            prenom_pere: prenom_pere ?? demandeur.prenom_pere,
          },
        });

        if (rolesToAdd.length > 0) {
          await tx.utilisateurRole.createMany({
            data: rolesToAdd.map((roleId) => ({
              utilisateur_id: demandeur.id,
              role_id: roleId,
            })),
            skipDuplicates: true,
          });
        }

        if (rolesToRemove.length > 0) {
          await tx.utilisateurRole.deleteMany({
            where: {
              utilisateur_id: demandeur.id,
              role_id: {
                in: rolesToRemove,
              },
            },
          });
        }

        const updatedUser = await tx.utilisateur.findUnique({
          where: {
            id: demandeur.id,
          },
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        });

        return updatedUser;
      });

      // console.log('Mise à jour des rôles effectuée avec succès');

      const cacheKey = `demandeur`;
      await redis.del(cacheKey);

      return res.status(200).json({
        message: "Mise a jour du profil utilisateur effectuer avec succes",
      });
    } catch (error) {
      console.log("Une erreur est survenue", error);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  static async UpdateAdresse(req, res) {
    try {
      const { id_demandeur } = req.params;

      const {
        telephone,
        commune_acte,
        numero_acte,
        tribunal,
        numero_certificat,
        email,
      } = req.body;

      console.log(req.body);
      if (!id_demandeur) {
        return res
          .status(400)
          .json({ error: "Les reference de  l'utilisateur sont requise" });
      }

      const demandeur = await prisma.utilisateur.findFirst({
        where: {
          id: id_demandeur,
        },
      });

      if (!demandeur) {
        return res.status(404).json({ error: "Aucun utilisateur trouve" });
      }

      await prisma.$transaction(async (tx) => {
        await tx.utilisateur.update({
          where: {
            id: demandeur.id,
          },
          data: {
            telephone: telephone ?? demandeur.telephone,
            commune_acte: commune_acte ?? demandeur.commune_acte,
            numero_acte: numero_acte ?? demandeur.numero_acte,
            tribunal: tribunal ?? demandeur.tribunal,
            numero_certificat: numero_certificat ?? demandeur.numero_certificat,
            email: email ?? demandeur.email,
          },
        });
      });
      const cacheKey = `demandeur`;
      await redis.del(cacheKey);

      return res.status(200).json({
        message: "Mise a jour du profil utilisateur effectuer avec succes",
      });
    } catch (error) {
      console.log("Une erreur est survenue");
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  static async UpdateMdp(req, res) {
    try {
      const { id_demandeur } = req.params;

      const { mdp } = req.body;

      if (!id_demandeur) {
        return res
          .status(400)
          .json({ error: "Les reference de  l'utilisateur sont requise" });
      }

      const demandeur = await prisma.utilisateur.findFirst({
        where: {
          id: id_demandeur,
        },
      });

      if (!demandeur) {
        return res.status(404).json({ error: "Aucun utilisateur trouve" });
      }

      const hash = await bcrypt.hash(mdp, 10);
      await prisma.$transaction(async (tx) => {
        await tx.utilisateur.update({
          where: {
            id: demandeur.id,
          },
          data: {
            mot_de_passe: hash,
          },
        });
      });
      const cacheKey = ``;
      await redis.del(cacheKey);

      return res.status(200).json({
        message: "Mise a jour du profil utilisateur effectuer avec succes",
      });
    } catch (error) {
      console.log("Une erreur est survenue");
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  static async EvolutionDemande(req, res) {
    try {
      const [inscriptions, demandes, paiements] = await Promise.all([
        prisma.utilisateur.findMany(),
        prisma.demande.findMany(),
        prisma.paiement.findMany(),
      ]);

      const today = new Date();

      const stats = [];

      for (let index = 6; index >= 0; index--) {
        const date = new Date(today);
        date.setDate(today.getDate() - index);

        const jour = date.toISOString().split("T")[0];

        stats.push({
          name: date.toLocaleDateString("fr-FR", {
            weekday: "short",
          }),

          inscription: inscriptions.filter((u) => {
            return (
              new Date(u.date_creation).toISOString().split("T")[0] === jour
            );
          }).length,

          demandes: demandes.filter((d) => {
            return (
              new Date(d.date_creation).toISOString().split("T")[0] === jour
            );
          }).length,

          paiements: paiements.filter((p) => {
            return (
              new Date(p.date_paiement).toISOString().split("T")[0] === jour
            );
          }).length,
        });
      }
      return res.json({ stats });
    } catch (error) {
      console.log("Une erreur est survenue ", error);
      return res.status(500).json({ error: "Une erreur est survnue" });
    }
  }

  static async EvolutionCentre(req, res) {
    try {
      // let resp = {name : '' , value : 0 , color: ''};

      const cent = [];

      const centre = await prisma.centre.findMany({
        orderBy: {
          capacite_journaliere: "desc",
        },
        select: {
          nom: true,
          region: true,
          capacite_journaliere: true,
        },
      });

      const color = ["#0F6E56", "#5DCAA5", "#9FE1CB", "#E1F5EE"];

      const resp = centre.slice(0, 3).map((r, i) => ({
        name: r.nom,
        value: r.capacite_journaliere,
        color: color[i],
      }));

      const total = centre
        .slice(3)
        .reduce((acc, a) => acc + a.capacite_journaliere, 0);

      console.log(total);
      
      resp.push({
        name:'Autres', value:total,color:color[3]
      })

      return res.status(200).json({ resp });
    } catch (error) {
      console.log("Une erreur est survenue ", error);
      return res.status(500).json({ error: "Une erreur est survenue" });
    }
  }

  static async PayementEvolution (req,res){
    try {
      const paiement =  await prisma.paiement.findMany({
        where:{
          statut:'REUSSI'
        },
        select:{
          mode_paiement:true
        }
      });

     const bg = ["bg-blue-100","bg-orange-100","bg-purple-100", "bg-sky-100" ]
       const pay = paiement.slice(0,6).map((p,i)=>({
        titre : p.mode_paiement,
        value : paiement.filter((ps)=> p.mode_paiement == ps.mode_paiement).length
       }));

       return res.json({pay})
       
    } catch (error) {
      console.log('une erreur est survenue',error);
      return res.status(500).json({error:'Une erreur est survenue'})
    }
  } 
}
module.exports = AdminController;
