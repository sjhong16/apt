// ==UserScript==
// @name        네이버 부동산 테스트
// @namespace   Violentmonkey Scripts
// @match       https://new.land.naver.com/complexes*
// @version     0.1
// @author      Maru
// @description Please use with violentmonkey
// @require     https://code.jquery.com/jquery-1.12.4.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.10/clipboard.min.js
// @require     https://cdn.jsdelivr.net/npm/@violentmonkey/dom@2
// ==/UserScript==
 
var gLastSelectedApt = "";
 
const disconnect = VM.observe(document.body, () => {
    // Find the target node
    let node = document.querySelector('#complexTitle');
    if (!node) {
        return;
    }
  
    if (node.innerText != gLastSelectedApt) {
        node.innerText += "(Hello)";
        gLastSelectedApt = node.innerText;
        console.error(gLastSelectedApt);
    }
  });
  
  // You can also disconnect the observer explicitly when it's not used any more
  //disconnect();
