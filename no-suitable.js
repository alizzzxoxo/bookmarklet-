javascript:(function(){
  try {
    var div = document.getElementById('student_sms_form_info');
    if (!div) {alert('找不到 student_sms_form_info 區塊'); return;}
    var spans = div.querySelectorAll('span');
    var noTutorTime = "", reasonText = "";
    // 取出「沒有合適導師(時間: ... )」裡面的時間
    for (var i = 0; i < spans.length; i++) {
      var txt = spans[i].textContent || "";
      var match = txt.match(/^沒有合適導師\(時間:\s*([0-9\-:\s]+)\)$/);
      if (match) {
        // 將時間中的半形逗號換為全形逗號（如果有）
        var time = match[1].trim().replace(/ /, "，");
        noTutorTime = time;
      }
      // 找「沒有合適導師原因:」的下一個 span
      if (txt.startsWith("沒有合適導師原因:")) {
        if (i+1 < spans.length) reasonText = spans[i+1].textContent.trim();
      }
    }
    if (!noTutorTime || !reasonText) {
      alert('找不到所需資訊');
      return;
    }
    var result = "沒有合適導師【時間: " + noTutorTime + "】\n不合適原因： " + reasonText;

    // 優先 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(result).catch(function(){
        manualCopy(result);
      });
    } else {
      manualCopy(result);
    }

    function manualCopy(text) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        var ok = document.execCommand('copy');
        if (!ok) throw new Error();
      } catch(e) {
        prompt('自動複製失敗，請手動複製：', text);
      }
      document.body.removeChild(ta);
    }
  } catch(e) {
    alert('錯誤：' + e);
  }
})();
