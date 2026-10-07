const queue = require('bullmq');
const connection = require("../config/redis");

const RdvSmsQueue = new queue.Queue("rdv-sms", {
    connection,
    defaultJobOptions:{
        attempts:10,
        backoff:{
            type:'exponential',
            delay:500
        },
        removeOnComplete:{
            age:3600,
            count: 1000
        },
        removeOnFail:{
            age:86400
        }
    }
});
module.exports = RdvSmsQueue