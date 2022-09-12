//using bucket token algorithm (store the bucket in Redis in production)
//(currently storing bucket token in-memory)
//tested with a dos attack on the api endpoint

class Bucket{
    constructor(capacity,refill_rate_sec){
        this.capacity = capacity;
        this.refill_rate_sec = refill_rate_sec;
        this.available_tokens = capacity;
        this.windowTimeStamp = Math.floor(Date.now()/1000);
    }
    useToken(){
        this.#checkRefill();
        console.log(this.available_tokens);
        if (this.available_tokens>0){
            --this.available_tokens;
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

const rateLimiter_Middleware = (capacity = 60,refill_rate_sec = 60)=>{
    return (req,res,next)=>{
        let userIp = req.ip;
        let tokensBucket = allUsersBuckets[userIp];
        if (tokensBucket){
            if (tokensBucket.useToken()){
                next();
            }else{
                res.status(403).send("error rate capacity reached")
            }
        }else{
            newBucket = new Bucket(capacity,refill_rate_sec); 
            allUsersBuckets[userIp] = newBucket;
            next();
        }
    }
}

module.exports = rateLimiter_Middleware;