import getToken from "../../hooks/adminToken";

const DemandeurDems = async (demandeur_id) => {
  const uri = import.meta.env.VITE_API_URL;

  // console.log(demandeur_id)
 const token = getToken()
  const response = await fetch(
    `${uri}/api/admin/demandeur/demande-by-user/${demandeur_id}`,
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

export default DemandeurDems;