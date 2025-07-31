javascript:(function(){
  document.querySelectorAll('my-funcbox-root').forEach(el=>el.remove());
  var host = document.createElement('my-funcbox-root');
  host.style.position = 'fixed';
  host.style.left = '0'; host.style.top = '0';
  host.style.width = '100vw'; host.style.height = '100vh';
  host.style.zIndex = '2147483647';
  host.style.pointerEvents = 'none';
  document.body.appendChild(host);
  var root = host.attachShadow({mode:'open'});

  // 配置
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
  var FONT = "'Segoe UI','Noto Sans TC',Arial,'Microsoft JhengHei',sans-serif";
  var EXPAND_W = BTN_WIDTH + 44, EXPAND_H = BTN_HEIGHT * BTN_LIST.length + BTN_SPACE * (BTN_LIST.length-1) + 90;

  root.innerHTML = `
    <style>
      :host, #float-box, #emoji, #funcbox, #btns, #close-btn, .tool-btn, .hotkey {
        all: initial;
        font-family: ${FONT} !important;
        box-sizing: border-box !important;
      }
      #float-box {
        position: absolute;
        left: calc(100vw - ${PANEL_SIZE+24}px);
        top: calc(100vh - ${PANEL_SIZE+24}px);
        width: ${PANEL_SIZE}px; height: ${PANEL_SIZE}px;
        z-index:1003;
        pointer-events: auto;
        touch-action: none;
      }
      #emoji {
        width: ${PANEL_SIZE}px; height: ${PANEL_SIZE}px;
        border-radius: 50%;
        background: ${MAIN_COLOR};
        box-shadow: 0 2px 18px #7ecedc22,0 1px 4px #0002;
        font-size: 28px !important;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: grab;
        user-select: none;
        pointer-events: auto;
        position: absolute;
        left: 0; top: 0;
        z-index: 1004;
        transition: box-shadow .2s;
      }
      #emoji:active { box-shadow: 0 4px 22px #7ecedc33,0 2px 7px #0003; }
      #funcbox {
        position: absolute;
        display: none;
        background: transparent;
        z-index: 1002;
        pointer-events: none;
      }
      #funcbox.expanded {
        display: block;
        pointer-events: auto;
        animation: boxin .18s cubic-bezier(.6,.2,.2,1);
      }
      @keyframes boxin{
        0%{opacity:0;transform:scale(0.92);}
        100%{opacity:1;transform:scale(1);}
      }
      #btns {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        opacity:1;
        pointer-events:auto;
        z-index:10;
        min-width: ${BTN_WIDTH}px;
        min-height: ${BTN_HEIGHT*BTN_LIST.length+BTN_SPACE*(BTN_LIST.length-1)}px;
        background: transparent;
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
        opacity:1;transform: none;
        animation: none;
      }
      .tool-btn:first-child{margin-top:0;}
      .tool-btn:hover, .tool-btn:focus {
        background: ${BTN_BG_HOVER};
        color: ${BTN_TEXT_HOVER};
        box-shadow: 0 4px 14px #b9e5ea66;
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
        opacity:1;transform:scale(1);
        animation: none;
      }
      #close-btn:hover, #close-btn:focus {background: #b51b1b;box-shadow:0 5px 18px #ff4c4c55;}
      @media (max-width:600px){
        #btns{min-width:90vw !important;}
        .tool-btn{width:90vw;max-width:99vw;font-size:15px !important;}
        #close-btn{width:84vw;max-width:99vw;}
      }
    </style>
    <div id="float-box">
      <div id="emoji" aria-label="展開工具箱">${EMOJI}</div>
      <div id="funcbox">
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
  `;

  // 狀態與元素
  var box = root.getElementById('float-box');
  var emoji = root.getElementById('emoji');
  var funcbox = root.getElementById('funcbox');
  var btns = root.getElementById('btns');
  var closeBtn = root.getElementById('close-btn');
  var toolBtns = Array.from(btns.querySelectorAll('.tool-btn'));
  var dragging=false, dx=0, dy=0, boxX=window.innerWidth-PANEL_SIZE-24, boxY=window.innerHeight-PANEL_SIZE-24, expanded=false;
  var leaveTimer = null;
  var dragMoved = false;
  var expandDir = 'right-bottom'; // 預設展開方向

  // 輔助
  function clamp(val,min,max){return Math.max(min,Math.min(max,val));}
  function updateBoxPos(x,y){
    // emoji 實體位置
    var minX = 8, maxX = window.innerWidth - PANEL_SIZE - 8;
    var minY = 8, maxY = window.innerHeight - PANEL_SIZE - 8;
    x = clamp(x, minX, maxX);
    y = clamp(y, minY, maxY);
    boxX = x; boxY = y;
    box.style.left = boxX + "px";
    box.style.top  = boxY + "px";
    // funcbox 方向根據 emoji 位置自動決定
    updateFuncboxDirection();
  }

  function updateFuncboxDirection(){
    // 根據 emoji 圓心在螢幕哪個象限自動決定展開方向
    var cx = boxX + PANEL_SIZE/2, cy = boxY + PANEL_SIZE/2;
    var w = window.innerWidth, h = window.innerHeight;
    // 距離四邊界
    var spaceRight = w - (boxX + PANEL_SIZE);
    var spaceLeft  = boxX;
    var spaceBottom = h - (boxY + PANEL_SIZE);
    var spaceTop = boxY;

    // 預設右下，優先往空間最大的方向
    if(spaceRight >= EXPAND_W && spaceBottom >= EXPAND_H){
      expandDir = "right-bottom";
      funcbox.style.left = PANEL_SIZE + "px";
      funcbox.style.top = "0px";
    } else if (spaceLeft >= EXPAND_W && spaceBottom >= EXPAND_H){
      expandDir = "left-bottom";
      funcbox.style.left = -EXPAND_W + "px";
      funcbox.style.top = "0px";
    } else if (spaceRight >= EXPAND_W && spaceTop >= EXPAND_H){
      expandDir = "right-top";
      funcbox.style.left = PANEL_SIZE + "px";
      funcbox.style.top = -EXPAND_H + "px";
    } else if (spaceLeft >= EXPAND_W && spaceTop >= EXPAND_H){
      expandDir = "left-top";
      funcbox.style.left = -EXPAND_W + "px";
      funcbox.style.top = -EXPAND_H + "px";
    } else if (spaceBottom >= EXPAND_H) {
      expandDir = "bottom";
      funcbox.style.left = "0px";
      funcbox.style.top = PANEL_SIZE + "px";
    } else if (spaceTop >= EXPAND_H) {
      expandDir = "top";
      funcbox.style.left = "0px";
      funcbox.style.top = -EXPAND_H + "px";
    } else if (spaceRight >= EXPAND_W) {
      expandDir = "right";
      funcbox.style.left = PANEL_SIZE + "px";
      funcbox.style.top = "0px";
    } else if (spaceLeft >= EXPAND_W) {
      expandDir = "left";
      funcbox.style.left = -EXPAND_W + "px";
      funcbox.style.top = "0px";
    } else {
      expandDir = "overlap";
      funcbox.style.left = "0px";
      funcbox.style.top = "0px";
    }
  }

  // 拖曳
  function dragStart(ev){
    if(dragging) return;
    closeBox(); // 收合
    dragging = true; dragMoved = false;
    var evt = ev.touches ? ev.touches[0] : ev;
    dx = evt.clientX - (boxX + PANEL_SIZE/2);
    dy = evt.clientY - (boxY + PANEL_SIZE/2);
    document.addEventListener(ev.touches?'touchmove':'mousemove', dragMove, {passive:false});
    document.addEventListener(ev.touches?'touchend':'mouseup', dragEnd, {passive:false});
    emoji.style.cursor = 'grabbing';
    ev.preventDefault();
  }
  function dragMove(ev){
    var evt = ev.touches ? ev.touches[0] : ev;
    updateBoxPos(evt.clientX - PANEL_SIZE/2 - dx, evt.clientY - PANEL_SIZE/2 - dy);
    dragMoved = true;
    ev.preventDefault();
  }
  function dragEnd(ev){
    dragging=false;
    setTimeout(()=>{dragMoved=false;}, 60);
    emoji.style.cursor = 'grab';
    document.removeEventListener('mousemove', dragMove);
    document.removeEventListener('mouseup', dragEnd);
    document.removeEventListener('touchmove', dragMove);
    document.removeEventListener('touchend', dragEnd);
    ev.preventDefault();
  }
  emoji.addEventListener('mousedown', dragStart, {passive:false});
  emoji.addEventListener('touchstart', dragStart, {passive:false});

  // 展開/收合
  function openBox(){
    if(expanded) return;
    expanded = true;
    funcbox.classList.add('expanded');
    btns.setAttribute('aria-hidden','false');
    updateFuncboxDirection();
    setTimeout(()=>funcbox.focus(),10);
  }
  function closeBox(){
    if(!expanded) return;
    expanded = false;
    funcbox.classList.remove('expanded');
    btns.setAttribute('aria-hidden','true');
    updateFuncboxDirection();
  }

  // 滑鼠移到 emoji 就展開
  emoji.addEventListener("mouseenter", function(e){
    if(dragging) return;
    openBox();
  });

  // 滑鼠移出 emoji 和浮窗都會收合
  function setupAutoClose(){
    // 滑鼠移出 funcbox 或 emoji 就自動收合
    function tryAutoClose(e) {
      if(!expanded) return;
      // 若滑鼠仍在 emoji 或 funcbox內，不收合
      var rel = e.relatedTarget;
      if (funcbox.contains(rel) || emoji.contains(rel)) return;
      clearTimeout(leaveTimer);
      leaveTimer = setTimeout(closeBox, 250);
    }
    function clearAutoClose(){
      clearTimeout(leaveTimer);
    }
    funcbox.addEventListener("mouseleave", tryAutoClose, false);
    funcbox.addEventListener("mouseenter", clearAutoClose, false);
    emoji.addEventListener("mouseleave", tryAutoClose, false);
    emoji.addEventListener("mouseenter", clearAutoClose, false);
  }
  setupAutoClose();

  // 點擊 emoji 不做任何事（禁用點擊展開）
  emoji.onclick = function(e){};

  // Keyboard
  btns.tabIndex = -1;
  funcbox.onkeydown = function(e){
    if((e.key===" "||e.key==="Enter")&&!expanded){openBox();e.preventDefault();}
    if((e.key==="Escape")&&expanded){closeBox();e.preventDefault();}
  };

  // 點外面收合
  root.addEventListener('mousedown', function(e){
    if(expanded && !funcbox.contains(e.target) && !emoji.contains(e.target)) closeBox();
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

  window.addEventListener('resize', function(){ setTimeout(()=>updateBoxPos(boxX, boxY),30); });
  setTimeout(()=>updateBoxPos(boxX, boxY),30);

})();
