!function(e){var n={};function t(o){if(n[o])return n[o].exports;var r=n[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,t),r.l=!0,r.exports}t.m=e,t.c=n,t.d=function(e,n,o){t.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:o})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,n){if(1&n&&(e=t(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(t.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var r in e)t.d(o,r,function(n){return e[n]}.bind(null,r));return o},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},t.p="",t(t.s=163)}({163:function(e,n,t){document.getElementById("AutofillPassword").addEventListener("click",(function e(){document.getElementById("AutofillPassword").removeEventListener("click",e),document.getElementById("theSubmitButton").style.display="inline",document.querySelector("form").addEventListener("submit",l),chrome.runtime.sendMessage({getToken:!0},(async function(e){void 0!==e.token&&null!==e.token?(o=r(),chrome.tabs.query({active:!0,currentWindow:!0},(async function(e){await chrome.tabs.sendMessage(e[0].id,{autofillPassword:o},(function(e){console.log(e.autofillListenerResponse),!0===e.autofillListenerResponse?console.log("response succesful"):!1===e.autofillListenerResponse?console.log("Response from content.js failed"):console.log("very very bad dog....")}))}))):console.log("response.token is undefined")}))}));let o=null;const{generatePassword:r,postRequest:s}=t(8);async function l(e){e.preventDefault(),chrome.runtime.sendMessage({getToken:!0},(async function(e){console.log(e.token),void 0!==e.token&&null!==e.token?chrome.tabs.query({active:!0,currentWindow:!0},(async function(n){let t=document.getElementById("form"),r=n[0].url,l={username:t.username.value,password:o,domain:r};console.log(l);let u=await s("updateInfo",l,e.token);u=await u.json(),void 0!==u.error?(console.log("answer: "+u),console.log(u.error),function(e){let n=document.getElementById("addWebsite"),t=document.getElementById("error"),o=document.getElementById("errorMessage");n.style.display="none",t.style.display="inline",o.innerHTML=e}(u.error)):(console.log("Account added"),function(){let e=document.getElementById("h3");document.getElementById("form").style.display="none",document.getElementById("AutofillPassword").style.display="none",e.innerHTML="Login Added";let n=document.getElementById("return");n.innerHTML="Go back",n.style.top="100px",n.style.left="40px ",n.style.fontSize="1.3em",n.style.padding="10px 20px 10px 20px",n.style.marginLeft="18px"}()),t.reset()})):console.log("response.token is undefined")}))}chrome.tabs.query({active:!0,currentWindow:!0},(function(e){let n=e[0].url;n=n.split("/")[2],document.getElementById("URLgoesHere").innerHTML=n}))},8:function(e,n){e.exports={hashCode:function(e){return e.split("").reduce((e,n)=>(e<<5)-e+n.charCodeAt(0)|0,0)},checkRegex:function(e){return/(?=.{8,}$)((?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]))/.test(e)},generatePassword:function(){let e=[],n=[0,1,2,3,4,5,6,7,8,9,"a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","O","N","P","Q","R","S","T","U","V","X","Y","Z"],t=Math.floor(5*Math.random())+15;for(let o=0;o<=t;o++)e[o]=n[Math.floor(60*Math.random())];return e.join("")},postRequest:async function(e,n,t){return await fetch("https://sw2b2-23.p2datsw.cs.aau.dk/node0/"+e,{method:"POST",headers:{"Content-Type":"application/json",authorization:t},body:JSON.stringify(n,null,2)})}}}});