const handleOtp =async (telephone,otp) =>{


    const uri = import.meta.env.VITE_API_URL
    const response = await fetch({uri}+'/auth/login',{
        method:"POST",
        headers:{
            'content-type':'application/json',
            'accept':'application/json'
        },
        body:JSON.stringify({telephone,otp})
    });
    const data = await response.json();
    const code = response.status;

    if(!response.ok){
       throw new Error(data.message || 'Erreur de connexion')
       
    }

    return {data,code};


};
export default handleOtp;                                                                                                                        