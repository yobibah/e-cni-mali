import getToken from "../../hooks/adminToken";

const UpdatePassword = async (dats)=>{
  const uri = import.meta.env.VITE_API_URL;
//   const donns = datas.pop(0)
//   console.log(donns)
const token = getToken();

  const response = await fetch(
    `${uri}/api/admin/demandeur/update-user-password/${dats.userId}`,
    {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
           'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({mdp:dats.newPassword})
    },
  );

  const data = await response.json();

  //   console.log(data);
  if (!response.ok) {
    const error = new Error(data?.error || "Erreur de connexion");
    error.status = response.status;
    throw error;
  }
  return data;
};
export default UpdatePassword;