// ==UserScript==
// @name        네이버 부동산 테이블 뷰
// @namespace   Violentmonkey Scripts
// @match       https://new.land.naver.com/complexes*
// @version     0.1
// @author      Maru
// @description Please use with violentmonkey
// @require     https://code.jquery.com/jquery-1.12.4.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.10/clipboard.min.js
// @require     https://cdn.jsdelivr.net/npm/@violentmonkey/dom@2
// ==/UserScript==
 
let gLastSelectedApt = "";
let gItems = "";

class Item {
    constructor() {
        this.key = 0;
        this.name = "";
        this.type = "";
        this.price = "";
        this.monthly = "";
        this.dong = "";
        this.floor = "";
        this.direction = "";
        this.desc = "";
        this.realEstate = "";
    }    
}

let items = [];

function observeMainTitle() {
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
}

// 각각의 매물을 감시한다.
function observeItems() {
    let item = document.querySelector('.item_list .item');
    if (!item) {
        return;
    }

    let item = new Item();
    item.title = item.querySelector('.item_title .text').innerText;
    item.type = item.querySelector('.price_line .type').innerText;

    let priceNode = item.querySelector('.price_line .price');
    item.price = priceNode.innerText;

    let specNode = item.querySelector('.info_area .line:nth-child(1) .spec');

    item.desc = priceNode.item.querySelector('.info_area .line:nth-child(2) .spec').innerText;
    item.realEstate = priceNode.item.querySelector('.agent_info .agent_name').innerText;

    console.error(JSON.stringify(item));
}

const disconnect = VM.observe(document.body, () => {
    observeItems();
    observeMainTitle();
  });
  
// You can also disconnect the observer explicitly when it's not used any more
//disconnect();
