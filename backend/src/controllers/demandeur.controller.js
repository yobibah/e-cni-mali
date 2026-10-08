const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const orange= require('../api/orange.api')
const File = require("../services/file.service");
const connection = require("../config/redis");
const { default: Redis } = require("ioredis");
const { json } = require("express");
const { Demandeur } = require("../middlewares/auth.middleware");
const Otp = require("../services/Otp.service");
const Ikoddi = require("../api/Ikoddi");
const { error } = require("console");
const validatePhone = require("../utils/verifyNumber");
const generateReceipt = require("../services/recippise.service");
const { demande } = require("../config/prisma");
const RdvSmsQueue = require("../queues/rdv.sms.queue");


const JWT_SECRET = process.env.JWT_SECRET_DNEC_B;
const TARIFS = {
  NOUVELLE: 2500,
  RENOUVELLEMENT: 2500,
  PERTE: 2500,
};
const TTL = 5 * 60;

const DOCUMENTS_REQUIS = {
  NOUVELLE: ["acte_naissance", "certificat_nationalite", "photo_identite"],
  RENOUVELLEMENT: ["ancienne_cnib", "photo_identite"],
  PERTE: ["declaration_perte", "certificat_nationalite", "photo_identite"],
};

class DemandeurController {
  static #roles = "DEMANDEUR";

  static async RegisterStep1(req, res) {
    try {
      const {
        nom,
        prenom,
        email,
        telephone,
        date_naissance,
        genre,
        mot_de_passe,
        utilisateur_id,
      } = req.body;

      const existing = await prisma.utilisateur.findFirst({
        where: { OR: [{ email }, { telephone }] },
      });

      // if (existing && existing.commune_acte !== " ") {
      //   return res
      //     .status(409)
      //     .json({ error: "Email ou téléphone déjà utilisé." });
      // }

      const mot_de_passe_hash = await bcrypt.hash(mot_de_passe, 10);
      const nud = `BF-${Date.now()}-${crypto.randomInt(1000, 9999)}`;
      const { formatted, valid } = validatePhone(telephone);

      if (!valid) {
        return res
          .status(400)
          .json({ error: "Le format du numero de telephone n'est pas valide" });
      }

      const utilisateur = await prisma.utilisateur.upsert({
        where: {
          id: utilisateur_id,
        },
        update: {
          nom,
          prenom,
          email,
          telephone: formatted,
          genre,
          date_naissance: new Date(date_naissance),
          mot_de_passe: mot_de_passe_hash,
          nud,
          lieux_naissance: "",
          prenom_pere: "",
          prenom_mere: "",
          profession: "",
          numero_acte: "",
          commune_acte: " ",
          date_acte: new Date(),
          numero_certificat: "",
          tribunal: " ",
        },
        create: {
          nom,
          prenom,
          email,
          telephone: formatted,
          genre,
          date_naissance: new Date(date_naissance),
          mot_de_passe: mot_de_passe_hash,
          nud,
          lieux_naissance: "",
          prenom_pere: "",
          prenom_mere: "",
          profession: "",
          numero_acte: "",
          commune_acte: " ",
          date_acte: new Date(),
          numero_certificat: "",
          tribunal: " ",
        },
      });

      return res.status(201).json({
        success: true,
        message: "Étape 1 complétée.",
        data: { utilisateur_id: utilisateur.id },
      });
    } catch (err) {
      console.error("RegisterStep1 error:", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
  }

  static async RegisterStep2(req, res) {
    try {
      const {
        utilisateur_id,
        lieux_naissance,
        prenom_pere,
        prenom_mere,
        numero_acte,
        commune_acte,
        date_acte,
        numero_certificat,
        tribunal,
        profession,
        adres_residence,
        ville_province,
      } = req.body;

      // console.log(utilisateur_id)
      const utilisateur = await prisma.utilisateur.findFirst({
        where: { id: utilisateur_id },
      });

      if (!utilisateur) {
        return res.status(404).json({ error: "Utilisateur introuvable." });
      }

      if (utilisateur.statut === "ACTIF") {
        return res.status(409).json({ error: "Ce compte est déjà activé." });
      }

      const doublonActe = await prisma.utilisateur.findFirst({
        where: {
          numero_acte,
          commune_acte,
          NOT: { id: utilisateur_id },
        },
      });

      if (doublonActe) {
        return res
          .status(409)
          .json({ error: "Cet acte de naissance est déjà enregistré." });
      }

      const doublonCertificat = await prisma.utilisateur.findFirst({
        where: {
          numero_certificat,
          tribunal,
          NOT: { id: utilisateur_id },
        },
      });

      if (doublonCertificat) {
        return res
          .status(409)
          .json({ error: "Ce certificat de nationalité est déjà enregistré." });
      }

      await prisma.$transaction(async (tx) => {
        await tx.utilisateur.update({
          where: { id: utilisateur_id },
          data: {
            lieux_naissance,
            prenom_pere,
            prenom_mere,
            numero_acte,
            commune_acte,
            date_acte: new Date(),
            numero_certificat,
            tribunal: tribunal ?? " ",
            profession,
          },
        });

        await tx.adresse.upsert({
          where: { utilisateur_id },
          update: { adres_residence, ville_province },
          create: { utilisateur_id, adres_residence, ville_province },
        });

        const role = await tx.role.findFirst({
          where: {
            libelle: {
              equals: DemandeurController.#roles,
              mode: "insensitive",
            },
          },
        });

        await tx.utilisateurRole.upsert({
          where: {
            utilisateur_id_role_id: {
              utilisateur_id,
              role_id: role.id,
            },
          },
          update: {},
          create: {
            utilisateur_id,
            role_id: role.id,
          },
        });
      });

      // enlever le +226 du titre

      const tel = utilisateur.telephone;
      // console.log('telephone : ', utilisateur)
      // const parse = tel.slice(3, tel.length).trim();
      // console.log('parse : ', parse)
      if (!tel) {
        throw new Error("Le numero de telephone est requis");
      }
        // envoyer le code via le sendeur officiel de ikoddi
      const IkodInit = new Ikoddi();
      const code = await Otp.SendOtp(utilisateur_id);
      await IkodInit.sendsms(tel, code);

      // envoyer le code via le sendeur officiel de orange

      const omSms = new orange(tel);
      await omSms.SendOtp(code)

      // console.log(code);
      const payloads = {
        id: utilisateur.id,
        role: DemandeurController.#roles,
      };

      const token = jwt.sign({ payloads }, process.env.JWT_SECRET_DNEC_B, {
        expiresIn: "30d",
      });
      // await SmsService.send(utilisateur.telephone, `Votre code ONI : ${code}`);

      return res.status(200).json({
        success: true,
        message:
          "Profil complété. Vérifiez votre téléphone pour activer votre compte.",
        data: { token },
      });
    } catch (err) {
      console.error("RegisterStep2 error:", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
  }

  static async VerifyOtp(req, res) {
    try {
      const { otp } = req.body;
      // const { token } = req.params;

      const { id } = req.user;

      const result = await Otp.verifieOtp(id, otp);
      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }

      await prisma.utilisateur.update({
        where: { id: id },
        data: { statut: "ACTIF" },
      });

      return res.status(200).json({
        success: true,
        message:
          "Compte activé avec succès. Vous pouvez maintenant vous connecter.",
      });
    } catch (err) {
      console.error("VerifyOtp error:", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
  }

  static async Login(req, res) {
    try {
      const { tel, mdp } = req.body;

      // console.log(tel, mdp);

      const { formatted, valid } = validatePhone(tel);
      if (!valid) {
        return res
          .status(400)
          .json({ error: "Le format du numero de telephone n'est pas valide" });
      }

      const demandeur = await prisma.utilisateur.findFirst({
        where: { telephone: formatted },
        select: {
          mot_de_passe: true,
          id: true,
          roles: {
            select: {
              role: true,
            },
          },
        },
      });

      if (!demandeur)
        return res.status(404).json({ error: "Aucun compte trouver" });

      const isdemandeur = demandeur.roles.some(
        (r) =>
          r.role.libelle.toLocaleUpperCase() === DemandeurController.#roles,
      );

      if (!isdemandeur) return res.status(403).json({ error: "Accès refusé." });

      const isverifie = await bcrypt.compare(mdp, demandeur.mot_de_passe);

      if (!isverifie)
        return res
          .status(401)
          .json({ error: "les identifiants de connexions sont invalides" });

      const payloads = {
        id: demandeur.id,
        role: DemandeurController.#roles,
      };

      const token = jwt.sign({ payloads }, process.env.JWT_SECRET_DNEC_B, {
        expiresIn: "24h",
      });

      return res.status(201).json({
        message: "connexiion reussi",
        token: token,
      });
    } catch (err) {
      console.error("une erreur est survenue", err);
      return res.status(500).json({ error: "une erreur est survenue" });
    }
  }

  // static async #roles(){
  //   try{
  //    return await prisma.role.findMany({
  //     select:{
  //       libelle:true
  //     }
  //    })
  //   }
  //   catch(err){

  //   }
  // }
  static async forgotPassword(req, res) {
    try {
      const { tel } = req.body;
      // trouver la personne affilier a cet numero de telephone
      if (!tel || tel == undefined) {
        return res.status(400).json("");
      }
      const { formatted, valid } = validatePhone(tel);
      if (!valid) {
        return res
          .status(400)
          .json({ error: "Le format du numero de telephone n'est pas valide" });
      }
      const demandeur = await prisma.utilisateur.findFirst({
        where: {
          telephone: formatted,
        },
        select: {
          id: true,
          roles: {
            select: {
              role: true,
            },
          },
        },
      });

      // verifier sil a un role demandeur

      if (!demandeur)
        return res.status(404).json({ error: "aucun demandeur trouve" });
      const isdemandeur = demandeur.roles.some(
        (r) =>
          r.role.libelle.toLocaleUpperCase() === DemandeurController.#roles,
      );

      if (!isdemandeur)
        return res.status(403).json({ error: "aucun demandeur trouve" });

      // const OtempPass = new Otp;

      // const code = await Otp.SendOtp(demandeur.id);
      // utiliser icodi pour envoyer les sms  sans se complexer avec les autres api

      const IkodInit = new Ikoddi();
      const code = await Otp.SendOtp(demandeur.id);
      await IkodInit.sendsms(tel, code);

      return res.status(200).json({
        message: "Code otp envoyer avec succces",
      });
    } catch (err) {
      console.error("une erreur est survenue", err);
      return res.status(500).json({ error: "Une erreur est survenue" });
    }
  }

  static async verifyCodeOtp(req, res) {
    try {
      // mettre le telephone dans localstorage en frontend ou cookies
      const { tel, otp } = req.body;
      const { formatted, valid } = validatePhone(tel);
      if (!valid) {
        return res
          .status(400)
          .json({ error: "Le format du numero de telephone n'est pas valide" });
      }
      const demandeur = await prisma.utilisateur.findFirst({
        where: {
          telephone: formatted,
        },
        select: {
          id: true,
          roles: {
            select: {
              role: true,
            },
          },
        },
      });

      // verifier sil a un role demandeur

      if (!demandeur)
        return res.status(404).json({ error: "aucun demandeur trouve" });
      const isdemandeur = demandeur.roles.some(
        (r) =>
          r.role.libelle.toLocaleUpperCase() === DemandeurController.#roles,
      );

      if (!isdemandeur)
        return res.status(403).json({ error: "aucun demandeur trouve" });

      // verifier le code otp ;

      const { success, message } = Otp.verifieOtp(demandeur.id, otp);
      if (success) {
        return res.status(200).json(message);
      } else {
        return res.status(403).json(message);
      }
    } catch (error) {
      console.error("une erreur est survenue", error);
    }
  }

  static async ResendOtp(req, res) {
    try {
      const { telephone } = req.body;

      if (!telephone) {
        return res
          .status(400)
          .json({ error: "le telephone ne doit pas etre vide" });
      }

      const { formatted, valid } = validatePhone(telephone);
      if (!valid) {
        return res
          .status(400)
          .json({ error: "Le format du numero de telephone n'est pas valide" });
      }
      // verifier si le numero existe en bd
      const demandeur = await prisma.utilisateur.findFirst({
        where: {
          telephone: formatted,
        },

        select: {
          telephone: true,
          id: true,

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

      if (!demandeur) {
        return res.status(404).json({ error: "aucun demandeur trouver" });
      }

      const isdemandeur = demandeur.roles.some(
        (r) => r.role.libelle.toUpperCase() === DemandeurController.#roles,
      );

      if (!isdemandeur) {
        return res.status(401).json({
          error:
            "vous ne disposer pas des droits neccessaires pour acceder a cette ressources",
        });
      }
      // envoyer le code otp

      const tel = demandeur.telephone;
      // console.log('telephone : ',tel)
      const parse = tel.slice(3, tel.length);

      const IkodInit = new Ikoddi();
      const code = await Otp.SendOtp(demandeur.id);
      await IkodInit.sendsms(parse, code);

      return res
        .status(200)
        .json({ message: "un code otp a ete envoyer sur votre numero" });
    } catch (err) {
      console.error("une erreur est survenue", err);
      return res.status(500).json({ error: "une erreur est survenue" });
    }
  }

  static async resetPassword(req, res) {
    try {
      const { otp, tel, mdp } = req.body;
      // console.log(otp,tel,mdp)
      const { formatted, valid } = validatePhone(tel);
      if (!valid) {
        return res
          .status(400)
          .json({ error: "Le format du numero de telephone n'est pas valide" });
      }
      const demandeur = await prisma.utilisateur.findFirst({
        where: {
          telephone: formatted,
        },
        select: {
          id: true,
          roles: {
            select: {
              role: true,
            },
          },
        },
      });

      // verifier sil a un role demandeur

      if (!demandeur)
        return res.status(404).json({ error: "aucun demandeur trouve" });
      const isdemandeur = demandeur.roles.some(
        (r) =>
          r.role.libelle.toLocaleUpperCase() === DemandeurController.#roles,
      );

      if (!isdemandeur)
        return res.status(403).json({ error: "aucun demandeur trouve" });

      // rien a dire aujourd'hui un peux fatigue{mais ca va aller}

      /// verifier le code otp

      const result = await Otp.verifieOtp(demandeur.id, otp);
      if (!result.success) {
        return res.status(400).json({ error: result });
      }

      const hash = await bcrypt.hash(String(mdp), 10);
      await prisma.utilisateur.update({
        where: {
          id: demandeur.id,
        },
        data: {
          mot_de_passe: hash,
        },
      });

      return res
        .status(200)
        .json({ message: "mots de passe modifier avec succes" });
    } catch (err) {
      console.error("une erreur est survenue", err);
    }
  }
  static #creneauxDispo(centre, nb_jours = 30) {
    if (!centre) throw new Error("Centre invalide.");

    const creneaux = [];
    const heures = [
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "14:00",
      "15:00",
      "16:00",
    ];
    const capaciteParCreneau = Math.ceil(
      centre.capacite_journaliere / heures.length,
    );

    for (let i = 0; i < nb_jours; i++) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + i);

      const jour = date.getDay();
      if (jour === 0 || jour === 6) continue;

      for (const heure of heures) {
        creneaux.push({
          centre_id: centre.id,
          date,
          heure,
          places_disponibles: capaciteParCreneau,
        });
      }
    }
    return creneaux;
  }

  static async InitDemande(req, res) {
    try {
      const { type_demande } = req.body;
      const { id } = req.user;

      // console.log(type_demande);

      // si ces une nouvelle demande ces que ces cui

      const isExist = await prisma.demande.findFirst({
        where: {
          utilisateur_id: id,
          type_demande: "NOUVELLE",
          delelet_at: false,
          statut: {
            not: "REJETEE",
          },
        },
      });

      // console.log(isExist);
      const hasCentres = await prisma.rendezVous.findFirst({
        where: {
          demande_id: isExist?.id,
        },
      });

      const hasDocument = await prisma.document.findFirst({
        where: {
          demande_id: isExist?.id,
        },
      });

      if (isExist && hasCentres && hasDocument) {
        return res.status(409).json({
          error:
            "Une nouvelle demande n'est initiable qu'une seule fois sauf en cas de rejet",
        });
      }
      // si ces approuver et que ces different de nouvelles pareilles  aussi

      const isApp = await prisma.demande.findFirst({
        where: {
          AND: [
            {
              type_demande: {
                in: ["PERTE", "RENOUVELLEMENT"],
              },
            },
            { utilisateur_id: id, delelet_at: false },
          ],
        },
      });

      console.log(isApp);
      if (type_demande === "PERTE") {
        const isApp = await prisma.demande.findFirst({
          where: {
            type_demande: "PERTE",
            utilisateur_id: id,
            delelet_at: false,
            statut: { notIn: ["TERMINEE", "REJETEE"] },
          },
        });

        // console.log(isApp)

        if (isApp || isApp !== null) {
          return res.status(409).json({
            error:
              "Vous avez deja une demande de Perte en cours de traitement. veuillez patienter",
          });
        }
      }

      if (type_demande === "RENOUVELLEMENT") {
        const isApp = await prisma.demande.findFirst({
          where: {
            type_demande: "RENOUVELLEMENT",
            utilisateur_id: id,
            delelet_at: false,
            statut: { notIn: ["TERMINEE", "REJETEE"] },
          },
        });

        if (isApp || isApp !== null) {
          return res.status(409).json({
            error:
              "Vous avez deja une demande de RENOUVELLEMENT en cours de traitement. veuillez patienter",
          });
        }
      }

      // if (isApp && isApp.statut !== "TERMINEE")
      //   return res
      //     .status(409)
      //     .json({
      //       error:
      //         "Vous avez deja une demande en cours de traitement. veuillez patienter",
      //     });

      // verifier encore et toujours verifier

      const InitDemande = await prisma.$transaction(async (tx) => {
        // Vérifier si une demande existe déjà
        const demandeExistante = await tx.demande.findFirst({
          where: {
            type_demande: type_demande,
            utilisateur_id: id,
            delelet_at: false,
          },
        });

        let demande;
        if (demandeExistante) {
          // Mettre à jour l'existante
          demande = await tx.demande.update({
            where: { id: demandeExistante.id },
            data: {
              type_demande: type_demande,
              utilisateur_id: id,
            },
          });
        } else {
          // Créer une nouvelle
          demande = await tx.demande.create({
            data: {
              type_demande: type_demande,
              utilisateur_id: id,
            },
          });
        }

        return demande;
      });

      const cachekey = `demande:${InitDemande.id}:demandeur:${id}`;
      await connection.del(cachekey);

      return res.status(201).json({
        message: "une nouvelle demande a ete creer",
        id_demande: InitDemande.id,
      });
    } catch (err) {
      console.error("une erreur est survenue ", err);
      return res.status(500).json({ error: "une erreur est survenue" });
    }
  }

  static async UploadsDoc(req, res) {
    try {
      const { id } = req.user;
      const { demande_id } = req.body;
      const files = req.files;

      // console.log(req.body);
      // console.log(req.user);
      if (!files || files.length === 0)
        return res.status(400).json({ error: "Aucun fichier reçu." });

      const demande = await prisma.demande.findFirst({
        where: { id: demande_id, utilisateur_id: id },
      });

      // console.log('demande',demande);

      if (!demande)
        return res.status(404).json({ error: "Demande introuvable." });

      const requis = DOCUMENTS_REQUIS[demande.type_demande];
      const recus = files.map((f) => f.fieldname);
      const manquants = requis.filter((r) => !recus.includes(r));

      if (manquants.length > 0)
        return res.status(400).json({
          error: `Documents manquants : ${manquants.join(", ")}`,
        });

      const documents = await prisma.$transaction(async (tx) => {
        const results = [];

        for (const file of files) {
          const fichier = await File.upload(file, demande_id, file.fieldname);

          // Vérifier si le document existe déjà
          const docExistant = await tx.document.findFirst({
            where: {
              demande_id: demande_id,
              type_document: file.fieldname,
            },
          });

          let result;
          if (docExistant) {
            result = await tx.document.update({
              where: { id: docExistant.id },
              data: { fichier: fichier },
            });
          } else {
            result = await tx.document.create({
              data: {
                demande_id: demande_id,
                type_document: file.fieldname,
                fichier: fichier,
              },
            });
          }
          results.push(result);
        }

        return results;
      });

      return res.status(201).json({
        message: "Documents uploadés avec succès.",
        total: documents.length,
      });
    } catch (err) {
      console.error("une erreur est survenue", err);
      return res.status(500).json({ error: "une erreur est survenue" });
    }
  }
  static async creneaux(req, res) {
    try {
      const { centre_id, demande_id } = req.body;
      const { id } = req.user;

      // console.log(centre_id, demande_id, id);
      const centre = await prisma.centre.findUnique({
        where: { id: centre_id },
        select: {
          id: true,
          nom: true,
          capacite_journaliere: true,
          statut: true,
        },
      });

      if (!centre || !centre.statut)
        return res
          .status(404)
          .json({ error: "Centre introuvable ou inactif." });

      const demande = await prisma.demande.findFirst({
        where: { id: demande_id, utilisateur_id: id },
      });

      if (!demande)
        return res.status(404).json({ error: "Demande introuvable." });

      const existing = await prisma.creneau.findFirst({
        where: { centre_id, date: { gte: new Date() } },
      });

      if (!existing) {
        const data = DemandeurController.#creneauxDispo(centre, 30);
        await prisma.creneau.createMany({ data, skipDuplicates: true });
      }

      const creneaux = await prisma.creneau.findMany({
        where: {
          centre_id,
          places_disponibles: { gt: 0 },
          date: { gte: new Date() },
        },
        orderBy: [{ date: "asc" }, { heure: "asc" }],
        select: {
          id: true,
          date: true,
          heure: true,
          places_disponibles: true,
        },
      });

      return res.status(200).json({ creneaux });
    } catch (err) {
      console.error("une erreur est survenue", err);
      return res.status(500).json({ error: "une erreur est survenue" });
    }
  }

  static async PrendreRendezVous(req, res) {
    try {
      const { demande_id, creneau_id } = req.body;
      const { id } = req.user;

      // Vérifier que la demande appartient à l'utilisateur
      const demande = await prisma.demande.findFirst({
        where: { id: demande_id, utilisateur_id: id },
        include: { rendezvous: true, documents: true },
      });

      if (!demande)
        return res.status(404).json({ error: "Demande introuvable." });

      // Vérifier que les documents ont été uploadés
      const requis = DOCUMENTS_REQUIS[demande.type_demande];
      const uploades = demande.documents.map((d) => d.type_document);
      const manquants = requis.filter((r) => !uploades.includes(r));

      if (manquants.length > 0)
        return res.status(400).json({
          error: `Uploadez d'abord les documents manquants : ${manquants.join(", ")}`,
        });

      // Vérifier qu'un rendez-vous n'existe pas déjà
      // if (demande.rendezvous)
      //   return res
      //     .status(409)
      //     .json({ error: "Un rendez-vous existe déjà pour cette demande." });

      // Vérifier que le créneau existe et a des places
      const creneau = await prisma.creneau.findUnique({
        where: { id: creneau_id },
      });

      if (!creneau)
        return res.status(404).json({ error: "Créneau introuvable." });

      if (creneau.places_disponibles <= 0)
        return res.status(409).json({ error: "Ce créneau est complet." });

      // Transaction : créer le RDV + décrémenter les places
      const rendezvous = await prisma.$transaction(async (tx) => {
        // Vérifier si un rendez-vous existe déjà pour cette demande
        const rdvExistant = await tx.rendezVous.findFirst({
          where: { demande_id: demande_id },
        });

        let rdv;
        if (rdvExistant) {
          // Mettre à jour le rendez-vous existant
          rdv = await tx.rendezVous.update({
            where: { id: rdvExistant.id },
            data: { creneau_id: creneau_id },
          });
        } else {
          // Créer un nouveau rendez-vous
          rdv = await tx.rendezVous.create({
            data: {
              demande_id: demande_id,
              creneau_id: creneau_id,
            },
          });
        }

        // Décrémenter les places
        await tx.creneau.update({
          where: { id: creneau_id },
          data: {
            places_disponibles: { decrement: 1 },
          },
        });

        return rdv;
      });

      // envoyer le message
      const user = await prisma.utilisateur.findFirst({
        where: {
          id: id,
        },
      });

      console.log("utilisateurs : ", user);
      const telephone = user.telephone;
      const jour = new Date(creneau.date);
      jour.setDate(jour.getDate() + 7);

      const dateRdv = jour.toLocaleDateString("fr-FR");

      const message = `Votre enrôlement physique est prévu le ${dateRdv}. Veuillez vous présenter au centre indiqué avec les pièces requises.`;

      await RdvSmsQueue.add("rdv-sms", {
        telephone,
        message,
      });

      return res.status(201).json({
        message: "Rendez-vous confirmé.",
        rendezvous_id: rendezvous.id,
        date: creneau.date,
        heure: creneau.heure,
      });
    } catch (err) {
      console.error("une erreur est survenue", err);
      return res.status(500).json({ error: "une erreur est survenue" });
    }
  }

  static async GetDemande(req, res) {
    try {
      const { id } = req.user;

      const demandes = await prisma.demande.findMany({
        where: { utilisateur_id: id, delelet_at: false },
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
              date_upload: true,
              type_document: true,
            },
          },
        },
        orderBy: {
          date_creation: "desc",
        },
      });

      if (!demandes || demandes.length === 0) {
        return res.status(200).json([]); // Retourner un tableau vide
      }

      // Formater les demandes
      const demandes_formatees = demandes.map((demande) => ({
        id: demande.id,
        type_demande: demande.type_demande,
        statut: demande.statut,
        date_creation: demande.date_creation.toISOString().split("T")[0],
        paiement_effectue: demande.paiement?.statut === "REUSSI" || false,
        montant: demande.paiement?.montant || 2500,
        isRdv: demande && demande.rendezvous != null,
        document: demande && demande.documents,
        // isDocument: demande.documents && (() => {
        //   // console.log('demande ', demande)
        //     switch (demande.type_document) {
        //         case "NOUVELLE":
        //             return demande.documents.length === 3;

        //         case "RENOUVELLEMENT":
        //           console.log('renouvellement',demande.documents.length === 2 )
        //             return demande.documents.length === 2;

        //         case "PERTE":
        //             return demande.documents.length === 3;

        //         default:
        //             return false;
        //     }
        // })(),
        rendezvous:
          demande.rendezvous && demande.rendezvous.creneau
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
      }));

      //   const isDocument = demandes.map((r)=>{
      //         switch (r.documents.type_document) {
      //     case "NOUVELLE":
      //         return r.documents.length === 3;

      //     case "RENOUVELLEMENT":
      //         return r.documents.length === 2;

      //     case "PERTE":
      //         return r.documents.length === 3;

      //     default:
      //         return false;
      // }
      //   })

      // console.log("Données formatees:", demandes_formatees);
      // console.log('demande',isDocument); // Debug

      return res.status(200).json(demandes_formatees);
    } catch (err) {
      console.error("une erreur est survenue", err);
      return res.status(500).json({ error: "une erreur est survenue" });
    }
  }
  // sera t'il possible d'annuler une demande ?

  static async detailDemande(req, res) {
    try {
      const { id } = req.user;
      const { id_demande } = req.body;

      const cachekey = `demande:${id_demande}:demandeur:${id}`;

      const cached = await connection.get(cachekey);
      if (cached) {
        return res.status(200).json({ data: JSON.parse(cached) });
      }

      const demande = await prisma.demande.findFirst({
        where: { id: id_demande, utilisateur_id: id, delelet_at: false },
        select: {
          id: true,
          type_demande: true,
          statut: true,
          date_creation: true,
          rendezvous: {
            select: {
              statut: true,
              creneau: {
                select: {
                  date: true,
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
        },
      });

      // selon le document ..

      // console.log(demande)
      if (!demande) {
        return res.status(200).json({ error: "aucune demande trouver" });
      }
      let isComplete = null;
      let isRdv = null;
      let isDocument = null;
      let ispay = null;
      let demandes = {};
      const rendezVous = await prisma.rendezVous.findFirst({
        where: {
          demande_id: demande.id,
        },
      });

      const document = await prisma.document.findMany({
        where: {
          demande_id: demande.id,
        },
      });

      // un document peut avoir deux ou trois pieces

      switch (demande.type_demande) {
        case "NOUVELLE":
          document.length < 3 ? (isDocument = false) : (isDocument = true);
          break;
        case "RENOUVELLEMENT":
          document.length < 2 ? (isDocument = false) : (isDocument = true);
          break;
        case "PERTE":
          document.length < 2 ? (isDocument = false) : (isDocument = true);
          break;
      }

      if (!rendezVous) {
        isRdv = false;
      }

      const payement = await prisma.paiement.findFirst({
        where: {
          demande_id: demande.id,
          statut: "REUSSI",
        },
      });

      //  payement === null ? ispay = false : ispay = true;
      ispay = payement === null;
      isComplete = isDocument && isRdv;

      //  !isRdv && ! isDocument ? isComplete = false : isComplete = true;

      // coter document
      // if(!isRdv && !isDocument ){
      //   isComplete = false;
      // }

      demandes.push(...demande, ispay, isComplete, isDocument, isRdv);
      console.log(demandes);

      await connection.set(cachekey, JSON.stringify({ demande }), "EX", 3600);
      return res.status(200).json({ data: demande });
    } catch (err) {
      console.error("une erreur est survenue : ", err);
      return res.status(500).json({ error: "une erreur est survenue" });
    }
  }
  static async Profil(req, res) {
    try {
      const { id } = req.user;
      const cacheKey = `demandeur:${id}`;
      const cached = await connection.get(cacheKey);

      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }

      const demandeur = await prisma.utilisateur.findFirst({
        where: { id },
        select: {
          nom: true,
          prenom: true,
          date_naissance: true,
          genre: true,
          telephone: true,
          email: true,
          lieux_naissance: true,
          adresse: {
            select: {
              ville_province: true,
              adres_residence: true,
            },
          },

          demandes: {
            select: {
              id: true,
              type_demande: true,
              date_creation: true,
              statut: true,
              date_modification: true,
            },
          },
        },
      });

      if (!demandeur) {
        return res.status(404).json({ error: "Aucun demandeur trouvé" });
      }

      // const tel = demandeur.telephone;
      // console.log('telephone : ',tel)
      // const parse = tel.slice(3,tel.length)
      // console.log('parse : ', parse)

      const response = { data: demandeur };

      const dataFormated = {
        ...demandeur,
        nom: demandeur.nom.toUpperCase(),
        prenom: demandeur.prenom
          .split(" ")
          .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
          .join(" "),
        date_naissance: demandeur.date_naissance.toLocaleDateString("fr-FR"),
        date_creation: demandeur.demandes.some((d) =>
          d.date_creation.toLocaleDateString("fr-FR"),
        ),
      };

      connection.set(cacheKey, JSON.stringify(dataFormated), "EX", TTL);

      return res.status(200).json(dataFormated);
    } catch (err) {
      console.error("Erreur profil :", err);
      return res.status(500).json({ error: "Une erreur est survenue" });
    }
  }

  static async Recap(req, res) {
    try {
      const { id } = req.user;
      const { demande_id } = req.params;

      const demande = await prisma.demande.findFirst({
        where: { id: demande_id, utilisateur_id: id },
        include: {
          utilisateur: {
            select: {
              nom: true,
              prenom: true,
              date_naissance: true,
              lieux_naissance: true,
              genre: true,
              telephone: true,
            },
          },
          documents: {
            select: {
              type_document: true,
              fichier: true,
              date_upload: true,
            },
          },
          paiement: {
            select: {
              montant: true,
              statut: true,
              mode_paiement: true,
              reference: true,
              date_paiement: true,
            },
          },
          rendezvous: {
            select: {
              id: true,
              statut: true,
              date_confirmation: true,
              creneau: {
                select: {
                  id: true,
                  date: true,
                  heure: true,
                  places_disponibles: true,
                  centre: {
                    select: {
                      id: true,
                      nom: true,
                      region: true,
                      province: true,
                      commune: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!demande)
        return res.status(404).json({ error: "Demande introuvable." });

      return res.status(200).json({
        data: {
          // Demande
          demande_id: demande.id,
          type_demande: demande.type_demande,
          statut: demande.statut,
          date_creation: demande.date_creation,

          // Infos personnelles
          utilisateur: demande.utilisateur,

          // Documents uploadés
          documents: demande.documents,

          // Rendez-vous
          rendezvous: demande.rendezvous
            ? {
                id: demande.rendezvous.id,
                statut: demande.rendezvous.statut,
                date_confirmation: demande.rendezvous.date_confirmation,
                date: demande.rendezvous.creneau.date,
                heure: demande.rendezvous.creneau.heure,
                centre: demande.rendezvous.creneau.centre,
              }
            : null,

          // Paiement
          paiement: demande.paiement ?? null,
        },
      });
    } catch (err) {
      console.error("une erreur est survenue", err);
      return res.status(500).json({ error: "une erreur est survenue" });
    }
  }

  static async UpdateProfile(req, res) {
    try {
      const { id } = req.user;

      const { nom, prenom, email, adresse } = req.body;

      // ftrouver le demandeur

      const demandeur = await prisma.utilisateur.findFirst({
        where: { id },
        select: {
          roles: {
            select: {
              role: true,
            },
          },
        },
      });
      if (!demandeur) {
        return res.status(404).json({ error: "Aucun demandeur trouve" });
      }
      // verifier si c'est demandeur malgre le middleware deja en place
      const isdemandeur = demandeur.roles.some(
        (d) =>
          d.role.libelle.toLocaleUpperCase() === DemandeurController.#roles,
      );

      if (!isdemandeur) {
        return res.status(401).json({
          error:
            "vous n'avez pas les droits necessaires pour efffectuer cette demande",
        });
      }

      // faire une transaction pour verifier l'exactitude des donnees

      await prisma.$transaction(async (tx) => {
        const updatedemandeur = await tx.utilisateur.update({
          where: { id },
          data: {
            nom: nom ?? demandeur.nom,
            prenom: prenom ?? demandeur.prenom,
            email: email ?? demandeur.email,

            adresse: {
              upsert: {
                update: {
                  adres_residence: adresse,
                  ville_province: adresse,
                },
                create: {
                  adres_residence: adresse,
                  ville_province: adresse,
                },
              },
            },
          },
          include: {
            adresse: true,
          },
        });

        return updatedemandeur;
      });

      const cacheKey = `demandeur:${id}`;

      connection.del(cacheKey);
      return res
        .status(200)
        .json({ message: "votre profil a ete mise a jour" });
    } catch (err) {
      console.error("une erreur est survenue ", err);
      return res
        .status(500)
        .json({ message: "une erreur lors de la mise a jour du profile" });
    }
  }

  static async UpdatePassword(req, res) {
    try {
      const { id } = req.user;
      const { ancienMdp, mdp } = req.body;

      console.log(ancienMdp, mdp);

      const demandeur = await prisma.utilisateur.findFirst({
        where: { id },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!demandeur) {
        return res.status(404).json({ error: "aucun demandeur trouver" });
      }

      const isDemandeur = demandeur.roles.some(
        (r) =>
          r.role.libelle.toLocaleUpperCase() === DemandeurController.#roles,
      );

      if (!isDemandeur) {
        return res
          .status(409)
          .json({ error: "aucun demandeur affilier a cette references" });
      }

      // verifier si l'ancien mots de passes corresponds au nouveau mots de passes

      const isMatch = await bcrypt.compare(ancienMdp, demandeur.mot_de_passe);
      console.log(isMatch);

      if (!isMatch) {
        return res
          .status(401)
          .json({ error: "Les mots de passes ne correspondents pas" });
      }

      const hahs = await bcrypt.hash(mdp, 10);
      await prisma.$transaction(async (tx) => {
        const updateMdp = await tx.utilisateur.update({
          where: {
            id: demandeur.id,
          },
          data: {
            mot_de_passe: hahs,
          },
        });

        return updateMdp;
      });
      return res
        .status(200)
        .json({ message: "mots de passe mofifier avec succees" });
    } catch (err) {
      console.error("une erreur est survenue", err);
      return res.status(500).json({
        error:
          "Une erreur est survenue lors de la modification du mots de passe",
      });
    }
  }

  static async GetRecepisser(req, res) {
    try {
      const { id } = req.user;
      const { demande_id } = req.params;

      if (!demande_id) {
        return res.status(400).json({
          error:
            "Les références de la demande ne sont pas correctement renseignées",
        });
      }

      const [demandeur, demande] = await Promise.all([
        prisma.utilisateur.findFirst({ where: { id } }),
        prisma.demande.findFirst({
          where: { id: demande_id },
          include: {
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
        }),
      ]);

      if (!demandeur) {
        return res
          .status(404)
          .json({ error: "Aucun utilisateur trouvé. Reconnectez-vous" });
      }

      if (!demande) {
        return res.status(404).json({ error: "Aucune demande trouvée" });
      }

      if (demandeur.id !== demande.utilisateur_id) {
        return res
          .status(401)
          .json({ error: "Cette demande n'appartient pas à cet utilisateur" });
      }

      const paiement = await prisma.paiement.findFirst({
        where: { demande_id: demande.id },
      });

      if (!paiement) {
        return res
          .status(401)
          .json({ error: "Aucun paiement trouvé pour cette demande" });
      }

      if (paiement.statut !== "REUSSI") {
        return res.status(401).json({
          error: "Le paiement doit être effectué avant d'obtenir le récépissé",
        });
      }

      const payload = JSON.stringify({
        id_demande: demande.id,
        id_demandeur: demandeur.id,
      });
      const hash = jwt.sign(payload, process.env.JWT_SECRET_DNEC_B);

      const data = {
        nom: demandeur.nom,
        prenom: demandeur.prenom,
        telephone: demandeur.telephone,
        date_naissance: new Date(demandeur.date_naissance).toLocaleDateString(
          "fr-FR",
        ),
        lieux_naissance: demandeur.lieux_naissance || "—",
        profession : demandeur.profession,
        prenom_mere: demandeur.prenom_mere,
        prenom_pere : demandeur.prenom_pere,
        numero_acte : demandeur.numero_acte,
        commune_acte : demandeur.commune_acte,
        date_acte: new Date(demandeur.date_acte).toLocaleDateString("fr-FR"),
        numero_certificat : demandeur.numero_certificat,
        tribunal : demandeur.tribunal,
        genre: demandeur.genre === "FEMME" ? "F" : "M",
        numero_dossier: paiement.reference,
        concours: demande.type_demande || "CNIB",
        centre: demande.rendezvous.creneau.centre.nom || "—",
        date_inscription: new Date(demande.date_creation).toLocaleDateString(
          "fr-FR",
        ),
        qr: hash,
      };

      await generateReceipt(data, res);
    } catch (err) {
      if (!res.headersSent) {
        return res.status(500).json({
          error: "Une erreur est survenue lors de la création du récépissé",
        });
      }
    }
  }

  static async AnnulerDemande(req, res) {
    try {
      const { demande_id } = req.params;
      const id_demande = demande_id;
      const { id } = req.user;
      const demandeur_id = id;
      if (!id_demande) {
        return res.status(400).json({ error: "les references de la demande" });
      }

      // console.log('demade_id',id_demande)

      const demande = await prisma.demande.findFirst({
        where: {
          id: id_demande,
          utilisateur_id: demandeur_id,
        },
      });

      if (!demande) {
        return res.status(404).json({ error: "Aucune demande trouver" });
      }

      // supprimer la demande de la base de donnee
      await prisma.$transaction(async (tx) => {
        const deleteDemande = await tx.demande.delete({
          where: { id: demande.id },
        });
        return deleteDemande;
      });

      return res
        .status(200)
        .json({ message: "Votre demande a ete annule avec succes" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Une erreur est survenue" });
    }
  }

  // static async Renouvellement(req,res){
  //   try {
  //     const {numero_cnib} = req.body;

  //     if(!numero_cnib){
  //       return res.status(400).json({error:'le numero de cnib est requis pour effectuer un renouvellement'});
  //     }

  //     // le numero de cnib n'est pas dans la base de donnee comme ca

  //     const [demandeur, demande] = await Promise.all([
  //       prisma.utilisateur.findUnique({
  //         where:{
  //           telephone
  //         }
  //       })

  //     ]);
  //   } catch (error) {
  //     console.log('Une erreur est survenue ', error);
  //     return res.status(500).json({error:'Une erreur est survenue'})

  //   }
  // }
}

module.exports = DemandeurController;
