const dontenv= require('dotenv').config()
class Ikoddi {
  constructor() {
    this.apikey = process.env.IKODDI_API_kEY;
    this.organisation = process.env.IKODDI_ORGANISATION;
  }

   #url() {
    return `${process.env.IKODDI_URL}/${this.organisation}/sms`;
  }

  async sendsms(telephone,otp) {
    const tel =telephone
      const response = await fetch(this.#url(), {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          "x-api-key": this.apikey,
        },
        body: JSON.stringify({
          sentTo: tel,
        message: `Bonjour, bienvenue sur DNEC MALI.\nVotre code de validation est : ${otp}`,
          from: "Ikoddi",
          smsBroadCast: "com 1",
          countryStringCode: "ML",
          countryNumberCode: "223",
          messageType: "sms",
        }),
      });

      const data = await response.json();

      if(!response.ok){
        console.log(data)
        throw new Error(response.message||"une erreur est survenue lors de l\'envoi du code otp");
      }

      return data;

  }

    async sendsmsPerso(telephone,message) {
      
    const tel = telephone
    console.log('numero de telephone :' ,tel,message)
    console.log('mon url :',this.#url())
      const response = await fetch(this.#url(), {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          "x-api-key": this.apikey,
        },
        body: JSON.stringify({
          sentTo: tel,
        message: `DNEC MALI.\ ${message}`,
          from: "Ikoddi",
          smsBroadCast: "com 1",
          countryStringCode: "ML",
          countryNumberCode: "223",
          messageType: "sms",
        }),
      });

      const data = await response.json();

      if(!response.ok){
        console.log(data)
        throw new Error(response.message||"une erreur est survenue lors de l\'envoi du code otp");
      }

      return data;

  }
}
module.exports = Ikoddi;
