!function(e){var t={};function n(o){if(t[o])return t[o].exports;var l=t[o]={i:o,l:!1,exports:{}};return e[o].call(l.exports,l,l.exports,n),l.l=!0,l.exports}n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var l in e)n.d(o,l,function(t){return e[t]}.bind(null,l));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=170)}({170:function(e,t){document.getElementById("AuthDeleteButton").addEventListener("click",(function(e){e.preventDefault();let t=document.getElementById("deletePageForm");chrome.runtime.sendMessage({getToken:!0},(async function(e){if(null===e.token)console.log("Token was set to null - System error");else{if("DELETE"===document.getElementById("deletePageForm").AUTH.value){let t=await fetch("https://sw2b2-23.p2datsw.cs.aau.dk/node0/deleteAccount",{method:"DELETE",headers:{"Content-Type":"application/json",authorization:e.token}});t=await t.json(),console.log(t),console.log(t.error),null!=t.error?console.log("unauthorized"):(chrome.runtime.sendMessage({token:null},(function(e){1==e.success?console.log("token set to null"):console.log("*An error has occured*")})),function(){let e=document.getElementById("deletePage"),t=document.getElementById("deletionMessage"),n=document.getElementById("ReturnSettings");document.getElementById("BackButton").style.display="inline",n.style.display="none",e.style.display="none",t.innerHTML="Your account has been deleted!",t.style.display="inline"}())}else document.getElementById("AuthDelete").style.borderColor="Red",console.log('Did not write "DELETE" correctly')}t.reset()}))})),chrome.runtime.sendMessage({getToken:!0},(async function(e){if(null===e.token){document.getElementById("deletePage").style.display="none",document.getElementById("logInCheck").style.display="inline"}else{document.getElementById("deleteForm").style.display="none"}}))}});