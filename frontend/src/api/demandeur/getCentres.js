import getToken from "../../hooks/token";

const GetCentres = async () => {
  const uri = import.meta.env.VITE_API_URL ;
  const token = getToken();

  const response = await fetch(`${uri}/api/centres`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      'accept': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement.");
  return data;
};

export default GetCentres;