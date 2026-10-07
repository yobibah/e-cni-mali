import getToken from "../../hooks/adminToken";

const recoverDemande = async (id_demande) => {
  const uri = import.meta.env.VITE_API_URL;
  const token = getToken();
  const response = await fetch(`${uri}/api/admin/demandeur/recover-demande/${id_demande}`, {
    method: "PUT",
    headers: {
      accept: "application/json",
     'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error( 
      data.error ||

      "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement. lors de la suppression de la demande",
    );
  }

  return data;
};
export default recoverDemande;
