import getToken from "../../hooks/token";
const TelechargerRecipisse = async ({ demande_id }) => {
    const uri = import.meta.env.VITE_API_URL;
    const token = getToken();
    
    const response = await fetch(`${uri}/api/demandeur/generate-recepisser/${demande_id}/recipisse`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response;
};

export default TelechargerRecipisse;