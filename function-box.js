javascript:(function(){
  // 先清除舊的
  document.querySelectorAll('my-funcbox-root').forEach(el=>el.remove());

  // 建立全畫面host
  var host = document.createElement('my-funcbox-root');
  host.style.position = 'fixed';
  host.style.left = '0'; host.style.top = '0';
  host.style.width = '100vw'; host.style.height = '100vh';
  host.style.zIndex = '2147483647';
  host.style.pointerEvents = 'none';
  document.body.appendChild(host);
  var root = host.attachShadow({mode:'open'});

  // 設定
  var EMOJI = "🧰";
  var BTN_LIST = [
    { name: "導師篩選", hotkey: "1", action: ()=>alert('導師篩選!（自行替換功能）') },
    { name: "自動填表", hotkey: "2", action: ()=>alert('自動填表!（自行替換功能）') },
    { name: "批次複製", hotkey: "3", action: ()=>alert('批次複製!（自行替換功能）') }
  ];
  var MAIN_COLOR = "#7ecedc";
  var BTN_BG = "#7ecedc";
  var BTN_BG_HOVER = "#b9e5ea";
  var BTN_TEXT = "#17505f";
  var BTN_TEXT_HOVER = "#123b46";
  var BTN_RADIUS = "12px";
  var BTN_SPACE = 15;
  var BTN_HEIGHT = 38;
  var BTN_WIDTH = 180;
  var PANEL_SIZE = 54;
  var PANEL_SHADOW = "0 2px 18px #7ecedc22,0 1px 4px #0002";
  var FONT = "'Segoe UI','Noto Sans TC',Arial,'Microsoft JhengHei',sans-serif";

  var EXPAND_W = BTN_WIDTH + 44, EXPAND_H = BTN_HEIGHT * BTN_LIST.length + BTN_SPACE * (BTN_LIST.length-1) + 90;
  var EXPAND_RADIUS = 18;
  var DURATION = 260;

  root.innerHTML = `
    <style>
      :host, #float-box, #mainbox, #emoji, #btns, #close-btn, .tool-btn, .hotkey {
        all: initial;
        font-family: ${FONT} !important;
        box-sizing: border-box !important;
      }
      #float-box {
        position: absolute;
        left: calc(100vw - ${PANEL_SIZE+24}px);
        top: calc(100vh - ${PANEL_SIZE+24}px);
        width: ${PANEL_SIZE}px; height: ${PANEL_SIZE}px;
        z-index:1;
        pointer-events: auto;
        touch-action: none;
      }
      #mainbox {
        width:${PANEL_SIZE}px; height:${PANEL_SIZE}px;
        border-radius: 50%;
        background: ${MAIN_COLOR};
        box-shadow: ${PANEL_SHADOW};
        display: flex; align-items: center; justify-content: center;
        font-size: 26px !important;
        cursor: grab;
        user-select: none;
        transition: width ${DURATION}ms cubic-bezier(.4,0,.2,1), height ${DURATION}ms cubic-bezier(.4,0,.2,1), border-radius ${DURATION}ms cubic-bezier(.4,0,.2,1), background ${DURATION}ms;
        position: relative;
        overflow: visible;
      }
      #emoji {
        opacity: 1;
        transition: opacity ${Math.round(DURATION*0.6)}ms;
        z-index:2;
        pointer-events:auto;
        user-select: none;
        font-size: 28px !important;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      #mainbox.expanded {
        width:${EXPAND_W}px;
        height:${EXPAND_H}px;
        border-radius: ${EXPAND_RADIUS}px;
        background: rgba(255,255,255,0.01);
        cursor: default;
      }
      #mainbox.expanded #emoji {
        opacity: 0;
        pointer-events:none;
      }
      #content {
        position: absolute;
        left: 0; top: 0; width: 100%; height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        pointer-events: none;
      }
      #btns {
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        opacity:0;
        pointer-events:none;
        transition: opacity ${Math.round(DURATION*0.6)}ms ${Math.round(DURATION*0.2)}ms;
        z-index:10;
      }
      #mainbox.expanded #btns { 
        display: flex;
        opacity:1; 
        pointer-events:auto; 
        transition: opacity ${Math.round(DURATION*0.7)}ms ${Math.round(DURATION*0.1)}ms;
      }
      .tool-btn {
        width: ${BTN_WIDTH}px;
        height: ${BTN_HEIGHT}px;
        background: ${BTN_BG};
        color: ${BTN_TEXT};
        border: none;
        border-radius: ${BTN_RADIUS};
        font-size: 15px !important;
        font-weight: 500 !important;
        margin: 0;
        margin-top: ${BTN_SPACE}px;
        box-shadow: 0 2px 8px #b9e5ea33;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        outline: none;
        letter-spacing: 0.5px;
        user-select:none;
        opacity:0; transform: translateY(9px) scale(0.97);
        animation: none;
      }
      #mainbox.expanded .tool-btn {
        opacity:1; transform: translateY(0) scale(1);
        animation: btnin .22s cubic-bezier(.45,.1,.2,1) both;
      }
      .tool-btn:first-child{margin-top:0;}
      .tool-btn:hover, .tool-btn:focus {
        background: ${BTN_BG_HOVER};
        color: ${BTN_TEXT_HOVER};
        box-shadow: 0 4px 14px #b9e5ea66;
      }
      @keyframes btnin{
        0%{opacity:0;transform:translateY(14px) scale(0.90);}
        100%{opacity:1;transform:translateY(0) scale(1);}
      }
      .hotkey {
        background: #f4f8fa;
        color: #33a4b7;
        border-radius: 7px;
        padding: 2px 9px;
        font-size: 13px !important;
        font-weight: 600 !important;
        margin-left: 10px;
        border: 1px solid #7ecedc66;
        margin-right: -4px;
        box-shadow:0 1px 2px #7ecedc14;
        letter-spacing: .5px;
        display:inline-block;
      }
      #close-btn {
        margin-top: ${BTN_SPACE+4}px;
        width: ${BTN_WIDTH-8}px;
        height: ${BTN_HEIGHT-4}px;
        background: #ff4c4c;
        color: #fff;
        border: none;
        border-radius: 13px;
        font-size: 15px !important;
        font-weight: 700 !important;
        cursor: pointer;
        box-shadow: 0 2px 12px #ff4c4c33;
        transition: background .16s, box-shadow .18s;
        display: flex; align-items: center; justify-content: center;
        outline: none;
        letter-spacing: 1.2px;
        opacity:0;transform:scale(.93);
        animation: none;
      }
      #mainbox.expanded #close-btn{
        opacity:1;transform:scale(1);
        animation: btnin .22s .15s cubic-bezier(.45,.1,.2,1) both;
      }
      #close-btn:hover, #close-btn:focus {background: #b51b1b;box-shadow:0 5px 18px #ff4c4c55;}
      @media (max-width:600px){
        #mainbox,#mainbox.expanded{width:96vw !important;min-width:80vw !important;max-width:100vw !important;}
        #mainbox,#mainbox.expanded{height:auto !important;}
        .tool-btn{width:90vw;max-width:99vw;font-size:15px !important;}
        #close-btn{width:84vw;max-width:99vw;}
      }
    </style>
    <div id="float-box">
      <div id="mainbox" tabindex="0">
        <div id="emoji" aria-label="展開工具箱">${EMOJI}</div>
        <div id="content">
          <div id="btns" aria-hidden="true">
            ${BTN_LIST.map((b,i)=>`
              <button class="tool-btn" data-idx="${i}" tabindex="-1">
                <span>${b.name}</span>
                <span class="hotkey">Alt+${b.hotkey}</span>
              </button>
            `).join('')}
            <button id="close-btn" tabindex="-1">✖ 一鍵關閉工具箱</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // 操作
  var box = root.getElementById('float-box');
  var mainbox = root.getElementById('mainbox');
  var emoji = root.getElementById('emoji');
  var btns = root.getElementById('btns');
  var closeBtn = root.getElementById('close-btn');
  var toolBtns = Array.from(btns.querySelectorAll('.tool-btn'));
  var dragging=false,dx=0,dy=0, boxX=window.innerWidth-PANEL_SIZE-24, boxY=window.innerHeight-PANEL_SIZE-24, expanded=false;

  function clamp(val,min,max){return Math.max(min,Math.min(max,val));}
  function updateBoxPos(x,y){
    var exw = expanded ? EXPAND_W : PANEL_SIZE, exh = expanded ? EXPAND_H : PANEL_SIZE;
    var minX = 8, maxX = window.innerWidth - exw - 8;
    var minY = 8, maxY = window.innerHeight - exh - 8;
    x = clamp(x, minX, maxX);
    y = clamp(y, minY, maxY);
    boxX = x; boxY = y;
    box.style.left = boxX + "px";
    box.style.top  = boxY + "px";
  }
  // 拖曳
  function dragStart(ev){
    if(expanded) return; // 展開時不允許拖曳
    dragging=true;
    var evt = ev.touches ? ev.touches[0] : ev;
    dx = evt.clientX - boxX;
    dy = evt.clientY - boxY;
    document.addEventListener(ev.touches?'touchmove':'mousemove', dragMove, {passive:false});
    document.addEventListener(ev.touches?'touchend':'mouseup', dragEnd, {passive:false});
    mainbox.style.cursor='grabbing';
    ev.preventDefault();
  }
  function dragMove(ev){
    var evt = ev.touches ? ev.touches[0] : ev;
    updateBoxPos(evt.clientX-dx, evt.clientY-dy);
    ev.preventDefault();
  }
  function dragEnd(ev){
    dragging=false;
    mainbox.style.cursor=expanded?'default':'grab';
    document.removeEventListener('mousemove', dragMove);
    document.removeEventListener('mouseup', dragEnd);
    document.removeEventListener('touchmove', dragMove);
    document.removeEventListener('touchend', dragEnd);
    ev.preventDefault();
  }
  mainbox.addEventListener('mousedown', dragStart, {passive:false});
  mainbox.addEventListener('touchstart', dragStart, {passive:false});

  // 展開/收合
  function openBox(){
    if(expanded) return;
    expanded = true;
    mainbox.classList.add('expanded');
    btns.setAttribute('aria-hidden','false');
    setTimeout(()=>updateBoxPos(boxX, boxY),10);
    setTimeout(()=>mainbox.focus(),10);
  }
  function closeBox(){
    if(!expanded) return;
    expanded = false;
    mainbox.classList.remove('expanded');
    btns.setAttribute('aria-hidden','true');
    setTimeout(()=>updateBoxPos(boxX, boxY),10);
  }
  emoji.onclick = function(e){ 
    if(expanded) return;
    openBox(); 
    e.stopPropagation(); 
  };

  mainbox.onkeydown = function(e){
    if((e.key===" "||e.key==="Enter")&&!expanded){openBox();e.preventDefault();}
    if((e.key==="Escape")&&expanded){closeBox();e.preventDefault();}
  };

  // 點浮窗外收合
  root.addEventListener('mousedown', function(e){
    if(expanded && !mainbox.contains(e.target)) closeBox();
  });

  // 按鈕功能
  toolBtns.forEach(function(btn,i){
    btn.onclick = function(e){
      if(!expanded) return;
      BTN_LIST[i].action();
    }
  });

  // 熱鍵功能
  window.addEventListener('keydown', function(e){
    if(!expanded) return;
    BTN_LIST.forEach((b,i)=>{
      if(e.altKey && e.key===b.hotkey){
        e.preventDefault();
        toolBtns[i].focus();
        toolBtns[i].click();
      }
    });
    if(e.key==="Escape"){closeBox();}
  });

  // 一鍵關閉
  closeBtn.onclick = function(){
    document.querySelectorAll('my-funcbox-root').forEach(el=>el.remove());
  };

  // 響應視窗調整
  window.addEventListener('resize', function(){ setTimeout(()=>updateBoxPos(boxX, boxY),30); });
  setTimeout(()=>updateBoxPos(boxX, boxY),30);

})();
