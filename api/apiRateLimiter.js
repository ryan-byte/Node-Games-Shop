//using bucket token algorithm (store the bucket in Redis in production)
//(currently storing bucket token in-memory)
//tested with a dos attack on the api endpoint
const apiRequestsPerMin = parseInt(process.env.apiRequestsPerMin) || 60;

class Bucket{
    constructor(capacity,refill_rate_sec){
        this.capacity = capacity;
        this.refill_rate_sec = refill_rate_sec;
        this.available_tokens = capacity;
        this.windowTimeStamp = Math.floor(Date.now()/1000);
    }
    useToken(){
        this.#checkRefill();
        if (this.available_tokens>0){
            --this.available_tokens;
            // console.log("tokens left in the bucket = "+this.available_tokens);
            return true;
        }else{
            return false;
        }
    }
    #checkRefill(){
        let currentTimeStamp = Math.floor(Date.now()/1000);
        if (currentTimeStamp > this.windowTimeStamp+60){
            this.windowTimeStamp = currentTimeStamp;
            this.#refillTokens();
        }
    }
    #refillTokens(){
        this.available_tokens = this.capacity;
    }
}


let allUsersBuckets = {};
const rateLimiter_Middleware = (capacity = apiRequestsPerMin,refill_rate_sec = 60)=>{
    return (req,res,next)=>{
        let userIp = req.ip;
        let tokensBucket = allUsersBuckets[userIp];
        if (tokensBucket){
            if (tokensBucket.useToken()){
                next();
            }else{
                res.sendStatus(429);
            }
        }else{
            newBucket = new Bucket(capacity,refill_rate_sec);
            newBucket.useToken();
            allUsersBuckets[userIp] = newBucket;
            next();
        }
    }
}

module.exports = rateLimiter_Middleware;