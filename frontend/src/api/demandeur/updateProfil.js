import getToken from "../../hooks/token";
const updateProfil = async ( params ) => {
  const uri = import.meta.env.VITE_API_URL;
  const token = getToken();

  const response = await fetch(`${uri}/api/demandeur/update-profile`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      nom: params.nom,
      prenom: params.prenom,
      email: params.email,
      adresse: params.adresse,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(response.error || "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement.");
  }

  return data;
};
export default updateProfil;
