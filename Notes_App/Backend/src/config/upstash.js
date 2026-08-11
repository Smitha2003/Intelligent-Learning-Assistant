// import {Ratelimit} from "@upstash/ratelimit"
// import {Redis} from "@upstash/redis"
// import dotenv from "dotenv";


// // creating ratelimiter that allows 10 requests per 20 seconds
// const ratelimit = new Ratelimit({
//     redis: Redis.fromEnv(),
//     limiter: Ratelimit.slidingWindow(5, "10 s")
// })

// export default ratelimit;


import dotenv from "dotenv";
dotenv.config();

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// creating ratelimiter that allows 5 requests per 10 seconds
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(20, "10 s"),
});

export default ratelimit;