!function(e){var n={};function t(o){if(n[o])return n[o].exports;var r=n[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,t),r.l=!0,r.exports}t.m=e,t.c=n,t.d=function(e,n,o){t.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:o})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,n){if(1&n&&(e=t(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(t.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var r in e)t.d(o,r,function(n){return e[n]}.bind(null,r));return o},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},t.p="",t(t.s=165)}({165:function(e,n){console.log("'we up and running' - Message from content.js");let t=location.href;function o(e){for(;e.parentNode;){if("form"===e.parentNode.nodeName.toLowerCase())return e.parentNode;e=e.parentNode}return!1}chrome.runtime.sendMessage({getToken:!0},(async function(e){null!==e.token?void 0!==e.token?window.onload=()=>{console.log(t),chrome.runtime.sendMessage({cargo:t},e=>{void 0===e.returnCargo?console.log("error and stuff"):function(e,n){let t=function(e){let n=e.length;for(;0!==n;){let t=e[n-1],r=o(t);if(r){let e=r.getElementsByTagName("input");for(let n=0;n<e.length;n++)if(e[n]!==t&&("email"===e[n].type||"text"===e[n].type))return[e[n],t]}n--}}(function(){let e=document.getElementsByTagName("input"),n=e.length,t=[];for(;0!==n;)"password"===e[n-1].type&&(t[t.length]=e[n-1]),n--;return t}());t[0].value=e,t[0].innerHTML=e,t[1].value=n}(e.returnCargo.username,e.returnCargo.password)})}:console.log("response.token is undefined"):console.log("du er ikke logget ind")}))}});