
const changePassword = async (mdp,otp)=>{
    const uri= import.meta.env.VITE_API_URL;
    const telephone = localStorage.getItem('telephone')
    
    const response = await fetch(`${uri}/api/demandeur/reset-password`,{
        method:'POST',
        headers:{
            'content-type': 'application/json',
            accept : 'application/json'
        },
        body:JSON.stringify({tel:telephone, mdp,otp})
    });

    const data = await response.json();

    if(!response.ok){
        throw new Error(response.error ||'Une erreur est suvenue lors de la demande de la recuperation du mots de passe')
    }
    
    return data;
};
export default changePassword;