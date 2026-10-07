import getToken from "../../hooks/adminToken";

const UpdateUerProfil = async (datas) => {
    // console.log(datas, id)
  const uri = import.meta.env.VITE_API_URL;
//   const donns = datas.pop(0)
//   console.log(donns)
const token = getToken();

  const response = await fetch(
    `${uri}/api/admin/demandeur/update-profile/${datas.id}`,
    {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
           'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(datas)
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

export default UpdateUerProfil;
