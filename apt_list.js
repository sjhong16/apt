// ==UserScript==
// @name        NAVER 부동산 매물 리스트
// @namespace   Violentmonkey Scripts
// @match       https://new.land.naver.com/complexes*
// @version     0.1.3
// @author      Buhong
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
        this.realCount = "";
        this.date = "";
    }

    key() {
        return this.desc + this.floor + this.realEstate + this.price;
    }
}

let curentApt = "";
let items = new Map();
let dirty = false;

// 아파트 이름 감시
function observeMainTitle() {
    let title = $('#complexTitle')[0].innerText;
    if (title) {
        if (curentApt !== title) {
            curentApt = title;
            items.clear();
        }
    }
}

// 각각의 매물을 감시한다.
function observeItems() {
    let itemNodes = document.querySelectorAll('.item_list .item');
    if (!itemNodes) {
        console.log(`no item node`);
        return;
    }
    console.log(`item count: ${itemNodes.length}`);

    itemNodes.forEach(itemNode => {
        try {
            let item = new Item();
            item.type = getInnerText(itemNode, '.price_line .type');
            item.dong = getInnerText(itemNode, '.item_title .text').split(' ')[1];
        
            let price = getInnerText(itemNode, '.price_line .price');
            let prices = price.split("/");
            item.price = prices[0];
            if (prices.length > 1) {
                item.monthly = prices[1];
            } else {
                item.monthly = "";
            }
        
            let specs = getInnerText(itemNode, '.info_area .line:nth-child(1) .spec').split(', ');
            item.area = specs[0];
            item.floor = specs[1];
            item.direction = specs[2];
        
            item.desc = getInnerText(itemNode, '.info_area .line:nth-child(2) .spec');
            item.realEstate = getInnerText(itemNode, '.agent_info:nth-child(2) .agent_name');
            item.realCount = getInnerText(itemNode, '.label_area .label .count');
            item.date = getInnerText(itemNode, '.label_area .label .data');

            if (item.date === '') {
                return;
            }
        
            let key = item.key();
            if (!items.has(key)) {
                items.set(key, item);
                dirty = true;
            }
        } catch(e) {
           console.error(e);
        }
    });

}
function getInnerText(itemNode, queryText) {
    try {
        return itemNode.querySelector(queryText).innerText;
    } catch (e) {
        return "";
    }
}

// tsv 파일 다운로드 만들기
function tsvDownload() {
    const $node = $('.list_complex_info .complex_price_wrap');
    if (!$node) {
        console.log(`no node`);
        return;
    }

    let tsv = "날짜\t타입\t가격\t월세\t동\t층\t면적\t방향\t설명\t부동산\t부동산수\n";
    items.forEach((item) => {
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
            + `${item.realCount}`
            + `\n`;
    })

    $('#complexTitle').off("click");
    $('#complexTitle').on("click", function() {
        let filename = `${curentApt}.tsv`;
        downloadtsv(tsv, filename);
    });

    dirty = false;
}

function downloadtsv(text, filename) {
    let tsvFile;
    let downloadLink;  

    const BOM = "\uFEFF";
    text = BOM + text;

    tsvFile = new Blob([text], { type: "text/tsv" });
    downloadLink = document.createElement("a");
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(tsvFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
}

const disconnect = VM.observe(document.body, () => {
    observeMainTitle();
    observeItems();
    if (dirty) {
        tsvDownload();
    }
  });
  
// You can also disconnect the observer explicitly when it's not used any more
//disconnect();
