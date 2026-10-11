// prisma/seeds/centre.seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const centres = [
  {
    nom: "Centre ONI de Bamako Central",
    region: "District de Bamako",
    province: "Bamako",
    commune: "Commune III",
    capacite_journaliere: 150,
  },
  {
    nom: "Centre ONI de Sikasso",
    region: "Sikasso",
    province: "Sikasso",
    commune: "Sikasso",
    capacite_journaliere: 120,
  },
  {
    nom: "Centre ONI de Ségou",
    region: "Ségou",
    province: "Ségou",
    commune: "Ségou",
    capacite_journaliere: 100,
  },
  {
    nom: "Centre ONI de Mopti",
    region: "Mopti",
    province: "Mopti",
    commune: "Mopti",
    capacite_journaliere: 80,
  },
  {
    nom: "Centre ONI de Kayes",
    region: "Kayes",
    province: "Kayes",
    commune: "Kayes",
    capacite_journaliere: 90,
  },
  {
    nom: "Centre ONI de Koulikoro",
    region: "Koulikoro",
    province: "Koulikoro",
    commune: "Koulikoro",
    capacite_journaliere: 70,
  },
  {
    nom: "Centre ONI de Koutiala",
    region: "Sikasso",
    province: "Koutiala",
    commune: "Koutiala",
    capacite_journaliere: 80,
  },
  {
    nom: "Centre ONI de Bougouni",
    region: "Bougouni",
    province: "Bougouni",
    commune: "Bougouni",
    capacite_journaliere: 60,
  },
  {
    nom: "Centre ONI de Gao",
    region: "Gao",
    province: "Gao",
    commune: "Gao",
    capacite_journaliere: 70,
  },
  {
    nom: "Centre ONI de Tombouctou",
    region: "Tombouctou",
    province: "Tombouctou",
    commune: "Tombouctou",
    capacite_journaliere: 60,
  },
  {
    nom: "Centre ONI de Nioro du Sahel",
    region: "Nioro",
    province: "Nioro",
    commune: "Nioro du Sahel",
    capacite_journaliere: 50,
  },
  {
    nom: "Centre ONI de Kidal",
    region: "Kidal",
    province: "Kidal",
    commune: "Kidal",
    capacite_journaliere: 40,
  },
  {
    nom: "Centre ONI de San",
    region: "Ségou",
    province: "San",
    commune: "San",
    capacite_journaliere: 50,
  },
];

const roles = ['SUPERADMIN']

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

async function seedRoles() {
  for (let i=0 ; i<roles.length; i++){
      await prisma.role.createMany({
    data: {
      libelle: roles[i]
    }
  })
  }


}

// seedRoles().catch((e) => {
//   console.error(e);
//   process.exit(1);
// }).finally(async () => {
//   await prisma.$disconnect();
// })
seedCentres()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });