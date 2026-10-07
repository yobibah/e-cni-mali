const request = require("supertest");
const app = require("../../src/app.js");

import { describe, it, expect } from "vitest";

describe("POST /api/demandeur/login", () => {



  it("doit retourner 400 si le téléphone est invalide", async () => {
    const response = await request(app)
      .post("/api/demandeur/login")
      .send({
        tel: "123",
        mdp: "password123",
      });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      error: "Le format du numero de telephone n'est pas valide",
    });
  });



  it("doit retourner 404 si le compte n'existe pas", async () => {
    const response = await request(app)
      .post("/api/demandeur/login")
      .send({
        // Numéro valide mais qui n'existe PAS dans la base
        tel: "75869859",
        mdp: "password123",
      });

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      error: "Aucun compte trouver",
    });
  });




  it("doit retourner 401 avec un mauvais mot de passe", async () => {
    const response = await request(app)
      .post("/api/demandeur/login")
      .send({
        // Numéro EXISTANT dans ta base
        tel: "54806093",

        // Mauvais mot de passe volontairement
        mdp: "2345678987",
      });

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      error: "les identifiants de connexions sont invalides",
    });
  });




  it("doit retourner 403 si le rôle est incorrect", async () => {
    const response = await request(app)
      .post("/api/demandeur/login")
      .send({
        // Numéro EXISTANT
        tel: "54806092",

        // Mot de passe CORRECT de cet utilisateur
        mdp: "12345678",
      });

    expect(response.status).toBe(403);

    expect(response.body).toEqual({
      error: "Accès refusé.",
    });
  });




  it("doit retourner 201 avec un token si la connexion réussit", async () => {
    const response = await request(app)
      .post("/api/demandeur/login")
      .send({
        // Numéro EXISTANT d'un demandeur
        tel: "54806093",

        // Vrai mot de passe
        mdp: "1234567890",
      });

    expect(response.status).toBe(201);

    expect(response.body).toHaveProperty(
      "message",
      "connexiion reussi"
    );

    expect(response.body).toHaveProperty("token");

    expect(response.body.token).toBeTruthy();
  });

});