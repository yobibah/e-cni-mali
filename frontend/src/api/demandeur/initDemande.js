import getToken from "../../hooks/token";

const InitDemande = async ({ type }) => {
  const uri = import.meta.env.VITE_API_URL;
  const token = getToken();

  const response = await fetch(`${uri}/api/demandeur/init-demand`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type_demande: type }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement.");
  }

  return data;
};

export default InitDemande;