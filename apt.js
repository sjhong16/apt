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

let items = new Map();
let dirty = false;

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

    let summary = '<table id="#plugin_summary" border="1">';
    summary += '<tr>'
            + '<td>날자</td>'
            + '<td>타입</td>'
            + '<td>가격</td>'
            + '<td>월세</td>'
            + '<td>동</td>'
            + '<td>층</td>'
            + '<td>방향</td>'
            + '<td>설명</td>'
            + '<td>부동산</td>'
            + '</tr>';
    items.forEach(item => {
        summary += `<tr>`
        summary += `<td>${item.date}</td>`
        summary += `<td>${item.type}</td>`
        summary += `<td>${item.price}</td>`
        summary += `<td>${item.monthly}</td>`
        summary += `<td>${item.dong}</td>`
        summary += `<td>${item.floor}</td>`
        summary += `<td>${item.direction}</td>`
        summary += `<td>${item.desc}</td>`
        summary += `<td>${item.realEstate}</td>`
        summary += `</tr>`
    })

    summary += '</table>';
    $node.prepend(summary);
}

// 각각의 매물을 감시한다.
function observeItems() {
    let itemNodes = document.querySelectorAll('.item_list .item');
    if (!itemNodes) {
        return;
    }

    items.clear();
    itemNodes.forEach(itemNode => {
        let item = new Item();
        item.type = itemNode.querySelector('.price_line .type').innerText;
        item.dong = itemNode.querySelector('.item_title .text').innerText.split(' ')[1];
    
        let price = itemNode.querySelector('.price_line .price').innerText;
        let prices = price.split("/");
        item.price = prices[0];
        if (prices.length > 1) {
            item.monthly = prices[1];
        } else {
            item.monthly = "";
        }
    
        let specs = itemNode.querySelector('.info_area .line:nth-child(1) .spec').innerText.split(', ');
        item.floor = specs[1];
        item.direction = specs[2];
    
        item.desc = itemNode.querySelector('.info_area .line:nth-child(2) .spec').innerText;
        item.realEstate = itemNode.querySelector('.agent_info:nth-child(2) .agent_name').innerText;
        item.date = itemNode.querySelector('.label_area .label .data').innerText;
    
        let key = item.desc;
        if (!items.has(key)) {
            items.set(key, item);
            dirty = true;
        }

        console.error(JSON.stringify(item));
    });
}

const disconnect = VM.observe(document.body, () => {
    observeItems();
    if (dirty) {
        observeMainTitle();
        dirty = false;
    }
  });
  
// You can also disconnect the observer explicitly when it's not used any more
//disconnect();

