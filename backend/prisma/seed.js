// prisma/seeds/centre.seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const centres = [
  {
    nom: "Centre ONI de Ouagadougou Central",
    region: "Centre",
    province: "Kadiogo",
    commune: "Ouagadougou",
    capacite_journaliere: 150,
  },
  {
    nom: "Centre ONI de Bobo-Dioulasso",
    region: "Hauts-Bassins",
    province: "Houet",
    commune: "Bobo-Dioulasso",
    capacite_journaliere: 120,
  },
  {
    nom: "Centre ONI de Koudougou",
    region: "Centre-Ouest",
    province: "Boulkiemdé",
    commune: "Koudougou",
    capacite_journaliere: 80,
  },
  {
    nom: "Centre ONI de Banfora",
    region: "Cascades",
    province: "Comoé",
    commune: "Banfora",
    capacite_journaliere: 70,
  },
  {
    nom: "Centre ONI de Ouahigouya",
    region: "Nord",
    province: "Yatenga",
    commune: "Ouahigouya",
    capacite_journaliere: 80,
  },
  {
    nom: "Centre ONI de Dédougou",
    region: "Boucle du Mouhoun",
    province: "Mouhoun",
    commune: "Dédougou",
    capacite_journaliere: 60,
  },
  {
    nom: "Centre ONI de Fada N'Gourma",
    region: "Est",
    province: "Gourma",
    commune: "Fada N'Gourma",
    capacite_journaliere: 60,
  },
  {
    nom: "Centre ONI de Manga",
    region: "Centre-Sud",
    province: "Zoundwéogo",
    commune: "Manga",
    capacite_journaliere: 50,
  },
  {
    nom: "Centre ONI de Tenkodogo",
    region: "Centre-Est",
    province: "Boulgou",
    commune: "Tenkodogo",
    capacite_journaliere: 60,
  },
  {
    nom: "Centre ONI de Kaya",
    region: "Centre-Nord",
    province: "Sanmatenga",
    commune: "Kaya",
    capacite_journaliere: 70,
  },
  {
    nom: "Centre ONI de Ziniaré",
    region: "Plateau-Central",
    province: "Oubritenga",
    commune: "Ziniaré",
    capacite_journaliere: 50,
  },
  {
    nom: "Centre ONI de Dori",
    region: "Sahel",
    province: "Séno",
    commune: "Dori",
    capacite_journaliere: 40,
  },
  {
    nom: "Centre ONI de Gaoua",
    region: "Sud-Ouest",
    province: "Poni",
    commune: "Gaoua",
    capacite_journaliere: 40,
  },
];

async function seedCentres() {
  console.log("Seeding centres ONI...");

  for (const centre of centres) {
    await prisma.centre.upsert({
      where: {
        // upsert sur nom+commune pour éviter les doublons
        id: (await prisma.centre.findFirst({
          where: { nom: centre.nom, commune: centre.commune },
          select: { id: true },
        }))?.id ?? "non_existant",
      },
      update: centre,
      create: centre,
    });
  }

  console.log(`${centres.length} centres seedés avec succès.`);
}

seedCentres()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });