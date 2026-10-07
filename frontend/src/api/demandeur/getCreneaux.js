import getToken from "../../hooks/token";

const GetCreneaux = async ({ centre_id, demande_id }) => {
  const uri = import.meta.env.VITE_API_URL;
  const token = getToken();

  const response = await fetch(`${uri}/api/demandeur/creneaux`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ centre_id, demande_id }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement.");
  return data;
};

export default GetCreneaux;