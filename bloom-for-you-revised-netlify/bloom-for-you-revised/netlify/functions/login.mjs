import { createHmac, timingSafeEqual } from "node:crypto";
const COOKIE = "flower_session", TTL = 3600;
function equal(a,b){const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&timingSafeEqual(x,y);}
function sign(exp,secret){return createHmac("sha256",secret).update(`flower-session:${exp}`).digest("hex");}
export default async (req) => {
 if(req.method!=="POST")return new Response("Method not allowed",{status:405,headers:{Allow:"POST"}});
 const {FLOWER_USERNAME, FLOWER_PASSWORD, SESSION_SECRET}=process.env;
 if(!FLOWER_USERNAME||!FLOWER_PASSWORD||!SESSION_SECRET)return new Response("Authentication is not configured.",{status:500});
 let body;try{body=await req.json();}catch{return new Response("Invalid request.",{status:400});}
 const u=typeof body.username==="string"?body.username:"",p=typeof body.password==="string"?body.password:"";
 if(!equal(u,FLOWER_USERNAME)||!equal(p,FLOWER_PASSWORD))return new Response("Incorrect username or password.",{status:401,headers:{"Cache-Control":"no-store"}});
 const exp=Math.floor(Date.now()/1000)+TTL,token=`${exp}.${sign(exp,SESSION_SECRET)}`;
 return new Response(JSON.stringify({ok:true}),{status:200,headers:{"Content-Type":"application/json","Cache-Control":"no-store","Set-Cookie":`${COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${TTL}`}});
};
