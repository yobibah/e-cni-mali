import getToken from "../../hooks/adminToken";

const UpdateDemande = async (
  id_demande,
  statutDemande,
  statutPaiement,
  typeDemande,
  statutRdv,
  centreVa,
) => {
  const uri = import.meta.env.VITE_API_URL;

  //   console.log(demandeur_id)

  const token = getToken();

  const response = await fetch(
    `${uri}/api/admin/demande/update-demande/${id_demande}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
           'Authorization': `Bearer ${token}`,
      },

      body: JSON.stringify({
        status_demande: statutDemande,
        status_paiement: statutPaiement,
        type_demande: typeDemande,
        status_rdv: statutRdv,
        centre_id: centreVa,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement. lors de la récupération des données",
    );
  }

  return data;
};

export default UpdateDemande;
