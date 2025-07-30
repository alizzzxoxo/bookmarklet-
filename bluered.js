javascript:(function(){
try {
// ====== 導師卡處理 ======
var choiceLabels = ['【首選】','【次選】','【三選】'];
var root = document.getElementById('tutor_sms_form_info');
var foundTutor = false, result = '';
if (root) {
  var rows = root.querySelectorAll('.row.mb-3');
  if (rows.length > 0) {
    var results = [];
    for (var ri = 0; ri < rows.length; ri++) {
      var cols = rows[ri].querySelectorAll('.col-4');
      for (var ci = 0; ci < cols.length; ci++) {
        var txt = cols[ci].innerText.trim();
        // 抓導師編號
        var tutorId = (txt.match(/導師編號：(\d+)/) || [])[1] || '';
        // 抓 "首堂時間:" 到下一個換行
        var firstLessonMatch = txt.match(/首堂時間:\s*([\s\S]*)/);
        var firstLessonBlock = firstLessonMatch ? firstLessonMatch[1].trim() : '';
        if (firstLessonBlock.indexOf('其他提問:') !== -1) {
          firstLessonBlock = firstLessonBlock.split('其他提問:')[0].trim();
        }
        // 抓 其他提問
        var questionMatch = txt.match(/其他提問:\s*["“]?([\s\S]*?)["”]?(?:$|\n)/);
        var question = questionMatch ? questionMatch[1].replace(/\s+/g,' ').trim() : '';
        var showQuestion = !!question && !/^n[\/a\.]*$/i.test(question);
        // 狀態判別
        if (/未回覆/.test(firstLessonBlock)) {
          results.push(
            (choiceLabels[ci]||'') + '導師編號：' + tutorId + '\n【未回覆時間】'
          );
        } else if (/導師另外提供時間|導師另外提供時間：|導師另外提供時間:|導師另外提供時間\s*：?\s*/.test(txt) || /導師另外提供時間/.test(firstLessonBlock) || /導師另外提供時間/.test(txt)) {
          var timeArr = [];
          var arrMatch = txt.match(/\[([^\]]+)\]/);
          if (arrMatch) {
            var arrStr = arrMatch[1]
              .replace(/['"]/g, '')
              .split(',')
              .map(function(s){return s.trim();})
              .filter(function(s){return s;});
            timeArr = arrStr;
          } else {
            var lines = txt.split('\n');
            for (var l=0; l<lines.length; l++) {
              if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(lines[l].trim())) timeArr.push(lines[l].trim());
            }
          }
          results.push(
            (choiceLabels[ci]||'') + '導師編號：' + tutorId +
            '\n家長提供的時間不方便，導師另外提供時間：\n' +
            (timeArr.length ? timeArr.join('\n') : '') +
            (showQuestion ? '\n導師提問：' + question : '')
          );
        } else if (firstLessonBlock.match(/\[.*\]/)) {
          var timesMatch = firstLessonBlock.match(/\[([^\]]+)\]/);
          var timeList = [];
          if (timesMatch) {
            var arr = timesMatch[1].replace(/['"]/g,'').split(',');
            arr.forEach(function(t){
              t = t.trim();
              if (t) timeList.push('【'+t+'】');
            });
          }
          results.push(
            (choiceLabels[ci]||'') + '導師編號：' + tutorId +
            '\n已選擇你提供的時間：\n' +
            (timeList.length ? timeList.join('\n') : '') +
            (showQuestion ? '\n導師提問：' + question : '')
          );
        }
      }
    }
    result = results.join('\n\n----------------------------\n\n');
    foundTutor = !!result.trim();
  }
}
if (foundTutor) {
  copyToClipboard(result, true); // 導師卡一律提示
  return;
}

// ====== 「沒有合適導師」彈窗處理 ======
var div = document.getElementById('student_sms_form_info');
if (!div) {alert('找不到 student_sms_form_info 區塊'); return;}
var spans = div.querySelectorAll('span');
var noTutorDate = "", noTutorTime = "", reasonText = "";
for (var i = 0; i < spans.length; i++) {
  var txt = spans[i].textContent || "";
  var match = txt.match(/^沒有合適導師\(時間:\s*([0-9]{4}-[0-9]{2}-[0-9]{2}) ([0-9]{2}:[0-9]{2}:[0-9]{2})\s*\)$/);
  if (match) {
    noTutorDate = match[1];
    noTutorTime = match[2];
  }
  if (txt.startsWith("沒有合適導師原因:")) {
    if (i+1 < spans.length) reasonText = spans[i+1].textContent.trim();
  }
}
if (!noTutorDate || !noTutorTime || !reasonText) {
  alert('找不到所需資訊');
  return;
}
// 抓個案編號
var caseNum = '';
var caseDiv = document.getElementById('case_detail');
if (caseDiv) {
  var caseHTML = caseDiv.innerHTML;
  var matchCase = caseHTML.match(/\[個案編號：\s*(\d+)\]/);
  if (matchCase) {
    caseNum = matchCase[1];
  }
}

// 格式化時間
function formatTime(d, t) {
  var mm = d.split('-')[1].replace(/^0/,'');
  var dd = d.split('-')[2].replace(/^0/,'');
  var hhmm = t.split(':')[0] + ':' + t.split(':')[1];
  return mm+'月'+dd+'日 '+hhmm;
}
var formattedTime = formatTime(noTutorDate, noTutorTime);

// 原始複製內容
var copyText = 
  (caseNum ? '[個案編號： '+caseNum+']\n':'') +
  "沒有合適導師【時間：" + noTutorDate + " , " + noTutorTime + "】\n不合適原因：【" + reasonText + "】";
copyToClipboard(copyText, false);

// ========== 處理 onlyReason：去除「其他 - 」「履歷不合 - 」等前綴 ==========
var onlyReason = reasonText;
var match = onlyReason.match(/^(其他|履歷不合)\s*-\s*(.+)$/);
if (match) {
  onlyReason = match[2].trim();
} else if (onlyReason.includes('-')) {
  onlyReason = onlyReason.split('-').slice(1).join('-').trim();
}
if (onlyReason.startsWith('不合適原因：')) {
  onlyReason = onlyReason.replace(/^不合適原因：/, '').trim();
}

// ====== 彈窗UI ======
(function(){
  document.querySelectorAll('#noTutorPopup').forEach(function(e){e.remove();});
  // 主要判斷
  var reasonTip = "";
  if (/學費太高/.test(reasonText)) {
    reasonTip = "【提示】學費太高：按[更新]自動修改學費及提交";
  } else if (/不能面授|只接受面授|不接受視像/.test(reasonText)) {
    reasonTip = "【提示】不能面授：按[更新]自動填「不接受視像」及提交";
  } else {
    reasonTip = "【提示】[更新]只會將原因填入要求，請自行檢查";
  }

  var popup = document.createElement('div');
  popup.id = 'noTutorPopup';
  popup.innerHTML =
    '<div style="font-size:17px;margin-bottom:12px;">'
    + (caseNum ? 'CaseID: <b>'+caseNum+'</b><br>' : '')
    + '時間：<b>'+formattedTime+'</b><br>'
    + '原因：<span id="reasonText">'+onlyReason+'</span><br>'
    + '<span style="color:#888;font-size:14px;">'+reasonTip+'</span>'
    + '</div>'
    + '<button id="btnGender" style="margin-right:10px;">性別</button>'
    + '<button id="btnEdit" style="margin-right:10px;">編輯原因</button>'
    + '<button id="btnUpdate" style="margin-right:10px;">更新</button>'
    + '<span id="closeNoTutorPopup" style="float:right;cursor:pointer;font-size:16px;">❌</span>';
  Object.assign(popup.style, {
    position: 'fixed',
    top: '16px',
    right: '16px',
    left: 'auto',
    background:'#fff',
    border:'2px solid #888',
    padding:'24px',
    zIndex:99999,
    borderRadius:'12px',
    boxShadow:'0 6px 32px #0003',
    minWidth:'340px'
  });
  document.body.appendChild(popup);

  // 關閉
  function closePopup() {
    popup.remove();
  }
  document.getElementById('closeNoTutorPopup').onclick = closePopup;

  // =========== 性別按鈕 ==========
  document.getElementById('btnGender').onclick = function(){
    var reason = document.getElementById('reasonText').textContent;
    var femaleKeywords = ["女導師","女補習老師","女老師","女生"];
    var maleKeywords = ["男導師","男補習老師","男老師","男生"];
    var excludeKeywords = ["不要女生","不要女導師","唔要女生","不要男導師","不要男老師","唔要男導師","唔要男老師","唔要女老師"];
    var r = reason.replace(/\s/g, "");
    for (var i=0; i<excludeKeywords.length; i++) {
      if (r.includes(excludeKeywords[i])) {
        alert('原因提及「'+excludeKeywords[i]+'」，不自動處理，請手動設定性別要求。');
        return;
      }
    }
    for (var i=0; i<femaleKeywords.length; i++) {
      if (r.includes(femaleKeywords[i])) {
        clickGenderBtn('女導師');
        return;
      }
    }
    for (var i=0; i<maleKeywords.length; i++) {
      if (r.includes(maleKeywords[i])) {
        clickGenderBtn('男導師');
        return;
      }
    }
    var sel = prompt('無法自動判斷，請輸入「女」或「男」：','');
    if(sel && sel.indexOf('女')!==-1) clickGenderBtn('女導師');
    else if(sel && sel.indexOf('男')!==-1) clickGenderBtn('男導師');
    else alert('未處理性別，請手動操作。');
  };

  // clickGenderBtn：避免重覆
  function clickGenderBtn(gender) {
    var reqInput = document.getElementById('requirements') || document.querySelector('input[name="requirements"]');
    var val = reqInput ? reqInput.value || '' : '';
    if(val.indexOf(gender) !== -1) {
      alert('已存在「'+gender+'」相關設定，無需重複加入。');
      return;
    }
    var btn = Array.from(document.querySelectorAll('button')).find(function(b){
      return b.onclick && (b.outerHTML.includes("requirementsTemplate('"+gender+"'") || b.outerHTML.includes("requirementsTemplate(&#39;"+gender+"&#39;"));
    });
    if(btn) {
      btn.click();
      setTimeout(function(){
        var reqInput2 = document.getElementById('requirements') || document.querySelector('input[name="requirements"]');
        if(reqInput2) {
          reqInput2.focus();
          var event = new KeyboardEvent('keydown', {key:'Enter', keyCode:13, which:13, bubbles:true});
          reqInput2.dispatchEvent(event);
          reqInput2.blur();
          alert('已自動加入「'+gender+'」並提交');
        } else {
          alert('已點擊「'+gender+'」按鈕，但找不到 requirements input，請手動送出');
        }
      }, 300);
    } else {
      alert('找不到「'+gender+'」按鈕，請手動處理');
    }
  }

  // 編輯原因
  document.getElementById('btnEdit').onclick = function(){
    var old = document.getElementById('reasonText').textContent;
    var edited = prompt('請修改不合適原因：', old);
    if (edited !== null) {
      document.getElementById('reasonText').textContent = edited.trim();
    }
  };

  // =========== 更新原因 ===========
  document.getElementById('btnUpdate').onclick = function(){
    var reason = document.getElementById('reasonText').textContent.trim();
    if(!reason) { alert('原因不可為空'); return; }

    // 1. 學費太高
    if(/學費太高/.test(reasonText)){
      var feeMatch = reasonText.match(/理想學費\s*\$?(\d+)/);
      if(!feeMatch){
        alert('找不到理想學費數字，請手動處理');
        return;
      }
      var idealFee = feeMatch[1];
      var feeInput = document.querySelector('input[name="tutorial_fee"]');
      if(!feeInput){
        alert('找不到 tutorial_fee 輸入欄');
        return;
      }
      var val = feeInput.value||"";
      var arr = val.split(';').map(function(s){return s.trim();}).filter(Boolean);
      // 如果已經有這個理想學費
      if(arr.indexOf(idealFee)!==-1){
        alert('理想學費 '+idealFee+' 已存在，未有更新');
        return;
      }
      // 如果原本有內容，需合併並排序
      if(arr.length>0){
        arr.push(idealFee);
        arr = Array.from(new Set(arr)).sort(function(a,b){return Number(a)-Number(b);});
        feeInput.value = arr.join(';');
      } else {
        feeInput.value = idealFee;
      }
      feeInput.focus();
      var event = new KeyboardEvent('keydown', {key:'Enter', keyCode:13, which:13, bubbles:true});
      feeInput.dispatchEvent(event);
      feeInput.blur();
      alert('已自動填寫理想學費 '+feeInput.value+' 並提交');
      return;
    }

    // 2. 不能面授
    if(/不能面授|只接受面授|不接受視像/.test(reasonText)){
      var input = document.querySelector('input[name="requirementOther"]');
      if(!input){ alert('找不到 requirementOther 輸入欄'); return; }
      var newContent = "【不接受視像】";
      // 只要有「不接受視像」四字就不再加入
      if(input.value.indexOf("不接受視像")!==-1){
        alert('已存在「不接受視像」紀錄，未有更新');
        return;
      }
      if(input.value.trim() !== "") {
        newContent = '；' + newContent;
      }
      input.value += newContent;
      input.focus();
      var event2 = new KeyboardEvent('keydown', {key:'Enter', keyCode:13, which:13, bubbles:true});
      input.dispatchEvent(event2);
      input.blur();
      alert('已自動填寫「【不接受視像】」並提交');
      return;
    }

    // 3/4. 履歷不合/其他
    var input = document.querySelector('input[name="requirementOther"]');
    if(!input){ alert('找不到 requirementOther 輸入欄'); return; }
    var newContent = reason;
    if(input.value.trim() !== "") {
      newContent = '；' + newContent;
    }
    if(input.value.indexOf(newContent)!==-1){
      alert('已存在相同原因，未有更新');
      return;
    }
    input.value += newContent;
    input.focus();
    var event3 = new KeyboardEvent('keydown', {key:'Enter', keyCode:13, which:13, bubbles:true});
    input.dispatchEvent(event3);
    input.blur();
    alert('已更新原因並提交');
  };
})();
  
function copyToClipboard(text, alertOnSuccess) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(function(){
      if(alertOnSuccess) alert('資料已複製！');
    }, function(){
      fallbackCopy(text, alertOnSuccess);
    });
  } else {
    fallbackCopy(text, alertOnSuccess);
  }
  function fallbackCopy(text, alertOnSuccess){
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly','');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try{
      var ok = document.execCommand('copy');
      if(alertOnSuccess) alert('資料已複製！');
    }catch(e){
      prompt('自動複製失敗，請手動複製：', text);
    }
    document.body.removeChild(ta);
  }
}
} catch(e){
alert('錯誤：'+e);
}
})();
