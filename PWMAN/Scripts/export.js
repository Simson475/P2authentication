!function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(o,r,function(t){return e[t]}.bind(null,r));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=169)}({11:function(e,t){e.exports={hashCode:function(e){return e.split("").reduce((e,t)=>(e<<5)-e+t.charCodeAt(0)|0,0)},checkRegex:function(e){return/(?=.{8,}$)((?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]))/.test(e)},generatePassword:function(){let e=[],t=[0,1,2,3,4,5,6,7,8,9,"a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","O","N","P","Q","R","S","T","U","V","X","Y","Z"],n=Math.floor(5*Math.random())+15;for(let o=0;o<n;o++)e[o]=t[Math.floor(61*Math.random())];return e.join("")},postRequest:async function(e,t,n){return await fetch("https://sw2b2-23.p2datsw.cs.aau.dk/node0/"+e,{method:"POST",headers:{"Content-Type":"application/json",authorization:n},body:JSON.stringify(t,null,2)})}}},169:function(e,t,n){const{postRequest:o}=n(11);chrome.runtime.sendMessage({getToken:!0},(async function(e){if(console.log(e),null===e.token)document.getElementById("loginFail").style.display="inline";else{let t=await o("/confirmUsername",void 0,e.token);t=await t.json(),console.log(t),null!=t.error||chrome.storage.local.get([t.username],(function(e){console.log(e[t.username]),function(e){let t=document.getElementById("Pepper");document.getElementById("PepperLabel").style.display="inline",t.innerHTML=e,t.style.display="inline"}(e[t.username])}))}}))}});