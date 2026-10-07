import getToken from "../../hooks/token"

const HandleProfile = async () =>{
    const uri = import.meta.env.VITE_API_URL;
    const token = getToken() ;
    
    const response = await fetch(`${uri}/api/demandeur/profile`,{
        method:"GET",
        headers:{
            Authorization:`Bearer ${token}`,
            'Content-Type': 'application/json',
            'accept': 'application/json'
        }
    });

    const data  = await response.json();

    if(!response.ok){
        return {
            status: response.status,
            error: data.error || " Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement."
        }
    }

    return data;
    
};

export default HandleProfile;