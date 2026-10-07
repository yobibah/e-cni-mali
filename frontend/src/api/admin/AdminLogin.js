const handleLoginAdmin = async (email, password) => {
  const uri = import.meta.env.VITE_API_URL;
  
  try {
    const response = await fetch(`${uri}/api/admin/oni/admin/login`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        email: email.trim(), 
        mot_de_passe: password 
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data?.error || 'Erreur de connexion');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    // Vérifier que le token est présent
    if (!data.token) {
      throw new Error('Token manquant dans la réponse');
    }

    return data;

  } catch (error) {

    if (error.name === 'TypeError' || error.message === 'Failed to fetch') {
      const networkError = new Error('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
      networkError.status = 0;
      throw networkError;
    }
    

    throw error;
  }
};

export default handleLoginAdmin;