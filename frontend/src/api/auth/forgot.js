
const ForgotMdp = async (telephone)=>{
    const uri= import.meta.env.VITE_API_URL
    
    const response = await fetch(`${uri}/api/demandeur/forgot-password`,{
        method:'POST',
        headers:{
            'content-type': 'application/json',
            accept : 'application/json'
        },
        body:JSON.stringify({tel:telephone})
    });

    const data = await response.json();

    if(!response.ok){
        throw new Error(response.error ||'Une erreur est suvenue lors de la demande de la recuperation du mots de passe')
    }
    
    return data;
};
export default ForgotMdp;