import getToken from "../../hooks/adminToken";

const updateCentre = async (id_centre, updatedData) => {
  const uri = import.meta.env.VITE_API_URL;
  const token = getToken();
  const response = await fetch(`${uri}/api/centres/update-centre/${id_centre}`, {
    method: "PUT", 
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
         'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updatedData),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data?.error || "Erreur lors de la mise à jour");
    error.status = response.status;
    throw error;
  }
  return data;
};

export default updateCentre;