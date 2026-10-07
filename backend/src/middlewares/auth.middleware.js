const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

class AuthMiddleware {
  static async #verifierRole(req, res, next, role) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: "Token manquant" });
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "Token manquant" });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET_DNEC_B);
      } catch (err) {
        if (err.name === "TokenExpiredError") {
          return res
            .status(401)
            .json({ error: "Token expiré, veuillez vous reconnecter" });
        }
        return res.status(401).json({ error: "Token invalide" });
      }
      // console.log('id du user ',decoded)
      const id = decoded.payloads.id;

      const utilisateur = await prisma.utilisateur.findFirst({
        where: { id: id },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!utilisateur) {
        return res.status(404).json({ error: "Utilisateur introuvable" });
      }

      const aLeRole = utilisateur.roles.some(
        (r) => r.role.libelle.toUpperCase() === role.toUpperCase(),
      );

      if (!aLeRole) {
        return res
          .status(403)
          .json({ error: `Accès refusé. Rôle requis : ${role}` });
      }

      req.user = utilisateur;
      next();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Une erreur est survenue" });
    }
  }

  static async Admin(req, res, next) {
    return AuthMiddleware.#verifierRole(req, res, next, "ADMIN");
  }

  static async Demandeur(req, res, next) {
    return AuthMiddleware.#verifierRole(req, res, next, "DEMANDEUR");
  }

  static async Agent(req, res, next) {
    return AuthMiddleware.#verifierRole(req, res, next, "AGENT");
  }
}

module.exports = AuthMiddleware;
