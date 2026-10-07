const Getcentre = async (page = 1) => {
  const uri = import.meta.env.VITE_API_URL;
  const response = await fetch(`${uri}/api/centres/?page=${page}`, {
    method: "GET",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data?.error || "Erreur de connexion");
    error.status = response.status;
    throw error;
  }
  return data;
};

export default Getcentre;