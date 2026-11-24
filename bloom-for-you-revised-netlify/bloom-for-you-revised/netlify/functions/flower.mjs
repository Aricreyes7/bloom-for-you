import { createHmac, timingSafeEqual } from "node:crypto";
const COOKIE="flower_session";
function equal(a,b){const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&timingSafeEqual(x,y);}
function valid(req,secret){
 const raw=req.headers.get("cookie")||"",item=raw.split(";").map(x=>x.trim()).find(x=>x.startsWith(COOKIE+"="));if(!item)return false;
 let token;try{token=decodeURIComponent(item.slice(COOKIE.length+1));}catch{return false;}
 const [expText,sig,extra]=token.split(".");if(!expText||!sig||extra!==undefined)return false;
 const exp=Number(expText);if(!Number.isSafeInteger(exp)||exp<Math.floor(Date.now()/1000))return false;
 const expected=createHmac("sha256",secret).update(`flower-session:${expText}`).digest("hex");return equal(sig,expected);
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
export default async(req)=>{
 if(req.method!=="GET")return new Response("Method not allowed",{status:405,headers:{Allow:"GET"}});
 const secret=process.env.SESSION_SECRET;if(!secret)return new Response("Authentication is not configured.",{status:500});
 if(!valid(req,secret))return new Response("Please log in first.",{status:401,headers:{"Cache-Control":"no-store"}});
 const message=esc(process.env.FLOWER_MESSAGE||"You make my world bloom. 🌷");
 const html=`<div class="flower-glow"></div><h1>A Flower Just For You 🌸</h1>
 <p class="subtitle">A little bloom, made especially for you.</p>
 <div class="garden"><div class="flower">${Array.from({length:8},()=>'<div class="petal"></div>').join("")}<div class="center"></div></div>
 <div class="stem"></div><div class="leaf left"></div><div class="leaf right"></div></div>
 <p class="subtitle" style="font-size:clamp(18px,3vw,24px);margin-top:-12px">${message}</p>
 <button class="replay-button" type="button" onclick="replayFlower()">Bloom Again 🌷</button>`;
 return new Response(html,{status:200,headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
};
