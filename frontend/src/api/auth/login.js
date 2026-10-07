// handleLogin.js
const handleLogin = async (telephone, password) => {
  const uri = import.meta.env.VITE_API_URL
  const response = await fetch(uri + '/api/demandeur/login', {
    method: "POST",
    headers: {
      'content-type': 'application/json',
      'accept': 'application/json'
    },
    body: JSON.stringify({ tel: telephone, mdp: password })
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data?.error || 'Erreur de connexion')
    error.status = response.status 
    throw error
  }

  return data;
};

export default handleLogin;