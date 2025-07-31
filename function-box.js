javascript:(function(){
  // 清理所有殘留
  document.querySelectorAll('my-floating-toolbox-root').forEach(el=>el.remove());
  // 建立全屏承載器
  var host = document.createElement('my-floating-toolbox-root');
  host.style.position = 'fixed';
  host.style.left = '0'; host.style.top = '0';
  host.style.width = '100vw'; host.style.height = '100vh';
  host.style.zIndex = '2147483647';
  host.style.pointerEvents = 'none';
  document.body.appendChild(host);
  var root = host.attachShadow({mode:'open'});

  // 參數
  var EMOJI = "🧰";
  var BTN_LIST = [
    { name: "導師篩選", hotkey: "1", action: ()=>alert('導師篩選') },
    { name: "自動填表", hotkey: "2", action: ()=>alert('自動填表') },
    { name: "批次複製", hotkey: "3", action: ()=>alert('批次複製') }
  ];
  var MAIN_COLOR = "#7ecedc";
  var BTN_BG = "#7ecedc";
  var BTN_BG_HOVER = "#b9e5ea";
  var BTN_TEXT = "#17505f";
  var BTN_TEXT_HOVER = "#123b46";
  var BTN_RADIUS = "13px";
  var BTN_SPACE = 18;
  var BTN_HEIGHT = 44;
  var BTN_WIDTH = 200;
  var PANEL_SIZE = 62;
  var PANEL_SHADOW = "0 2px 18px #7ecedc22,0 1px 4px #0002";
  var FONT = "'Segoe UI','Noto Sans TC',Arial,'Microsoft JhengHei',sans-serif";

  // HTML
  root.innerHTML = `
    <style>
      :host{all:initial;}
      #floating-box {
        position: absolute;
        left: calc(100vw - ${PANEL_SIZE+24}px);
        top: calc(100vh - ${PANEL_SIZE+24}px);
        width: ${PANEL_SIZE}px; height: ${PANEL_SIZE}px;
        z-index:1;
        transition: left 0.25s cubic-bezier(.64,.09,.1,1), top 0.25s cubic-bezier(.64,.09,.1,1);
      }
      #toolbox-emoji {
        width: ${PANEL_SIZE}px; height: ${PANEL_SIZE}px;
        border-radius: 50%;
        background: ${MAIN_COLOR};
        display: flex; align-items: center; justify-content: center;
        font-size: 2em;
        box-shadow: ${PANEL_SHADOW};
        cursor: grab;
        transition: box-shadow .2s, background .23s;
        user-select: none;
        pointer-events: auto;
        will-change: left,top,box-shadow,background;
        animation: popin .25s;
      }
      @keyframes popin {
        0%{transform:scale(0.7);}
        100%{transform:scale(1);}
      }
      #toolbox-emoji:active{cursor:grabbing;}
      #floating-box.expanded #toolbox-emoji{
        opacity:0;pointer-events:none;
        transition: opacity .18s;
      }

      #expander {
        display:none;
        position: absolute;
        left: 50%; top: 50%;
        transform: translate(-50%, -50%) scale(0.6);
        min-width:${BTN_WIDTH+24}px;
        background:rgba(255,255,255,0.00);
        border-radius: 20px;
        padding: 32px 16px;
        box-shadow: ${PANEL_SHADOW};
        z-index:3;
        animation: fadein .24s;
        transition:box-shadow .18s,background .23s;
        will-change: left,top,opacity,transform;
      }
      @keyframes fadein {
        0%{opacity:0;transform:translate(-50%,-50%) scale(0.85);}
        100%{opacity:1;transform:translate(-50%,-50%) scale(1);}
      }
      #floating-box.expanded #expander{
        display:flex; flex-direction:column; align-items:center;
        opacity:1; pointer-events:auto;
      }
      .tool-btn {
        width: ${BTN_WIDTH}px;
        height: ${BTN_HEIGHT}px;
        background: ${BTN_BG};
        color: ${BTN_TEXT};
        border: none;
        border-radius: ${BTN_RADIUS};
        font-family: ${FONT};
        font-size: 1.13em;
        font-weight: 500;
        margin: 0;
        margin-top: ${BTN_SPACE}px;
        box-shadow: 0 2px 8px #b9e5ea33;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: background .17s, color .13s, box-shadow .18s;
        outline: none;
        position: relative;
        letter-spacing: 1px;
        user-select:none;
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
        font-size: 0.88em;
        font-weight: 600;
        margin-left: 12px;
        border: 1px solid #7ecedc66;
        margin-right: -4px;
        box-shadow:0 1px 2px #7ecedc14;
        letter-spacing: .5px;
      }
      #close-btn {
        margin-top: ${BTN_SPACE+2}px;
        width: ${BTN_WIDTH-12}px;
        height: ${BTN_HEIGHT-4}px;
        background: #ff4c4c;
        color: #fff;
        border: none;
        border-radius: 13px;
        font-size: 1.05em;
        font-family: ${FONT};
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 2px 12px #ff4c4c33;
        transition: background .16s, box-shadow .18s;
        display: flex; align-items: center; justify-content: center;
        outline: none;
        letter-spacing: 2px;
      }
      #close-btn:hover, #close-btn:focus {background: #b51b1b;box-shadow:0 5px 18px #ff4c4c55;}
      @media (max-width:600px){
        #expander{min-width:120px;padding:18px 2vw;}
        .tool-btn{width:90vw;max-width:99vw;font-size:1em;}
        #close-btn{width:84vw;max-width:99vw;}
      }
    </style>
    <div id="floating-box">
      <div id="toolbox-emoji" tabindex="0" title="展開工具箱">${EMOJI}</div>
      <div id="expander" role="dialog" aria-modal="true" tabindex="-1">
        ${BTN_LIST.map((b,i)=>`
          <button class="tool-btn" data-idx="${i}">
            <span>${b.name}</span>
            <span class="hotkey">Alt+${b.hotkey}</span>
          </button>
        `).join('')}
        <button id="close-btn" tabindex="0">✖ 一鍵關閉工具箱</button>
      </div>
    </div>
  `;

  // 操作
  var box = root.getElementById('floating-box');
  var emoji = root.getElementById('toolbox-emoji');
  var expander = root.getElementById('expander');
  var closeBtn = root.getElementById('close-btn');
  var dragging=false,dx=0,dy=0, boxX=window.innerWidth-PANEL_SIZE-24, boxY=window.innerHeight-PANEL_SIZE-24, expanded=false;

  function clamp(val,min,max){return Math.max(min,Math.min(max,val));}
  function updateBoxPos(x,y){
    // 保證整個expander完全可見
    var exw = expander.offsetWidth || (BTN_WIDTH+24), exh = expander.offsetHeight || (BTN_HEIGHT*3+BTN_SPACE*2+24);
    var minX = 8, maxX = window.innerWidth - exw - 8;
    var minY = 8, maxY = window.innerHeight - exh - 8;
    if(expanded){
      x = clamp(x, minX, maxX);
      y = clamp(y, minY, maxY);
    }else{
      x = clamp(x, 8, window.innerWidth-PANEL_SIZE-8);
      y = clamp(y, 8, window.innerHeight-PANEL_SIZE-8);
    }
    boxX = x; boxY = y;
    box.style.left = boxX + "px";
    box.style.top  = boxY + "px";
  }
  // 拖曳
  function dragStart(ev){
    dragging=true;
    var evt = ev.touches ? ev.touches[0] : ev;
    dx = evt.clientX - boxX;
    dy = evt.clientY - boxY;
    document.addEventListener(ev.touches?'touchmove':'mousemove', dragMove);
    document.addEventListener(ev.touches?'touchend':'mouseup', dragEnd);
    emoji.style.cursor='grabbing';
    ev.preventDefault();
  }
  function dragMove(ev){
    var evt = ev.touches ? ev.touches[0] : ev;
    updateBoxPos(evt.clientX-dx, evt.clientY-dy);
    if(expanded) setTimeout(adjustExpander, 10);
    ev.preventDefault();
  }
  function dragEnd(ev){
    dragging=false;
    emoji.style.cursor='grab';
    document.removeEventListener('mousemove', dragMove);
    document.removeEventListener('mouseup', dragEnd);
    document.removeEventListener('touchmove', dragMove);
    document.removeEventListener('touchend', dragEnd);
    ev.preventDefault();
  }
  emoji.addEventListener('mousedown', dragStart, {passive:false});
  emoji.addEventListener('touchstart', dragStart, {passive:false});

  // 展開自動調整expander不超出
  function adjustExpander(){
    var exw = expander.offsetWidth, exh = expander.offsetHeight;
    if(!expanded) return;
    // 若超右
    if(boxX+exw+8 > window.innerWidth) boxX = window.innerWidth-exw-8;
    // 若超下
    if(boxY+exh+8 > window.innerHeight) boxY = window.innerHeight-exh-8;
    // 若超左
    if(boxX<8) boxX=8;
    // 若超上
    if(boxY<8) boxY=8;
    box.style.left = boxX+"px";
    box.style.top = boxY+"px";
  }

  // 展開/收合
  function openBox(){
    expanded = true;
    box.classList.add('expanded');
    expander.focus();
    host.style.pointerEvents='auto';
    adjustExpander();
  }
  function closeBox(){
    expanded = false;
    box.classList.remove('expanded');
    host.style.pointerEvents='none';
  }
  emoji.onclick = function(e){ if(!expanded) openBox(); e.stopPropagation(); };
  emoji.onkeydown = function(e){ if((e.key===" "||e.key==="Enter")&&!expanded){openBox();e.preventDefault();} };

  // 點expander外收合
  root.addEventListener('mousedown', function(e){
    if(expanded && !box.contains(e.target)) closeBox();
  });

  // 按鈕事件
  expander.querySelectorAll('.tool-btn').forEach(function(btn,i){
    btn.onclick = function(e){BTN_LIST[i].action();}
  });

  // 熱鍵
  window.addEventListener('keydown', function(e){
    if(!expanded) return;
    BTN_LIST.forEach((b,i)=>{
      if(e.altKey && e.key===b.hotkey){
        e.preventDefault();
        expander.querySelectorAll('.tool-btn')[i].click();
      }
    });
    if(e.key==="Escape"){closeBox();}
  });

  // 一鍵關閉
  closeBtn.onclick = function(){
    document.querySelectorAll('my-floating-toolbox-root').forEach(el=>el.remove());
  };

  // 展開時自動調整
  window.addEventListener('resize', function(){ if(expanded) setTimeout(adjustExpander,30); });
  // 初始化定位
  setTimeout(()=>updateBoxPos(boxX, boxY),30);

})();
