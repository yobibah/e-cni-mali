const minio = require("minio");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

class File {
  static #client = new minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
  });

  static #bucket = process.env.MINIO_BUCKET;

  static #ALLOWED = {
    document: [".pdf", ".jpg", ".jpeg", ".png"],
    photo: [".jpg", ".jpeg", ".png"],
  };

  static #MAX_SIZE = 5 * 1024 * 1024;

static async #ensureBucket() {
  try {
    await File.#client.makeBucket(File.#bucket);
    console.log(`Bucket "${File.#bucket}" créé.`);
  } catch (err) {
    if (err.code !== "BucketAlreadyOwnedByYou" && err.code !== "BucketAlreadyExists") {
      throw err;
    }
  }
}


  static #validate(file, categorie = "document") {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = File.#ALLOWED[categorie];
    if (!allowed.includes(ext)) {
      throw new Error(`Format non autorisé. Formats acceptés : ${allowed.join(", ")}`);
    }
    if (file.size > File.#MAX_SIZE) {
      throw new Error(`Fichier trop volumineux. Maximum : 5 MB`);
    }
  }

  static #objectName(dossier, label, originalname) {
    const ext = path.extname(originalname).toLowerCase();
    const hash = crypto.randomBytes(6).toString("hex");
    return `${dossier}/${label}-${hash}${ext}`;
  }

  static async upload(file, dossier, label, categorie = "document") {
      await File.#ensureBucket();
    File.#validate(file, categorie);

    const objectName = File.#objectName(dossier, label, file.originalname);

    // Supporte buffer (multer) ET path (multiparty)
    if (file.buffer) {
      await File.#client.putObject(
        File.#bucket,
        objectName,
        file.buffer,
        file.size,
        { "Content-Type": file.mimetype }
      );
    } else if (file.path) {
      const stream = fs.createReadStream(file.path);
      const stat = fs.statSync(file.path);
      await File.#client.putObject(
        File.#bucket,
        objectName,
        stream,
        stat.size,
        { "Content-Type": file.mimetype }
      );
      // Supprimer le fichier temporaire après upload
      fs.unlink(file.path, () => {});
    } else {
      throw new Error("Fichier invalide : ni buffer ni path.");
    }

    return objectName;
  }

static async getSignedUrl(objectName, expiresInSeconds = 3600) {
  try {
    if (!objectName) {
      throw new Error("objectName est requis");
    }

    // Assurez-vous que vous retournez bien une URL (string)
    const url = await File.#client.presignedGetObject(
      File.#bucket,
      objectName,
      expiresInSeconds
    );
    
    // console.log("URL générée:", url); // Vérifiez ce qui est retourné
    return url; // Doit être une string
  } catch (error) {
    console.error("Erreur génération URL :", error);
    throw error;
  }
}

  static async deleteFolder(dossier) {
    const objects = [];
    await new Promise((resolve, reject) => {
      const stream = File.#client.listObjects(File.#bucket, dossier, true);
      stream.on("data", (obj) => objects.push(obj.name));
      stream.on("end", resolve);
      stream.on("error", reject);
    });
    if (objects.length > 0) {
      await File.#client.removeObjects(File.#bucket, objects);
    }
  }

  static saveLocal(file, dossier, label) {
    File.#validate(file);
    const dir = path.join(process.cwd(), "storage", dossier);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const objectName = File.#objectName(dossier, label, file.originalname);
    const fullPath = path.join(process.cwd(), "storage", objectName);

    if (file.buffer) {
      fs.writeFileSync(fullPath, file.buffer);
    } else if (file.path) {
      fs.copyFileSync(file.path, fullPath);
      fs.unlink(file.path, () => {});
    }

    return objectName;
  }

  static readLocal(objectName) {
    const fullPath = path.join(process.cwd(), "storage", objectName);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Fichier introuvable : ${objectName}`);
    }
    return fs.readFileSync(fullPath);
  }

  static deleteLocal(objectName) {
    const fullPath = path.join(process.cwd(), "storage", objectName);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  static deleteFolderLocal(dossier) {
    const fullPath = path.join(process.cwd(), "storage", dossier);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
  }
}

module.exports = File;