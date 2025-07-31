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
        var tutorId = (txt.match(/導師編號：(\d+)/) || [])[1] || '';
        var firstLessonMatch = txt.match(/首堂時間:\s*([\s\S]*)/);
        var firstLessonBlock = firstLessonMatch ? firstLessonMatch[1].trim() : '';
        if (firstLessonBlock.indexOf('其他提問:') !== -1) {
          firstLessonBlock = firstLessonBlock.split('其他提問:')[0].trim();
        }
        var questionMatch = txt.match(/其他提問:\s*["“]?([\s\S]*?)["”]?(?:$|\n)/);
        var question = questionMatch ? questionMatch[1].replace(/\s+/g,' ').trim() : '';
        var showQuestion = !!question && !/^n[\/a\.]*$/i.test(question);
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

// ====== 只保留最終資訊 ======
var onlyReason = reasonText.trim();
var match = onlyReason.match(/^(其他|履歷不合)\s*-\s*(.+)$/);
if (match) onlyReason = match[2].trim();
if (onlyReason.startsWith('心儀履歷')) onlyReason = onlyReason.replace(/^心儀履歷\s*/,'');
if (onlyReason.includes('-')) onlyReason = onlyReason.split('-').slice(1).join('-').trim();
if (onlyReason.startsWith('不合適原因：')) onlyReason = onlyReason.replace(/^不合適原因：/, '').trim();

// ====== 極簡美化彈窗UI ======
(function(){
  document.querySelectorAll('#noTutorPopup').forEach(function(e){e.remove();});

  var reasonTip = "【更新】會自動更新學費、不能面授要求<br>學歷、其他請自行檢查或編輯後再點擊【更新】";

  var popup = document.createElement('div');
  popup.id = 'noTutorPopup';
  popup.innerHTML =
    `<div class="ntp-header">
      <span class="ntp-title">沒有合適導師</span>
      <span id="closeNoTutorPopup" class="ntp-close">✕</span>
    </div>
    <div class="ntp-block">
      ${caseNum ? '<div class="ntp-caseid">CaseID: <b>'+caseNum+'</b></div>' : ''}
      <div class="ntp-time">時間：<b>${formattedTime}</b></div>
    </div>
    <div class="ntp-block">
      <div class="ntp-reason-label">原因：</div>
      <div class="ntp-reason"><span id="reasonText">${onlyReason}</span></div>
    </div>
    <div class="ntp-tip">${reasonTip}</div>
    <div class="ntp-btn-row">
      <button id="btnGender" class="ntp-btn">性別</button>
      <button id="btnEdit" class="ntp-btn">編輯原因</button>
      <button id="btnUpdate" class="ntp-btn ntp-btn-main">更新</button>
    </div>`;

  popup.style.cssText = `
    position:fixed;top:20px;right:20px;z-index:99999;
    background: #fff;
    border: 1.5px solid #e0e0e0;
    border-radius: 15px;
    box-shadow: 0 4px 24px #0001;
    padding: 20px 18px 14px 18px;
    min-width: 280px;max-width:90vw;
    font-family: system-ui,sans-serif;
    font-size: 16px;
    color: #31313a;
    box-sizing: border-box;
  `;

  if (!document.getElementById('noTutorPopupStyle')) {
    var style = document.createElement('style');
    style.id = 'noTutorPopupStyle';
    style.innerHTML = `
      #noTutorPopup .ntp-header {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 8px;
      }
      #noTutorPopup .ntp-title {
        font-size: 18px; font-weight: 600; letter-spacing: 1px;
        color: #666;
      }
      #noTutorPopup .ntp-close {
        cursor: pointer; font-size: 20px; color: #bdbdbd; transition: color 0.16s;
      }
      #noTutorPopup .ntp-close:hover { color: #888; }
      #noTutorPopup .ntp-caseid,
      #noTutorPopup .ntp-time {
        font-size: 14.2px; color: #444; margin-bottom: 2px;
      }
      #noTutorPopup .ntp-block { margin-bottom: 10px;}
      #noTutorPopup .ntp-reason-label {
        display: inline-block; font-weight: 500; color: #888; margin-right: 3px;
      }
      #noTutorPopup .ntp-reason {
        display: inline-block; font-size: 15.2px; color: #222;
        background: #f8f8fa; padding: 3px 8px; border-radius: 6px;
        margin-left: 1px;
      }
      #noTutorPopup .ntp-tip {
        font-size: 13px; color: #7b7b7b; margin-bottom: 12px; margin-top: 1px;
        background: #f3f3f3; border-radius: 5px; padding: 5px 7px;
        line-height: 1.6; letter-spacing: 0.3px;
      }
      #noTutorPopup .ntp-btn-row {
        display: flex; flex-wrap: wrap;
        gap: 8px; justify-content: flex-end;
      }
      #noTutorPopup .ntp-btn {
        border: 1.2px solid #e0e0e0; background: #fafbfc;
        color: #444; border-radius: 7px;
        font-size: 14.2px; font-weight: 500; cursor: pointer;
        padding: 6px 17px; box-shadow: 0 1px 3px #0001;
        transition: background .18s, color .18s, border .18s;
        margin-bottom: 2px;
      }
      #noTutorPopup .ntp-btn:hover {
        background: #ececec; color: #222; border-color: #bdbdbd;
      }
      #noTutorPopup .ntp-btn-main {
        background: #f4eacb; color: #9c7b14; border-color: #e6dab6;
      }
      #noTutorPopup .ntp-btn-main:hover {
        background: #f3e09d; color: #6a4b00; border-color: #dfc871;
      }
      @media (max-width: 600px) {
        #noTutorPopup {
          left: 5vw !important; right: 5vw !important; min-width: 0 !important; max-width: 90vw !important; padding: 10px 3vw 8px 3vw !important;
        }
        #noTutorPopup .ntp-btn-row {
          flex-direction: column; align-items: stretch; gap: 6px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(popup);

  function closePopup() { popup.remove(); }
  document.getElementById('closeNoTutorPopup').onclick = closePopup;

  // ===== 事件邏輯與原本相同 =====
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
          var updateBtn = document.getElementById('case_info_update');
          if(updateBtn){
            updateBtn.click();
            alert('已自動加入「'+gender+'」並提交（已點擊更新）');
          }else{
            alert('已點擊「'+gender+'」按鈕，但找不到更新按鈕，請手動送出');
          }
        } else {
          alert('已點擊「'+gender+'」按鈕，但找不到 requirements input，請手動送出');
        }
      }, 300);
    } else {
      alert('找不到「'+gender+'」按鈕，請手動處理');
    }
  }

  document.getElementById('btnEdit').onclick = function(){
    var old = document.getElementById('reasonText').textContent;
    var edited = prompt('請修改不合適原因：', old);
    if (edited !== null) {
      document.getElementById('reasonText').textContent = edited.trim();
    }
  };

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
      var idealFee = parseInt(feeMatch[1],10);
      var feeInput = document.querySelector('input[name="tutorial_fee"]');
      if(!feeInput){
        alert('找不到 tutorial_fee 輸入欄');
        return;
      }
      var val = feeInput.value.trim();
      var arr = val.split(';').map(function(s){return parseInt(s.trim(),10);}).filter(function(n){return !isNaN(n);});
      if(arr.length===0){
        feeInput.value = idealFee;
      }else{
        arr = arr.sort(function(a,b){return a-b;});
        var min = arr[0];
        if(min > idealFee){
          feeInput.value = idealFee;
        }
        else if(arr.length===2 && min===idealFee){
          alert('理想學費已包含於範圍，未有更新');
          return;
        }
        else{
          var rangeArr = [min, idealFee];
          rangeArr = Array.from(new Set(rangeArr)).sort(function(a,b){return a-b;});
          feeInput.value = rangeArr.join(';');
        }
      }
      feeInput.focus();
      var updateBtn1 = document.getElementById('case_info_update');
      if(updateBtn1){
        updateBtn1.click();
        alert('已自動填寫理想學費 '+feeInput.value+' 並點擊更新');
      }else{
        alert('已自動填寫理想學費 '+feeInput.value+'，但找不到更新按鈕，請手動送出');
      }
      return;
    }

    // 2. 不能面授
    if(/不能面授|只接受面授|不接受視像/.test(reasonText)){
      var input = document.querySelector('input[name="requirementOther"]');
      if(!input){ alert('找不到 requirementOther 輸入欄'); return; }
      var newContent = "【不接受視像】";
      if(input.value.indexOf("不接受視像")!==-1){
        alert('已存在「不接受視像」紀錄，未有更新');
        return;
      }
      if(input.value.trim() !== "") {
        newContent = '；' + newContent;
      }
      input.value += newContent;
      input.focus();
      var updateBtn2 = document.getElementById('case_info_update');
      if(updateBtn2){
        updateBtn2.click();
        alert('已自動填寫「【不接受視像】」並點擊更新');
      }else{
        alert('已自動填寫「【不接受視像】」，但找不到更新按鈕，請手動送出');
      }
      return;
    }

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
    var updateBtn3 = document.getElementById('case_info_update');
    if(updateBtn3){
      updateBtn3.click();
      alert('已更新原因並點擊更新');
    }else{
      alert('已更新原因，但找不到更新按鈕，請手動送出');
    }
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
