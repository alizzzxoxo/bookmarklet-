javascript:(function() {
  if (window.__tc_bookmarklet_active) return; // 避免重複載入
  window.__tc_bookmarklet_active = true;

  // ========== 設定區 ==========
  // 地區映射
  const nearbyMap = {
    "中環": ["中環","金鐘","上環","西營盤","半山","蘭桂坊"],
    "觀塘": ["觀塘","牛頭角","九龍灣","藍田"],
    "油麻地": ["油麻地","佐敦","旺角"],
    "沙田": ["沙田","大圍","火炭","馬鞍山"],
    // ...加入你需要的地區...
  };

  // 跳過配對狀態
  const skipStatus = [
    "沒有合適導師","學生已選導師","導師已回覆"
  ];

  // ========== 工具 ==========
  function createDiv(html, style) {
    const d = document.createElement('div');
    if (style) d.style = style;
    d.innerHTML = html;
    document.body.appendChild(d);
    return d;
  }
  function $(q, p) { return (p||document).querySelector(q); }
  function $$(q, p) { return Array.from((p||document).querySelectorAll(q)); }
  function copyToClipboard(txt) {
    navigator.clipboard.writeText(txt);
  }
  function nextCase(forward=true) {
    // 個案列表自動跳頁
    const rows = $$('#main-table tbody tr');
    if (!rows.length) return;
    let idx = -1;
    rows.forEach((row,i)=>{
      if (row.classList.contains('table-primary')) idx = i;
    });
    let next = idx;
    do {
      next = (forward ? next+1 : next-1 + rows.length) % rows.length;
      const status = rows[next].querySelector('td:nth-child(7)')?.textContent||'';
      const caseId = rows[next].querySelector('a[href*="case.php?id="]')?.href.match(/id=(\d+)/)?.[1];
      if (caseId && !skipStatus.some(s=>status.includes(s))) {
        location.href = `/panel/admin/cases_approve/case.php?id=${caseId}`;
        return;
      }
    } while (next!==idx);
    alert('已到頂/底或沒有更多個案');
  }
  function getPhone() {
    const phone = ($('td[data-target="phone"]')||$('td[data-phone]')||$('td.phone'))?.textContent?.trim();
    if (phone) prompt('電話號碼：',phone);
    else alert('找不到電話');
  }

  // ========== 個案列表頁 ==========
  if (/\/cases_approve\/?$/.test(location.pathname)) {
    // 浮動UI
    const bar = createDiv(`
      <div style="position:fixed;top:20px;right:20px;z-index:99999;background:#fff;border:2px solid #036;padding:8px 12px;border-radius:8px;font-size:16px;box-shadow:2px 2px 12px #0003;">
        <button id="tc_prev">上一個</button>
        <button id="tc_next">下一個</button>
        <button id="tc_phone">電話</button>
        <button id="tc_list">導師列表</button>
        <span style="font-size:13px;color:#888;">(TutorCircle+)</span>
      </div>
    `);
    $('#tc_prev',bar).onclick = ()=>nextCase(false);
    $('#tc_next',bar).onclick = ()=>nextCase(true);
    $('#tc_phone',bar).onclick = ()=>getPhone();
    $('#tc_list',bar).onclick = ()=>{
      // 開case詳情與導師頁
      const row = $$('.table-primary')[0] || $$('#main-table tbody tr')[0];
      const caseId = row?.querySelector('a[href*="case.php?id="]')?.href.match(/id=(\d+)/)?.[1];
      if (!caseId) return alert('找不到個案編號');
      window.open(`/panel/admin/cases_approve/case.php?id=${caseId}`,"_blank");
      window.open(`/panel/admin/cases_approve/completetutorlist_new.php?id=${caseId}`,"_blank");
    };
    return;
  }

  // ========== 個案詳情頁 ==========
  else if (/\/cases_approve\/case\.php\?id=(\d+)/.test(location.pathname+location.search)) {
    const caseDetail = $('#case_detail');
    if (!caseDetail) { alert('找不到#case_detail'); return; }
    // 抽取資料
    function extract() {
      const txt = caseDetail.textContent;
      const subject = txt.match(/科[目目]：?\s*([^\n]+)/)?.[1]||'';
      const fee = txt.match(/學費：?\s*([^\n]+)/)?.[1]||'';
      const area = txt.match(/地[點區]：?\s*([^\n]+)/)?.[1]||'';
      const special = txt.match(/特別要求：?\s*([^\n]+)/)?.[1]||'';
      return {subject, fee, area, special};
    }
    // UI
    const ui = createDiv(`
      <div style="position:fixed;top:20px;right:20px;z-index:99999;background:#fff;border:2px solid #036;padding:8px 12px;border-radius:8px;font-size:16px;box-shadow:2px 2px 12px #0003;">
        <button id="tc_copy">複製個案重點</button>
        <span style="font-size:13px;color:#888;">(TutorCircle+)</span>
      </div>
    `);
    $('#tc_copy',ui).onclick = ()=>{
      const {subject, fee, area, special} = extract();
      const out = `科目: ${subject}\n學費: ${fee}\n地點: ${area}\n特別要求: ${special}`;
      copyToClipboard(out);
      $('#tc_copy',ui).textContent = '已複製!';
      setTimeout(()=>{$('#tc_copy',ui).textContent='複製個案重點';}, 1500);
    };
    return;
  }

  // ========== 導師列表頁 ==========
  else if (/\/cases_approve\/completetutorlist_new\.php\?id=(\d+)/.test(location.pathname+location.search)) {
    // UI區
    const ui = createDiv(`
      <div id="tc_flt" style="position:fixed;top:20px;right:20px;z-index:99999;background:#fff;border:2px solid #036;padding:12px 16px 10px 16px;border-radius:12px;font-size:16px;min-width:260px;box-shadow:2px 2px 12px #0003;">
        <div style="margin-bottom:8px;">
          <textarea id="tc_paste" placeholder="請貼上個案資料（由[個案詳情]複製）" style="width:100%;height:70px;font-size:14px;"></textarea>
        </div>
        <button id="tc_submit">分析並篩選</button>
        <div id="tc_btns" style="margin-top:10px;display:none;">
          <button data-tc="fee" style="background:#eee;">[學費]</button>
          <button data-tc="area" style="background:#eee;">[地點]</button>
          <button data-tc="gender" style="background:#eee;">[性別]</button>
          <button data-tc="grade" style="background:#eee;">[成績]</button>
          <button data-tc="verify" style="background:#eee;">[驗證]</button>
          <button data-tc="fresh" style="background:#eee;">[應屆]</button>
          <button data-tc="exp" style="background:#eee;">[有經驗]</button>
          <button data-tc="spec" style="background:#eee;">[特殊要求]</button>
          <button data-tc="bad" style="background:#eee;">[差評導師]</button>
          <button data-tc="edit" style="background:#eee;">[編輯]</button>
        </div>
        <div id="tc_stat" style="margin-top:6px;font-size:13px;color:#666;"></div>
      </div>
    `);
    // 狀態
    let status = {
      fee: true, area: false, gender: false, grade: false, verify: false, fresh: true, exp: false, spec: false, bad: false
    }, caseData = {};
    // 解析個案資料
    function parseCase(txt) {
      const subject = txt.match(/科目:([^\n]+)/)?.[1]?.trim()||'';
      const fee = txt.match(/學費:([^\n]+)/)?.[1]?.trim()||'';
      const area = txt.match(/地點:([^\n]+)/)?.[1]?.trim()||'';
      const special = txt.match(/特別要求:([^\n]+)/)?.[1]?.trim()||'';
      // 性別
      let gender = '';
      if (/女導師/.test(special)) gender = '女';
      if (/男導師/.test(special)) gender = '男';
      // 成績
      let grade = '';
      if (/5\*\*/.test(special)||/五星星|5星星/.test(special)) grade = '5**';
      else if (/5\*/.test(special)||/五星|5星/.test(special)) grade = '5*';
      else if (/5以上/.test(special)) grade = '5+';
      else if (/4以上/.test(special)) grade = '4+';
      else if (/5/.test(special)) grade = '5';
      // 經驗
      let exp = /經驗|有經驗/.test(special);
      return {subject, fee, area, special, gender, grade, exp};
    }
    // 按鈕UI狀態同步
    function syncBtns() {
      $$('#tc_btns button',ui).forEach(btn=>{
        const t = btn.getAttribute('data-tc');
        btn.style.background = status[t] ? '#ccc' : '#eee';
        btn.style.color = status[t] ? '#222' : '#666';
      });
    }
    // 導師自動篩選
    function doFilter() {
      let shown = 0, total = 0;
      $$('.sentence').forEach(card=>{
        total++;
        let show = true;
        // 差評導師
        if (!status.bad && $('.remark-tag.badge-danger',card)) show = false;
        // 學費
        if (show && status.fee && caseData.fee) {
          const tutorFee = $('.tutor-response-fee',card)?.textContent.replace(/[^\d\-~]/g,'');
          const feeRange = caseData.fee.match(/\$?(\d+)\s*-\s*(\d+)/);
          if (feeRange && tutorFee) {
            const [_, min,max] = feeRange;
            const tf = parseInt(tutorFee);
            if (tf<parseInt(min)||tf>parseInt(max)) show=false;
          }
        }
        // 性別
        if (show && status.gender && caseData.gender) {
          const gender = $('.gender',card)?.textContent?.trim();
          if (gender && gender!==caseData.gender) show=false;
        }
        // 成績
        if (show && status.grade && caseData.grade) {
          const tscoreStr = $('.col-12.text-left',card)?.textContent||'';
          if (caseData.grade==='5**') {
            if (!/5\*\*/.test(tscoreStr)&&!/(五星星|5星星)/.test(tscoreStr)) show=false;
          } else if (caseData.grade==='5*') {
            if (!/5\*/.test(tscoreStr)&&!/(五星|5星)/.test(tscoreStr)) show=false;
          } else if (caseData.grade==='5+') {
            if (!/(5|5\*|5\*\*)/.test(tscoreStr)) show=false;
          } else if (caseData.grade==='4+') {
            if (!/(4|5|5\*|5\*\*)/.test(tscoreStr)) show=false;
          } else if (caseData.grade==='5') {
            if (!/5/.test(tscoreStr)) show=false;
          }
        }
        // 驗證
        if (show && status.verify) {
          const vtxt = $('.col-12.text-left',card)?.textContent||'';
          if (!/已驗證/.test(vtxt)) show=false;
        }
        // 應屆
        if (show && status.fresh) {
          if (/color:\s*blue/.test(card.innerHTML)||/預測/.test(card.textContent)) show=false;
        }
        // 有經驗
        if (show && status.exp && caseData.exp) {
          const exptxt = $('.col-12.text-left',card)?.textContent||'';
          if (!/經驗|有經驗/.test(exptxt)) show=false;
        }
        // 地點
        if (show && status.area && caseData.area) {
          const live = $('.col-6.text-right[style*="font-weight:bold"]',card)?.textContent?.trim()||'';
          let ok = false;
          // 鄰近地區比對
          for (const key in nearbyMap) {
            if (caseData.area.includes(key)) {
              if (nearbyMap[key].some(d=>live.includes(d))) { ok=true; break; }
            }
          }
          if (!ok && !live.includes(caseData.area)) show=false;
        }
        // 特殊要求
        if (show && status.spec && caseData.special) {
          const inp = prompt('請輸入特殊要求關鍵字（多個以,分隔）','');
          if (inp) {
            const arr = inp.split(',').map(s=>s.trim()).filter(Boolean);
            const intro = $('.col-12.text-left',card)?.textContent||'';
            if (!arr.some(k=>intro.includes(k))) show=false;
          }
        }
        card.style.display = show ? '' : 'none';
        if (show) shown++;
      });
      $('#tc_stat',ui).textContent = `顯示 ${shown} 位導師 / 共 ${total} 位`;
    }
    // 按鈕事件
    $$('#tc_btns button',ui).forEach(btn=>{
      btn.onclick = function() {
        const t = btn.getAttribute('data-tc');
        if (t==='edit') {
          const txt = prompt('編輯已貼上個案資料', $('#tc_paste',ui).value);
          if (txt!==null) {
            $('#tc_paste',ui).value = txt;
            $('#tc_submit',ui).click();
          }
          return;
        }
        if (t==='spec') { status.spec = !status.spec; doFilter(); syncBtns(); return; }
        status[t] = !status[t];
        doFilter(); syncBtns();
      }
    });
    // 提交分析
    $('#tc_submit',ui).onclick = ()=>{
      const val = $('#tc_paste',ui).value;
      if (!val.trim()) return alert('請先貼上個案資料');
      caseData = parseCase(val);
      // 根據個案資料自動開啟相應條件
      status = {
        fee: true,
        area: false,
        gender: !!caseData.gender,
        grade: !!caseData.grade,
        verify: false,
        fresh: true,
        exp: !!caseData.exp,
        spec: false,
        bad: false
      };
      $('#tc_btns',ui).style.display = '';
      syncBtns();
      doFilter();
    };
    return;
  }

  else {
    alert('目前頁面不支援本Bookmarklet');
  }

})();
