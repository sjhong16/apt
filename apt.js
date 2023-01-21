// ==UserScript==
// @name        네이버 부동산 테이블 뷰
// @namespace   Violentmonkey Scripts
// @match       https://new.land.naver.com/complexes*
// @version     0.1
// @author      Maru
// @description Please use with violentmonkey
// @require     https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.10/clipboard.min.js
// @require     https://cdn.jsdelivr.net/npm/@violentmonkey/dom@2
// ==/UserScript==
 
let gLastSelectedApt = "";
let gItems = "";

class Item {
    constructor() {
        this.key = 0;
        this.type = "";
        this.price = "";
        this.monthly = "";
        this.dong = "";
        this.floor = "";
        this.direction = "";
        this.desc = "";
        this.realEstate = "";
        this.date = "";
    }    
}

let items = [];

function observeMainTitle() {
    // Find the target node
    const $node = $('.list_complex_info .complex_price_wrap');
    if (!$node) {
        return;
    }

    let prev = $node.find("#plugin_summary");
    if (prev) {
        prev.remove();
    }

    $node.prepend('<h1>Profile</h1>');

    // https://new.land.naver.com/complexes/9679?ms=37.5431126,126.9613267,17&a=APT:ABYG:JGC&e=RETAIL

    /*
    let table = document.createElement("table");
    table.setAttribute("id", "#plugin_summary");
    
    let tr = document.createElement("tr");
    let td1 = document.createElement("td");
    td1.innerText = "hello";
    tr.appendChild(td1);

    table.appendChild(tr);
    node.appendChild(table);

    /*

    items.forEach(item => {
        let tr = document.createElement("tr");

        let td1 = document.createElement("td");
        td1.innerText = item.type;
        //tr.appendChild(td1);

        //table.appendChild(tr);
    });
    //node.appendChild(table);
    //$('<span>test</span>').appendTo(node); 


    /*
    if (node.innerText != gLastSelectedApt) {
        node.innerText += "(Hello)";
        gLastSelectedApt = node.innerText;
        console.error(gLastSelectedApt);
    }
    */
}

// 각각의 매물을 감시한다.
function observeItems() {
    let itemNodes = document.querySelectorAll('.item_list .item');
    if (!itemNodes) {
        return;
    }

    items = [];
    itemNodes.forEach(itemNode => {
        let item = new Item();
        item.type = itemNode.querySelector('.price_line .type').innerText;
        item.dong = itemNode.querySelector('.item_title .text').innerText.split(' ')[1];
    
        let price = itemNode.querySelector('.price_line .price').innerText;
        let prices = price.split("/");
        item.price = prices[0];
        if (prices.length > 1) {
            item.monthly = prices[1];
        }
    
        let specs = itemNode.querySelector('.info_area .line:nth-child(1) .spec').innerText.split(', ');
        item.floor = specs[1];
        item.direction = specs[2];
    
        item.desc = itemNode.querySelector('.info_area .line:nth-child(2) .spec').innerText;
        item.realEstate = itemNode.querySelector('.agent_info:nth-child(2) .agent_name').innerText;
        item.date = itemNode.querySelector('.label_area .label .data').innerText;
    
        items.push(item);
        console.error(JSON.stringify(item));
    });
}

const disconnect = VM.observe(document.body, () => {
    observeItems();
    observeMainTitle();
  });
  
// You can also disconnect the observer explicitly when it's not used any more
disconnect();
