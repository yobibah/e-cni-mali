const bullmq = require('bullmq');
const connection = require("../config/redis");
const Ikoddi  = require('../api/Ikoddi')
const orange= require('../api/orange.api')
const worker  = new bullmq.Worker("rdv-sms", async (job)=>{
   const {telephone,message} = job.data ;

 // verfier si les donnees liee au sms sont  arrivee jusque la 



//  const ikoddi = new Ikoddi();
//  await ikoddi.sendsmsPerso(telephone,message)

 const omSms =  new orange(telephone);
 await omSms.SendPaiementSms(message);

},
{
    connection,
    concurrency:10,
    limiter:{
        max:10,
        duration:1000
    }
}
);

worker.on("completed", (job) => {
  console.log(
    `Job rdv sms terminé - jobId: ${job.id}`
  );
});

worker.on("failed", (job, error) => {
  console.error(
    `Job rdv sms - jobId: ${job?.id} - ${error.message}`
  );
});

worker.on("error", (error) => {
  console.error(
    "Erreur Worker sms :",
    error.message
  );
});

console.log("Worker OTP paiement démarré");