import getToken from "../../hooks/adminToken";

const updateCentreStatus = async (id_centre) => {
  const uri = import.meta.env.VITE_API_URL;
  const token = getToken();
  const response = await fetch(`${uri}/api/centres/update-status-centre/${id_centre}`, {
    method: "PUT",
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

export default updateCentreStatus;
