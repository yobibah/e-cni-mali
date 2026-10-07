import getToken from "../../hooks/adminToken";

const ExporterUtilisitateur = async () => {
  const uri = import.meta.env.VITE_API_URL;
  const token = getToken();
  const response = await fetch(`${uri}/api/admin/exporter-utilisateur`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
         'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(
      data.error || "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement. lors de l'export des données"
    );
  }

  // Récupérer le blob du fichier
  const blob = await response.blob();
  return blob;
};

export default ExporterUtilisitateur;
