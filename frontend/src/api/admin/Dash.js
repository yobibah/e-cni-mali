import getToken from "../../hooks/adminToken";

const Dash = async ()=>{
    const uri= import.meta.env.VITE_API_URL
    const token = getToken();
    const response = await fetch(`${uri}/api/admin/dash`,{
        method:'GET',
        headers:{
            'content-type': 'application/json',
            accept : 'application/json',
               'Authorization': `Bearer ${token}`,
            
        },
        // body:JSON.stringify({tel:telephone})
    });

    const data = await response.json();

    if(!response.ok){
        throw new Error(response.error ||'Une erreur est suvenue lors de la demande de la recuperation des donnees')
    }
    
    return data;
};
export default Dash;