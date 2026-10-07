import getToken from "../../hooks/adminToken";

const DemandeurListe = async (page = 1) => {
  const uri = import.meta.env.VITE_API_URL;
  const token = getToken();
  const response = await fetch(
    `${uri}/api/admin/liste-demandeur?page=${page}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
           'Authorization': `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement. lors de la récupération des données"
    );
  }

  return data;
};

export default DemandeurListe;