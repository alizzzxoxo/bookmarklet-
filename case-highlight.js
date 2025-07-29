javascript:(function(){
  // ==== 你可以在這裡自訂科目對應代號 ====
  var subjectMap = {
    "中文": "C",
    "英文": "E",
    "數學": "M",
    "功課": "HW",
    "全科": "A",
    "物理": "P",
    "化學": "Chem",
    "生物": "Bio",
    "地理": "G",
    "經濟": "Ec",
    "會計": "Ac",
    "M1": "M1",
    "M2": "M2",
    "資訊及通訊科技": "ICT",
    "西史": "WHis",
    "中史": "CHis",
    "普通話": "PTH",
    "綜合科學": "IS",
    "廣東話": "CT",
    "旅遊與款待": "旅款",
    "升學面試課": "面試",
    "中國文學": "CL",
    "英國文學": "EL",
    "日語": "JP"
    // ...可自行添加
  };

  // 取得所有case row
  var rows = Array.from(document.querySelectorAll('table tr')).filter(function(tr){
    return tr.querySelector('a[href]');
  });

  // 解析所有case資料
  var cases = rows.map(function(tr){
    var tds = tr.querySelectorAll('td');
    var caseId = tr.querySelector('a[href]')?.textContent.trim();
    var subject = tds[6]?.textContent.trim() || ""; // 第7欄為科目
    var phone = tds[8]?.textContent.trim().replace(/\(\d+\)$/, '').replace(/，/g, ',').replace(/ /g,'') || ""; // 第9欄為電話
    return {
      caseId: caseId,
      row: tr,
      tds: tds,
      subject: subject,
      phone: phone
    };
  }).filter(function(c){return !!c.caseId;});

  if (!cases.length) { alert('找不到任何case'); return; }

  // 輸入caseID
  var inputId = prompt('請輸入case ID');
  if (!inputId) return;
  var idx = cases.findIndex(function(c){ return c.caseId == inputId; });
  if (idx === -1) { alert('找不到case ID: '+inputId); return; }

  // 先定義 highlight 樣式（#99CCFF亮藍色）
  var styleId = '__case_highlight_style__';
  document.getElementById(styleId)?.remove();
  var style = document.createElement('style');
  style.id = styleId;
  style.innerHTML = `
    .case-row-highlight-bookmarklet, .case-td-highlight-bookmarklet {
      background: #99CCFF !important;
      transition: background 0.4s, box-shadow 0.3s;
    }
    .case-td-highlight-bookmarklet {
      box-shadow: 0 0 0 2px #99CCFF !important;
      position: relative !important; 
      z-index: 2 !important;
    }
  `;
  document.head.appendChild(style);

  function highlightRowAndTds(row, tds) {
    // 清除所有舊 highlight
    document.querySelectorAll('.case-row-highlight-bookmarklet').forEach(function(tr){
      tr.classList.remove('case-row-highlight-bookmarklet');
    });
    document.querySelectorAll('.case-td-highlight-bookmarklet').forEach(function(td){
      td.classList.remove('case-td-highlight-bookmarklet');
    });
    if(row){
      row.classList.add('case-row-highlight-bookmarklet');
    }
    if(tds){
      for(var i=0; i<tds.length; i++){
        tds[i].classList.add('case-td-highlight-bookmarklet');
      }
      // 滾動到可見
      tds[0]?.parentElement.scrollIntoView({behavior:'smooth', block:'center'});
    }
  }

  function showPopup(atIdx) {
    idx = atIdx;
    var c = cases[idx];
    // 科目轉代號，組合格式T201966C&E&M
    var codes = c.subject.split(/[,\s，]+/).map(function(s){
      s = s.trim();
      return subjectMap[s] || s;
    }).filter(Boolean);
    var caseCode = 'T'+c.caseId+(codes.length ? codes.join('&') : '');

    // 彈窗內容
    var html = ''
      + '<div style="font-size:18px;margin-bottom:10px;">'
      + 'CaseID: <b>'+c.caseId+'</b><br>'
      + '科目: <b>'+c.subject+'</b><br>'
      + '電話: <b>'+c.phone+'</b><br>'
      + '</div>'
      + '<button id="pre_case" style="margin-right:10px;">上一個</button>'
      + '<button id="next_case" style="margin-right:10px;">下一個</button>'
      + '<button id="copy_phone" style="margin-right:10px;">電話</button>'
      + '<button id="copy_casecode">個案編號</button>'
      + '<span style="float:right;cursor:pointer;font-size:16px;" id="close_popup">❌</span>'
      ;

    // 建立/刷新彈窗
    var popup = document.createElement('div');
    popup.id = 'case_popup_box';
    popup.innerHTML = html;
    Object.assign(popup.style, {
      position:'fixed',
      top:'16px',
      right:'16px',
      left:'auto',
      transform:'none',
      background:'#fff',
      border:'2px solid #888',
      padding:'24px',
      zIndex:99999,
      borderRadius:'12px',
      boxShadow:'0 6px 32px #0003',
      minWidth:'320px'
    });
    // 移除舊popup
    document.querySelectorAll('#case_popup_box').forEach(function(e){e.remove();});
    document.body.appendChild(popup);

    // 高亮當前 row 及所有 td
    highlightRowAndTds(c.row, c.tds);

    // 按鈕功能
    document.getElementById('pre_case').onclick = function(){
      if(idx>0) showPopup(idx-1);
    };
    document.getElementById('next_case').onclick = function(){
      if(idx<cases.length-1) showPopup(idx+1);
    };
    document.getElementById('copy_phone').onclick = function(){
      copyToClipboard(c.phone);
    };
    document.getElementById('copy_casecode').onclick = function(){
      copyToClipboard(caseCode);
    };
    document.getElementById('close_popup').onclick = function(){
      popup.remove();
      highlightRowAndTds(); // 移除高亮
    };
  }

  // 複製到剪貼簿
  function copyToClipboard(text){
    if(navigator.clipboard && window.isSecureContext){
      navigator.clipboard.writeText(text);
    }else{
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly','');
      ta.style.position='absolute';
      ta.style.left='-9999px';
      document.body.appendChild(ta);
      ta.select();
      try{document.execCommand('copy');}catch(e){prompt('請手動複製',text);}
      document.body.removeChild(ta);
    }
  }

  showPopup(idx);
})();
