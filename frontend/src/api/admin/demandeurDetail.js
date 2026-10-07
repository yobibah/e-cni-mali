import getToken from "../../hooks/adminToken";

const DemandeurDetail = async (id_demandeur) => {
  const uri = import.meta.env.VITE_API_URL;

  // console.log(id_demandeur)
  const token = getToken();

  const response = await fetch(
    `${uri}/api/admin/liste-demandeur/${id_demandeur}`,
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

export default DemandeurDetail;