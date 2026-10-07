import getToken from "../../hooks/adminToken";

const deleteUtilisateur = async (id_demandeur) => {
  const uri = import.meta.env.VITE_API_URL;
  //  console.log(id_demandeur)
  const token = getToken();
  const response = await fetch(
    `${uri}/api/admin/demandeur/delete-demandeur/${id_demandeur}`,
    {
      method: "DELETE",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      "Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement. lors de la suppression de cet utilisateur",
    );
  }

  return data;
};
export default deleteUtilisateur;
