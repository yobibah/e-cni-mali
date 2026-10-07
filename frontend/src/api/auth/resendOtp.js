const resendCodeOtp = async (telephone) =>{
    const uri = import.meta.env.VITE_API_URL;
    
    const response = await fetch(`${uri}/api/demandeur/resend-otp`,{
        method:'POST',
        headers:{
            'accept':'application/json',
            'Content-type': 'application/json',
        },
        body:JSON.stringify({telephone})
    });

    const data = await response.json();

    if(!response.ok){
         throw new Error("Le traitement de votre demande n’a pas pu aboutir. Veuillez réessayer ultérieurement. lors du renvoi du code otp");
        
    }
    return data;
};
export default resendCodeOtp;