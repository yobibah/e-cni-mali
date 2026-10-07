
import getToken from "../../hooks/token";

const uri = `${import.meta.env.VITE_API_URL}/api/demandeur`;

export async function step1(params) {
    const user_id = localStorage.getItem('user_id');
    const response = await fetch(`${uri}/register-one`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nom: params.nom,
            prenom: params.prenom,
            genre: params.genre,
            email: params.email,
            telephone: params.telephone,
            date_naissance: params.date_naissance,
            mot_de_passe: params.mot_de_passe,
            utilisateur_id : user_id ?? ''
    

        })
    });
    
    const data = await response.json();

    if (!response.ok) {
        throw { status: response.status, error: data.error || "Erreur lors de l'étape 1" };
    }

    return { data, status: response.status };
}

export async function step2(params) {
    const response = await fetch(`${uri}/register-two`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            utilisateur_id: params.user_id,
            lieux_naissance: params.lieux_naissance,
            prenom_pere: params.prenom_pere,
            prenom_mere: params.prenom_mere,
            numero_acte: params.numero_acte,
            commune_acte: params.commune_acte,
            numero_certificat: params.numero_certificat,
            profession: params.profession,
            adres_residence: params.adres_residence,
            ville_province: params.ville_province
        })
    });
    
    const data = await response.json();

    if (!response.ok) {
        throw { status: response.status, error: data.error || "Erreur lors de l'étape 2" };
    }

    return { data, status: response.status };
}

export async function step3(otp, token) {
  const response = await fetch(`${uri}/register-three`, {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ otp }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Erreur lors de la vérification OTP");
  }

  return data;
}

export async function resendOtp(userId) {
    const token = getToken();
    
    const response = await fetch(`${uri}/resend-otp`, {
        method: "POST",
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            utilisateur_id: userId
        })
    });
    
    const data = await response.json();

    if (!response.ok) {
        throw { status: response.status, error: data.error || "Erreur lors du renvoi du code" };
    }

    return { data, status: response.status };
}