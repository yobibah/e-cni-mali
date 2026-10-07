import getToken from "../../hooks/adminToken";

const exportDemande = async () => {
  const uri = import.meta.env.VITE_API_URL;

  const token =  getToken();
  const response = await fetch(`${uri}/api/admin/exporter-demande`, {
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


  const blob = await response.blob();
  return blob;
};

export default exportDemande;
