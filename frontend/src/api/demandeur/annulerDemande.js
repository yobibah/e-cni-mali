import getToken from "../../hooks/token";

const AnnulerDemande = async ({ demande_id }) => {
    const token = getToken();
      const uri = import.meta.env.VITE_API_URL;
    const response = await fetch(`${uri}/api/demandeur/annuler-demande/${demande_id}/annuler`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    const data =  response.json();
    if(!response.ok){
        throw new Error("Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement.");
        

    }

    return data;
};
export default AnnulerDemande;

