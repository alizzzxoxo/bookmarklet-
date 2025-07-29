javascript:(function(){
  try {
    var choiceLabels = ['【首選】','【次選】','【三選】'];
    var root = document.getElementById('tutor_sms_form_info');
    if (root) {
      var rows = root.querySelectorAll('.row.mb-3');
      for (var ri = 0; ri < rows.length; ri++) {
        var cols = rows[ri].querySelectorAll('.col-4');
        if (cols.length > 0) {
          var results = [];
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
              // 未回覆
              results.push(
                (choiceLabels[ci]||'') + '導師編號：' + tutorId + '\n【未回覆時間】'
              );
            } else if (/導師另外提供時間|導師另外提供時間：|導師另外提供時間:|導師另外提供時間\s*：?\s*/.test(txt) || /導師另外提供時間/.test(firstLessonBlock) || /導師另外提供時間/.test(txt)) {
              // 額外提供時間
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
                // 有些是每行一個時間
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
              // 選擇你提供的時間
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
          var result = results.join('\n\n----------------------------\n\n');
          if (!result) {
            alert('找不到任何導師資料');
            return;
          }
          // 複製到剪貼簿
          if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(result).then(function(){
              alert('導師資料已複製！');
            }, function(){
              fallbackCopy(result);
            });
          } else {
            fallbackCopy(result);
          }
          function fallbackCopy(text){
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly','');
            ta.style.position = 'absolute';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            try{
              document.execCommand('copy');
              alert('導師資料已複製！');
            }catch(e){
              prompt('自動複製失敗，請手動複製：', text);
            }
            document.body.removeChild(ta);
          }
          return;
        }
      }
    }
    alert('找不到任何導師資料');
  } catch(e){
    alert('錯誤：'+e);
  }
})();
