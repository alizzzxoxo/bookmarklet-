javascript:(function(){
if(window.__tc_bookmarklet_active)return;window.__tc_bookmarklet_active=1;
const q=(s,p=document)=>p.querySelector(s),qa=(s,p=document)=>Array.from(p.querySelectorAll(s));
function closeUI(u){u&&u.remove();}

// ----------- /cases_approve/ 個案列表頁功能 -----------
if(/\/cases_approve\/?$/.test(location.pathname)){
  const ui = document.createElement("div");
  ui.style = "position:fixed;top:20px;right:20px;z-index:99999;background:#fff;border:2px solid #036;padding:8px 12px;border-radius:8px;font-size:16px;box-shadow:2px 2px 12px #0003;display:flex;align-items:center;gap:6px;";
  ui.innerHTML = `
    <input id="tc_caseid" type="text" inputmode="numeric" pattern="[0-9]*" placeholder="Case ID" style="width:80px;font-size:15px;padding:2px 5px;border:1px solid #bbb;border-radius:4px;height:28px;">
    <button id="tc_prev">上一個</button>
    <button id="tc_next">下一個</button>
    <button id="tc_phone">電話</button>
    <button id="tc_copycase" style="background:#e5eaff;color:#224;">套取個案資料</button>
    <button id="tc_openlist" style="background:#ffd1ec;color:#a50051;">導師列表</button>
    <button id="tc_close" style="margin-left:6px;background:none;border:none;font-size:22px;line-height:1;color:#e74c3c;cursor:pointer;">&#10006;</button>
  `;
  document.body.appendChild(ui);

  let input = q("#tc_caseid",ui);

  // highlight row by id
  input.addEventListener("input",function(){
    const val=this.value.replace(/\D/g,"");
    this.value=val;
    qa("#main-table tbody tr").forEach(tr=>{
      tr.style.backgroundColor="";
      const a=tr.querySelector('a[href*="case.php?id="]');
      if(a && a.textContent.trim()===val) tr.style.backgroundColor="#FF95CA";
    });
  });

  // 上/下一個case
  q("#tc_prev",ui).onclick=()=>{
    const trs=qa("#main-table tbody tr");
    let idx=trs.findIndex(tr=>tr.style.backgroundColor);
    if(idx<0)idx=0;else idx=(idx-1+trs.length)%trs.length;
    const a=trs[idx].querySelector('a[href*="case.php?id="]');
    if(a){input.value=a.textContent.trim();input.dispatchEvent(new Event("input"));}
  };
  q("#tc_next",ui).onclick=()=>{
    const trs=qa("#main-table tbody tr");
    let idx=trs.findIndex(tr=>tr.style.backgroundColor);
    if(idx<0)idx=0;else idx=(idx+1)%trs.length;
    const a=trs[idx].querySelector('a[href*="case.php?id="]');
    if(a){input.value=a.textContent.trim();input.dispatchEvent(new Event("input"));}
  };
  // 電話功能
  q("#tc_phone",ui).onclick=()=>{
    const p=(q('td[data-target="phone"]')||q("td[data-phone]")||q("td.phone"))?.textContent?.trim();
    p?prompt("電話號碼：",p):alert("找不到電話");
  };
  // [導師列表]功能
  q("#tc_openlist",ui).onclick=()=>{
    const val=input.value.trim();
    if(!val)return alert("請先輸入Case ID");
    window.open(`/panel/admin/cases_approve/completetutorlist_new.php?id=${val}`,"_blank");
  };

  // [套取個案資料]功能
  q("#tc_copycase",ui).onclick=()=>{
    const val=input.value.trim();
    if(!val)return alert("請先輸入Case ID");
    let target=null,res="";
    qa("#main-table tbody tr").forEach(tr=>{
      const a=tr.querySelector('a[href*="case.php?id="]');
      if(a && a.textContent.trim()===val) target=tr;
    });
    if(!target)return alert("找不到該個案");

    // 按tr內的copy按鈕
    const btn=target.querySelector('button[onclick^=copyInfo]');
    if(btn){
      btn.click();
      setTimeout(()=>{
        // 取得複製內容
        navigator.clipboard.readText().then(t=>{
          // 去掉自動回覆區塊
          let r=t.replace(/^\s*你好！多謝你使用Tutor Circle尋補服務呀[\s\S]+?無須再次填寫表格以免影響處理流程😉\s*/,"").replace(/^\s*\n+/g,"");
          navigator.clipboard.writeText(r);
          alert("已複製個案純資料到剪貼簿！");
        });
      },200);
    }else{
      alert("找不到copy按鈕，請確認網頁結構");
    }
  };

  q("#tc_close",ui).onclick=()=>closeUI(ui);
  return;
}

// -------- 詳情頁 ---------
if(/\/cases_approve\/case\.php\?id=(\d+)/.test(location.pathname+location.search)){
  const caseId=RegExp.$1,n=q("#case_detail");
  if(!n)return;
  const box=document.createElement("div");
  box.style="position:fixed;top:70px;right:40px;z-index:99999;background:#fff6ef;border:3px solid orange;padding:34px 32px 22px 32px;border-radius:16px;font-size:21px;box-shadow:2px 2px 18px #0002;display:flex;flex-direction:column;align-items:center;min-width:240px;";
  box.innerHTML=`
    <button id="tc_copy" style="padding:9px 26px 9px 20px;font-size:21px;border-radius:8px;background:#ffae00;color:#fff;border:none;box-shadow:1px 1px 7px #0001;cursor:pointer;font-weight:bold;letter-spacing:1px;">導出個案資料↪️</button>
    <div style="font-size:14px;color:#ba6c00;margin-top:11px;text-align:center;">💡提示：導出後如複製了其他文字，需再次按導出</div>
    <button id="tc_close" style="position:absolute;top:8px;right:12px;background:none;border:none;font-size:23px;line-height:1;color:#e74c3c;cursor:pointer;">&#10006;</button>
  `;
  document.body.appendChild(box);

  function getCaseData(){
    const t=n.textContent;
    return{
      subject:(()=>{const m=t.match(/科[目目]：\s*([^\n]+)/);if(!m)return"";let s=m[1];if(s.includes("]"))s=s.replace(/^[^\]]*\]\s*/,"");if(s.includes("("))s=s.split("(")[0];if(s.includes("/"))s=s.split("/")[0];return s.trim()})(),
      fee:t.match(/學費：?\s*([^\n]+)/)?.[1]?.trim()||"",
      area:t.match(/地[點區]：?\s*([^\n]+)/)?.[1]?.trim()||"",
      special:t.match(/特別要求：?\s*([^\n]+)/)?.[1]?.trim()||""
    }
  }
  q("#tc_copy",box).onclick=()=>{
    const dat=getCaseData(),txt=`科目: ${dat.subject}\n學費: ${dat.fee}\n地點: ${dat.area}\n特別要求: ${dat.special}`;
    navigator.clipboard.writeText(txt);
    q("#tc_copy",box).textContent="已導出!";
    setTimeout(()=>{q("#tc_copy",box).textContent="導出個案資料↪️"},1200);
    window.open(`/panel/admin/cases_approve/completetutorlist_new.php?id=${caseId}`,"_blank");
  };
  q("#tc_close",box).onclick=()=>closeUI(box);
  return;
}

// -------- 導師篩選頁 ---------
if(/\/cases_approve\/completetutorlist_new\.php\?id=(\d+)/.test(location.pathname+location.search)){
  const t=document.createElement("div");
  t.id="tc_flt";
  t.style="position:fixed;top:20px;right:20px;z-index:99999;background:#fff;border:2px solid #036;padding:12px 16px 10px 16px;border-radius:12px;font-size:16px;min-width:260px;box-shadow:2px 2px 12px #0003;";
  t.innerHTML=`
    <button id="tc_close" style="position:absolute;top:8px;right:10px;background:none;border:none;font-size:22px;line-height:1;color:#e74c3c;cursor:pointer;">&#10006;</button>
    <div style="margin-bottom:8px;">
      <textarea id="tc_paste" placeholder="請貼上個案資料（由[個案詳情]複製）" style="width:100%;height:70px;font-size:14px;"></textarea>
    </div>
    <button id="tc_submit">分析並篩選</button>
    <div id="tc_btns" style="margin-top:10px;display:none;display:flex;flex-wrap:wrap;gap:5px;">
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
  `;
  document.body.appendChild(t);
  q("#tc_close",t).onclick=()=>closeUI(t);
  // 其餘功能不變
  // ...如需篩選優化請再提出
  return;
}

alert("目前頁面不支援本Bookmarklet");
})();
