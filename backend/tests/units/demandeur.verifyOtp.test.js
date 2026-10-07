import { describe, it, expect, vi, beforeEach } from "vitest";

const Otp = require("../../src/services/Otp.service");
const prisma = require("../../src/config/prisma");
const DemandeurController = require("../../src/controllers/demandeur.controller");

describe("DemandeurController.VerifyOtp - Tests unitaires", () => {
  let req;
  let res;

  beforeEach(() => {
    vi.restoreAllMocks();

    req = {
      body: {
        otp: "123456",
      },
      user: {
        id: 1,
      },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  it("doit activer le compte si l'OTP est valide", async () => {
    vi.spyOn(Otp, "verifieOtp").mockResolvedValue({
      success: true,
      message: "OTP valide.",
    });

    vi.spyOn(prisma.utilisateur, "update").mockResolvedValue({
      id: 1,
      statut: "ACTIF",
    });

    await DemandeurController.VerifyOtp(req, res);

    expect(Otp.verifieOtp).toHaveBeenCalledWith(1, "123456");

    expect(prisma.utilisateur.update).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
      data: {
        statut: "ACTIF",
      },
    });

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message:
        "Compte activé avec succès. Vous pouvez maintenant vous connecter.",
    });
  });

  it("doit retourner 400 si l'OTP est incorrect", async () => {
    vi.spyOn(Otp, "verifieOtp").mockResolvedValue({
      success: false,
      message: "Code otp Incorect",
    });

    const updateSpy = vi.spyOn(prisma.utilisateur, "update");

    await DemandeurController.VerifyOtp(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      error: "Code otp Incorect",
    });

    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("doit retourner 400 si l'OTP est introuvable", async () => {
    vi.spyOn(Otp, "verifieOtp").mockResolvedValue({
      success: false,
      message: "OTP introuvable.",
    });

    const updateSpy = vi.spyOn(prisma.utilisateur, "update");

    await DemandeurController.VerifyOtp(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      error: "OTP introuvable.",
    });

    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("doit retourner 400 si l'OTP est expiré", async () => {
    vi.spyOn(Otp, "verifieOtp").mockResolvedValue({
      success: false,
      message: "OTP expiré.",
    });

    const updateSpy = vi.spyOn(prisma.utilisateur, "update");

    await DemandeurController.VerifyOtp(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      error: "OTP expiré.",
    });

    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("doit retourner 400 si l'OTP est déjà utilisé", async () => {
    vi.spyOn(Otp, "verifieOtp").mockResolvedValue({
      success: false,
      message: "OTP déjà utilisé.",
    });

    const updateSpy = vi.spyOn(prisma.utilisateur, "update");

    await DemandeurController.VerifyOtp(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      error: "OTP déjà utilisé.",
    });

    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("doit retourner 500 en cas d'erreur serveur", async () => {
    vi.spyOn(Otp, "verifieOtp").mockRejectedValue(
      new Error("Erreur base de données")
    );

    await DemandeurController.VerifyOtp(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      error: "Erreur serveur.",
    });
  });
});