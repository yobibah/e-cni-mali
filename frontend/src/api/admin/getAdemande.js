import getToken from "../../hooks/adminToken";

const GetAdemande = async (id_demande) => {
  const uri = import.meta.env.VITE_API_URL;
  const token = getToken();
  const response = await fetch(`${uri}/api/admin/demandeur/demande/${id_demande}`, {
    method: "GET",
    headers: {
      accept: "application/json",
         'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement. lors de la recperation des donnees",
    );
  }

  return data;
};
export default GetAdemande;
