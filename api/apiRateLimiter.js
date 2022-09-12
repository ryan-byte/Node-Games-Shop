//using bucket token algorithm (store the bucket in Redis in the future)
// (currently storing bucket token in-memory)

//make all this processus automatic then add it to a middleware with a rate limit parameter and time
//then use this middleware globbaly in the program


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
            return true;
        }else{
            return false;
        }
    }
    #checkRefill(){
        let currentTimeStamp = Math.floor(Date.now()/1000);
        if (currentTimeStamp > this.windowTimeStamp+60){
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