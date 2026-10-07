import getToken from "../../hooks/token";
const GetDemande = async () =>{
    const token = getToken();

    const uri = import.meta.env.VITE_API_URL;

    const response = await fetch (`${uri}/api/demandeur/demandes`,
        {
            method:"GET",
            headers:{
                  Authorization: `Bearer ${token}`,
      'accept': 'application/json',
            }
        }
    );

    const data = await response.json();

    if(!response.ok){
        throw new Error('Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement. lors de la recperation des donnees')
    }

    return data;
};
export default GetDemande;