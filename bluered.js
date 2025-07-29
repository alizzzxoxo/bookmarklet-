javascript:(function(){
  try {
    // 導師卡處理
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

    // fallback：沒有任何導師卡，自動複製「沒有合適導師」原因
    var div = document.getElementById('student_sms_form_info');
    if (!div) {alert('找不到 student_sms_form_info 區塊'); return;}
    var spans = div.querySelectorAll('span');
    var noTutorDate = "", noTutorTime = "", reasonText = "";
    for (var i = 0; i < spans.length; i++) {
      var txt = spans[i].textContent || "";
      // 「沒有合適導師(時間: 2025-07-29 03:04:36)」
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
      var matchCase = caseHTML.match(/\[個案編號：\s*\d+\]/);
      if (matchCase) {
        caseNum = matchCase[0];
      }
    }
    result = (caseNum?caseNum+'\n':'') + 
      "沒有合適導師【時間：" + noTutorDate + " , " + noTutorTime + "】\n不合適原因：【" + reasonText + "】";
    copyToClipboard(result, false);

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
