import getToken from "../../hooks/adminToken";

const createUser = async (data) => {
      const uri = import.meta.env.VITE_API_URL;
      const token = getToken();
  const response = await fetch(`${uri}/api/admin/demandeur/create-user`, { 
    method: "POST",
    headers: { "Content-Type": "application/json" ,   'Authorization': `Bearer ${token}`,},
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la création");
  }
  return response.json();
};
export default createUser;