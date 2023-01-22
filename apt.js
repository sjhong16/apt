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
        this.type = "";
        this.price = "";
        this.monthly = "";
        this.dong = "";
        this.floor = "";
        this.direction = "";
        this.area = "";
        this.desc = "";
        this.realEstate = "";
        this.date = "";
    }

    key() {
        return this.desc + this.floor + this.realEstate + this.price;
    }
}

let curentApt = "";
let items = new Map();
let dirty = false;

function observeMainTitle() {
    let title = document.querySelectorAll('#complexTitle').innerText;
    console.error("title:" + title);
    
    if (title) {
        if (curentApt !== title) {
            curentApt = title;
            console.error("curentApt:" + curentApt);
            items.clear();
        }
    }
}

// 각각의 매물을 감시한다.
function observeItems() {
    let itemNodes = document.querySelectorAll('.item_list .item');
    if (!itemNodes) {
        return;
    }

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
        item.area = specs[0];
        item.floor = specs[1];
        item.direction = specs[2];
    
        item.desc = itemNode.querySelector('.info_area .line:nth-child(2) .spec').innerText;
        item.realEstate = itemNode.querySelector('.agent_info:nth-child(2) .agent_name').innerText;
        item.date = itemNode.querySelector('.label_area .label .data').innerText;
    
        let key = item.key();
        if (!items.has(key)) {
            items.set(key, item);
            dirty = true;
        }
    });
    
    console.error(JSON.stringify(items.size));
}

function printSummary() {
    const $node = $('.list_complex_info .complex_price_wrap');
    if (!$node) {
        return;
    }

    let prev = $node.find("#plugin_summary");
    if (prev) {
        prev.remove();
    }

    let tsv = "날자\t타입\t가격\t월세\t동\t층\t면적\t방향\t설명\t부동산\n";
    let summary = '<table id="#plugin_summary" border="1" style="clear:both">';
    summary += '<tr>'
            + '<td>날자</td>'
            + '<td>타입</td>'
            + '<td>가격</td>'
            + '<td>월세</td>'
            + '<td>동</td>'
            + '<td>층</td>'
            + '<td>면적</td>'
            + '<td>방향</td>'
            + '<td>설명</td>'
            + '<td>부동산</td>'
            + '</tr>';
            
    items.forEach((item) => {
        summary += `<tr>`
                 + `<td>${item.date}</td>`
                 + `<td>${item.type}</td>`
                 + `<td>${item.price}</td>`
                 + `<td>${item.monthly}</td>`
                 + `<td>${item.dong}</td>`
                 + `<td>${item.floor}</td>`
                 + `<td>${item.area}</td>`
                 + `<td>${item.direction}</td>`
                 + `<td>${item.desc}</td>`
                 + `<td>${item.realEstate}</td>`
                 + `</tr>`;

        tsv += `${item.date}\t`
            + `${item.type}\t`
            + `${item.price}\t`
            + `${item.monthly}\t`
            + `${item.dong}\t`
            + `${item.floor}\t`
            + `${item.area}\t`
            + `${item.direction}\t`
            + `${item.desc}\t`
            + `${item.realEstate}\t`
            + `\n`;
    })

    summary += '</table>';
    //$node.prepend(summary);    

    console.error(`curentApt:${curentApt}`);

    $('#complexTitle').click(function () {
        let filename = `${curentApt}.tsv`;
        downloadCSV(tsv, filename);
    });

    dirty = false;
}

function downloadCSV(csv, filename) {
    var csvFile;
    var downloadLink;
  
    //const BOM = "\uFEFF";
    //csv = BOM + csv;
  
    csvFile = new Blob([csv], { type: "text/tsv" });
    downloadLink = document.createElement("a");
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
}

const disconnect = VM.observe(document.body, () => {
    observeMainTitle();
    observeItems();
    if (dirty) {
        printSummary();
    }
  });
  
// You can also disconnect the observer explicitly when it's not used any more
//disconnect();

