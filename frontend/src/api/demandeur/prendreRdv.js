import getToken from "../../hooks/token";

const PrendreRdv = async ({ demande_id, creneau_id }) => {
  const uri = import.meta.env.VITE_API_URL;
  const token = getToken();

  const response = await fetch(`${uri}/api/demandeur/rendezvous`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ demande_id, creneau_id }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement.");
  return data;
};

export default PrendreRdv;