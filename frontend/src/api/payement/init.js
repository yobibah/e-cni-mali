import getToken from "../../hooks/token";

const initPayment = async ({ demande_id }) => {
  const uri = import.meta.env.VITE_API_URL;
  const token = getToken();

  const response = await fetch(`${uri}/api/paiement/paiement`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ demande_id }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement.");
  }

  return data;
};
export default initPayment;
