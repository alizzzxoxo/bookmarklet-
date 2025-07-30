javascript:(async function(){
  // 1. 判斷當前頁面
  const url = location.href;
  let mode = '';
  let caseId = '';

  // case approve list
  if (/\/cases_approve\/?$/.test(url)) {
    mode = 'approve-list';
  }
  // case individual
  else if (/\/cases_approve\/case\.php\?id=(\d+)/.test(url)) {
    mode = 'case-detail';
    caseId = url.match(/id=(\d+)/)[1];
  }
  // tutor list
  else if (/\/cases_approve\/completetutorlist_new\.php\?id=(\d+)/.test(url)) {
    mode = 'tutor-list';
    caseId = url.match(/id=(\d+)/)[1];
  } else {
    alert('請在個案審批頁、個案詳情頁或導師列表頁使用！');
    return;
  }

  // 共用的地區映射
  const nearbyMap = {/* ...此處省略，直接複製你原本定義... */};
  // DSE星等映射表
  const dseMap = {'5**':3,'5*':2,'5':1,'4':0,'五星':2,'5星':2,'五星星':3,'5星星':3,'5以上':1};

  // 入口1：個案列表頁
  if (mode === 'approve-list') {
    // 自動跳過指定狀態
    let cases = Array.from(document.querySelectorAll('[data-case-id]')).filter(row=>{
      let stat = row.innerText;
      return !(/沒有合適導師|學生已選導師|導師已回覆/.test(stat));
    });
    if (cases.length === 0) {
      alert('沒有可操作的個案。');
      return;
    }
    let curIdx = 0;
    let navDiv = document.createElement('div');
    navDiv.id = 'case-quick-nav';
    Object.assign(navDiv.style,{
      position:'fixed',top:'30px',right:'30px',zIndex:99999,background:'#fff',border:'2px solid #888',padding:'14px',borderRadius:'10px',boxShadow:'0 3px 16px #0002'
    });
    navDiv.innerHTML = `
      <button id="case-prev">上一個</button>
      <button id="case-next">下一個</button>
      <button id="case-phone">電話</button>
      <button id="case-tutorlist">導師列表</button>
      <br><span style="font-size:13px;color:#555">自動跳過無合適導師、已選導師、已回覆個案</span>
    `;
    document.body.appendChild(navDiv);

    function jump(idx) {
      curIdx = (idx + cases.length) % cases.length;
      cases[curIdx].scrollIntoView({behavior:'smooth',block:'center'});
      cases[curIdx].style.outline='3px solid orange';
      setTimeout(()=>cases[curIdx].style.outline='',2000);
    }
    jump(curIdx);
    document.getElementById('case-prev').onclick=()=>jump(curIdx-1);
    document.getElementById('case-next').onclick=()=>jump(curIdx+1);
    document.getElementById('case-phone').onclick=()=>{
      let txt = cases[curIdx].innerText;
      let phone = (txt.match(/電話[:：]?\s*(\d{8})/)||[])[1];
      if(phone) prompt('電話號碼',phone);
      else alert('找不到電話');
    };
    document.getElementById('case-tutorlist').onclick=()=>{
      let id = (cases[curIdx].getAttribute('data-case-id')||'').replace(/\D/g,'');
      if(id){
        window.open('/panel/admin/cases_approve/case.php?id='+id,'_blank');
        window.open('/panel/admin/cases_approve/completetutorlist_new.php?id='+id,'_blank');
      }
    };
    return;
  }

  // 入口2：個案詳情頁
  if (mode === 'case-detail') {
    let detail = document.querySelector('#case_detail');
    if(!detail) {alert('沒有找到個案資料');return;}
    let txt = detail.innerText;
    // 解析資料
    let subject = (txt.match(/科[目⽬]：.*?\n/)||[''])[0].replace(/.*?：/,'').trim();
    let fee = (txt.match(/學費：.*?\n/)||[''])[0].replace(/.*?：/,'').trim();
    let area = (txt.match(/地點：.*?\n/)||[''])[0].replace(/.*?：/,'').trim();
    let special = (txt.match(/特別要求：([\s\S]*)/)||['',''])[1].split('\n')[0].trim();
    let copyText = `[個案編號：${caseId}]\n科目：${subject}\n學費：${fee}\n地點：${area}\n特別要求：${special}`;
    copyToClipboard(copyText);
    alert('已複製：\n'+copyText+'\n\n請到導師列表頁貼上');
    return;
  }

  // 入口3：導師列表頁
  if (mode === 'tutor-list') {
    // 1. 顯示輸入框讓使用者貼上個案資料
    let oldBox = document.getElementById('case-match-ui');
    if(oldBox) oldBox.remove();
    let matchDiv = document.createElement('div');
    matchDiv.id = 'case-match-ui';
    Object.assign(matchDiv.style,{
      position:'fixed',top:'35px',right:'35px',zIndex:99999,background:'#fff',border:'2px solid #888',padding:'18px',borderRadius:'12px',boxShadow:'0 5px 20px #0002',width:'340px'
    });
    matchDiv.innerHTML = `
      <div style="font-size:18px;font-weight:bold;">🧩 個案自動配對工具</div>
      <textarea id="case-paste" style="width:100%;height:90px;margin:10px 0;font-size:15px;"></textarea>
      <button id="case-analyze">分析並比對導師</button>
      <button id="case-close" style="float:right;">❌</button>
      <div id="case-match-status" style="color:#666;font-size:13px;margin-top:6px;"></div>
      <div id="case-match-btns" style="margin-top:12px;"></div>
    `;
    document.body.appendChild(matchDiv);
    document.getElementById('case-close').onclick=()=>matchDiv.remove();

    document.getElementById('case-analyze').onclick=()=>{
      let vals = document.getElementById('case-paste').value;
      if(!vals.trim()) return alert('請貼上個案資料');
      matchDiv.querySelector('#case-match-status').innerHTML = '分析中...';
      // 解析
      let subject = (vals.match(/科[目⽬]：([^\n]+)/)||['',''])[1].trim();
      let feeText = (vals.match(/學費：([^\n]+)/)||['',''])[1].replace(/[^\d\-–~至]/g,'').replace(/[–~至]/g,'-');
      let feeMin = parseInt((feeText.match(/(\d+)/)||[])[1]);
      let feeMax = parseInt((feeText.match(/\-(\d+)/)||[])[1]);
      if(!feeMax) feeMax = feeMin;
      let area = (vals.match(/地點：([^\n]+)/)||['',''])[1].trim();
      let special = (vals.match(/特別要求：([\s\S]+)/)||['',''])[1].split('\n')[0].trim();
      // 搜集所有導師
      let tutors = Array.from(document.querySelectorAll('.sentence[data-tutor-id]'));
      let results = tutors.map(tutor=>{
        let obj = {};
        obj.node = tutor;
        obj.id = tutor.getAttribute('data-tutor-id');
        let feeNode = tutor.querySelector('.tutor-response-fee');
        obj.fee = feeNode ? parseInt(feeNode.textContent.replace(/[^\d]/g,'')) : null;
        let areaNode = tutor.querySelector('label[style*="font-weight:bold"]');
        obj.area = areaNode ? areaNode.textContent.trim() : '';
        let genderNode = tutor.querySelector('.gender');
        obj.gender = genderNode ? genderNode.textContent.trim() : '';
        let txtBlock = tutor.querySelector('.col-12.text-left') ? tutor.querySelector('.col-12.text-left').innerText : '';
        // 成績
        obj.score = null;
        let sc = (txtBlock.match(/數學\s*-\s*(5\*\*|5\*|5|4)/) || [])[1];
        obj.score = sc;
        // 驗證
        obj.verified = /color:\s*green/.test(txtBlock) && /已驗證/.test(txtBlock);
        obj.predicted = /color:\s*blue/.test(txtBlock) && /預測/.test(txtBlock);
        obj.bad = tutor.querySelector('.remark-tag.badge.badge-danger') ? true : false;
        obj.exp = /導師經驗[:：]/.test(txtBlock);
        obj.selfintro = (txtBlock.match(/導師自我介紹[:：]([\s\S]*)/)||['',''])[1];
        return obj;
      }).filter(t=>!t.bad); // 一律不顯示差評導師

      // 條件判斷
      function matchFee(t) {
        return t.fee && t.fee >= feeMin && t.fee <= feeMax;
      }
      function matchArea(t) {
        if(!area) return true;
        let arr = [];
        for(let key in nearbyMap) {
          if(key === area) arr = nearbyMap[key];
          else if(nearbyMap[key].includes(area)) arr = nearbyMap[key];
        }
        if(!arr.length) arr = [area];
        return arr.some(a=>t.area.includes(a));
      }
      function matchGender(t) {
        if(/女導師/.test(special)) return t.gender==='女';
        if(/男導師/.test(special)) return t.gender==='男';
        return true;
      }
      function matchScore(t) {
        let want = null;
        if(/5\*\*/.test(special)) want=3;
        else if(/5\*/.test(special)) want=2;
        else if(/5[\s\/]*以上/.test(special)) want=1;
        else if(/5星|五星/.test(special)) want=2;
        else if(/5/.test(special)) want=1;
        if(!want) return true;
        let actual = t.score==='5**'?3:t.score==='5*'?2:t.score==='5'?1:t.score==='4'?0:null;
        return actual!==null && actual>=want;
      }
      function matchVerified(t) {
        if(/已驗證/.test(special)) return t.verified;
        return true;
      }
      function matchPredicted(t) {
        return !t.predicted;
      }
      function matchExp(t) {
        if(/有經驗/.test(special)) return t.exp;
        return true;
      }
      // [特殊要求]用戶輸入
      let customKey = '';
      function matchCustom(t) {
        if(!customKey) return true;
        return t.selfintro && t.selfintro.includes(customKey);
      }

      // UI按鈕
      let btns = [
        {key:'fee', name:'學費', on:true, fn:matchFee},
        {key:'area', name:'地點', on:false, fn:matchArea},
        {key:'gender', name:'性別', on:/[男女]導師/.test(special), fn:matchGender},
        {key:'score', name:'成績', on:/5(\*\*|\*)|5星|五星|5[\s\/]*以上/.test(special), fn:matchScore},
        {key:'verified', name:'驗證', on:/已驗證/.test(special), fn:matchVerified},
        {key:'pred', name:'應屆', on:false, fn:matchPredicted},
        {key:'exp', name:'有經驗', on:/有經驗/.test(special), fn:matchExp},
        {key:'custom', name:'特殊要求', on:false, fn:matchCustom},
        {key:'edit', name:'編輯', on:false, fn:null}
      ];
      function filter() {
        let arr = results;
        btns.forEach(btn=>{
          if(btn.key==='edit') return;
          if(btn.on) arr = arr.filter(btn.fn);
        });
        // 特殊要求
        if(btns.find(b=>b.key==='custom').on && !customKey) {
          customKey = prompt('請輸入特殊要求關鍵字','');
          if(!customKey) btns.find(b=>b.key==='custom').on=false;
        }
        arr.forEach(t=>t.node.style.display='block');
        results.forEach(t=>{
          if(!arr.includes(t)) t.node.style.display='none';
        });
        matchDiv.querySelector('#case-match-status').innerHTML = arr.length ? `顯示 ${arr.length} 位符合導師` : '<span style="color:#c00">沒有符合的導師</span>';
      }
      // 按鈕區
      function renderBtns() {
        let html = '';
        btns.forEach((btn,i)=>{
          let style = btn.on ? 'background:#888;color:#fff;cursor:pointer;' : 'background:#eee;color:#222;cursor:pointer;';
          html += `<button data-key="${btn.key}" style="margin:2px 4px 2px 0;padding:2px 9px;border-radius:4px;${style}">${btn.name}</button>`;
        });
        matchDiv.querySelector('#case-match-btns').innerHTML = html;
        btns.forEach(btn=>{
          let el = matchDiv.querySelector(`[data-key="${btn.key}"]`);
          el.onclick = ()=> {
            if(btn.key==='edit') {
              let n = prompt('請修改需求\n(如：女導師,5*,有經驗...)',special);
              if(n!==null) {special = n;document.getElementById('case-paste').value = `[個案編號：${caseId}]\n科目：${subject}\n學費：${feeMin}-${feeMax}\n地點：${area}\n特別要求：${special}`;}
            } else if(btn.key==='custom') {
              customKey = prompt('請輸入特殊要求關鍵字','');
              btn.on = !!customKey;
            } else {
              btn.on = !btn.on;
            }
            renderBtns();
            filter();
          };
        });
      }
      renderBtns();
      filter();
    };
    return;
  }

  // 複製到剪貼簿
  function copyToClipboard(txt){
    if(navigator.clipboard) {
      navigator.clipboard.writeText(txt);
    } else {
      let ta=document.createElement('textarea');
      ta.value=txt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
  }
})();
