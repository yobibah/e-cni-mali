import getToken from "../../hooks/token";

const UpdatePassword = async ({ ancienMdp, nouveauMdp }) => {
  const uri = import.meta.env.VITE_API_URL;
  const token = getToken();

  if (!token) {
    throw new Error("Utilisateur non authentifié");
  }

  const response = await fetch(`${uri}/api/demandeur/update-password`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ancienMdp,
     mdp: nouveauMdp,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement.");
  }

  return data;
};

export default UpdatePassword;