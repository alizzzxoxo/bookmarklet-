javascript:(function(){
if(window.__MY_TOOLBOX) {
  window.__MY_TOOLBOX.style.display='block';
  return;
}
window.__MY_TOOLBOX=1;
var toolList=[
  // 這裡請依需求增減功能
  {name:"導師篩選", url:"https://yourdomain.com/bookmarklet-tutor.js", hotkey:"1"},
  {name:"自動填表", url:"https://yourdomain.com/bookmarklet-autofill.js", hotkey:"2"},
  {name:"批次複製", url:"https://yourdomain.com/bookmarklet-copy.js", hotkey:"3"},
  //{name:"自訂功能", url:"...", hotkey:"4"},
];

var box=document.createElement("div");
box.id="__MY_TOOLBOX";
box.innerHTML='<div style="font-weight:bold;font-size:17px;margin-bottom:6px;">工具箱 <span id="tbx_hide" title="隱藏">－</span> <span id="tbx_close" title="關閉">✕</span></div>';
box.style.cssText="position:fixed;bottom:22px;right:22px;z-index:999999;background:#fffbe6;border:2px solid #b3b3b3;padding:12px 18px 15px 18px;box-shadow:2px 2px 16px #0002;border-radius:13px;font-size:15px;user-select:none;min-width:200px;max-width:90vw;transition:box-shadow .2s;";

var btnArea=document.createElement("div");
btnArea.style.margin="6px 0 0 0";
toolList.forEach(function(tool,i){
  var btn=document.createElement("button");
  btn.textContent=tool.name+(tool.hotkey?(" (Alt+"+tool.hotkey+")"):"");
  btn.setAttribute("data-hotkey",tool.hotkey||"");
  btn.style.cssText="margin:0 7px 7px 0;padding:4px 13px 4px 13px;border-radius:7px;border:1.2px solid #b3b3b3;background:#f6f6ea;cursor:pointer;font-size:15px;transition:background .15s;";
  btn.onmouseenter=function(){btn.style.background="#ffe066";}
  btn.onmouseleave=function(){btn.style.background="#f6f6ea";}
  btn.onclick=function(){
    var s=document.createElement('script'); s.src=tool.url;
    document.body.appendChild(s);
  };
  btnArea.appendChild(btn);
});
box.appendChild(btnArea);

// 隱藏、關閉按鈕
box.querySelector("#tbx_hide").style.cssText="font-size:17px;margin-left:12px;cursor:pointer;color:#888;";
box.querySelector("#tbx_hide").onclick=function(){ box.style.display="none"; };
box.querySelector("#tbx_close").style.cssText="font-size:17px;margin-left:7px;cursor:pointer;color:#c44;";
box.querySelector("#tbx_close").onclick=function(){ box.remove(); window.__MY_TOOLBOX=0; };

// 拖曳功能
box.onmousedown=function(e){
  if(e.target!==box&&e.target!==box.firstChild) return;
  e.preventDefault();
  var x0=e.clientX, y0=e.clientY, r0=box.getBoundingClientRect();
  var move=function(e2){
    box.style.right="auto";box.style.bottom="auto";
    box.style.left=(r0.left+e2.clientX-x0)+"px";
    box.style.top=(r0.top+e2.clientY-y0)+"px";
  };
  var up=function(){ document.removeEventListener("mousemove",move); document.removeEventListener("mouseup",up);}
  document.addEventListener("mousemove",move);
  document.addEventListener("mouseup",up);
}

// 支援鍵盤熱鍵 Alt+數字
document.addEventListener("keydown",function(e){
  if(!window.__MY_TOOLBOX || box.style.display==='none') return;
  if(e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.repeat){
    for(var i=0;i<toolList.length;i++){
      if(toolList[i].hotkey && e.key===toolList[i].hotkey){
        btnArea.children[i].click();
        e.preventDefault();
        return false;
      }
    }
  }
},true);

// 預設加到body最後
document.body.appendChild(box);
})();
