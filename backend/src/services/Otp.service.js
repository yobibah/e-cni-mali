const crypto = require("crypto");
const prisma = require("../config/prisma");

class Otp {
  static #TTL = 300;

  static #generer() {
    return String(crypto.randomInt(0, 1000000)).padStart(6, "0");
  }

  static async SendOtp(utilisateur_id) {
    const code = Otp.#generer();
    const expire_a = new Date(Date.now() + Otp.#TTL * 1000);

    await prisma.otp.upsert({
      where: { utilisateur_id: utilisateur_id },
      update: { code, expire_at: expire_a, utilise: false },
      create: { utilisateur_id, code, expire_at: expire_a },
    });

    return code;
  }
  static async verifieOtp(utilisateur_id, code) {
    const otp = await prisma.otp.findUnique({
      where: { utilisateur_id },
    });

    

    if (!otp) return { success: false, message: "OTP introuvable." };

    if (otp.code !== code)return{success:false, message:'Code otp Incorect'}
    if (otp.utilise) return { success: false, message: "OTP déjà utilisé." };

    if (new Date() > otp.expire_at)
      return { success: false, message: "OTP expiré." };

    if (otp.code !== String(code).trim())
      return { success: false, message: "OTP incorrect." };

    await prisma.otp.update({
      where: { utilisateur_id },
      data: { utilise: true },
    });

    return { success: true, message: "OTP valide." };
  }
}

module.exports = Otp;
