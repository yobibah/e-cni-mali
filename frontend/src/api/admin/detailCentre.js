import getToken from "../../hooks/adminToken";

const detailCentre = async (id_centre) => {
  const uri = import.meta.env.VITE_API_URL;
  const token = getToken();
  const response = await fetch(`${uri}/api/centres/detail-centre/${id_centre}`, {
    method: "GET",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
         'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

//   console.log(data);
  if (!response.ok) {
    const error = new Error(data?.error || "Erreur de connexion");
    error.status = response.status;
    throw error;
  }
  return data;
};

export default detailCentre;
