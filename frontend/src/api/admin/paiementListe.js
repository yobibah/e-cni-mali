import getToken from "../../hooks/adminToken";

const paiementListe = async (page = 1) => {
  const uri = import.meta.env.VITE_API_URL;
  const token = getToken();
  const response = await fetch(`${uri}/api/admin/liste-paiement?page=${page}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
         'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement. lors de la récupération des données",
    );
  }

  // console.table(data)
  return data;
};

export default paiementListe;
