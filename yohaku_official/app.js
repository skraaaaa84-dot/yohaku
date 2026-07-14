const SUPABASE_URL="https://bzgoalrhazqxugiesgqp.supabase.co";
const SUPABASE_KEY="sb_publishable_JMCOs1W_r_BqSoVJ5__HdA_G24_ugrJ";
const POEMS_API=SUPABASE_URL+"/rest/v1/poems";
const EDITORIAL_API=SUPABASE_URL+"/rest/v1/editorial_settings";
const BOOKMARK_KEY="yohaku-bookmarks-official";

const editorialPoem={id:"editorial-001",poem:`ようこそ
ここはまだ
始まったばかり
最初の言葉を
待っています`,author:"編集室",mood:"はじまり",echoes:0,created_at:new Date().toISOString(),editorial:true};

let userPoems=[],poems=[editorialPoem],currentDetail=0,journeyIndex=0,journeyHistory=[];
let bookmarks=JSON.parse(localStorage.getItem(BOOKMARK_KEY)||"[]");
let editorialSettings={title:"この場所は、まだ始まったばかりです。",body:"うまく言えなかったことも、誰にも見せられなかった言葉も、ここでは急がなくて大丈夫です。\n\nあなたの一首を、静かにお待ちしています。",weekly_theme:"窓",theme_note:"窓の向こうに見えたもの、窓越しに言えなかったこと。",selected_poem_id:null,closing_message:"今日も、誰かの言葉が、\n誰かを少しだけ救っていますように。"};

const headers=(extra={})=>({apikey:SUPABASE_KEY,Authorization:"Bearer "+SUPABASE_KEY,...extra});
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const quotes=[`今日も、誰かが
言葉を置いていった。`,`急がなくて、大丈夫です。
言葉はここで待っています。`,`あなたの言えなかったことは、
誰かの言いたかったことかもしれない。`,`今日は、どんな言葉に
出会えるでしょう。`];

function showPage(name){document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));document.getElementById("page-"+name).classList.add("active");window.scrollTo({top:0,behavior:"smooth"})}
function notice(text,title="お知らせ"){document.getElementById("noticeTitle").textContent=title;document.getElementById("noticeText").innerHTML=esc(text).replace(/\n/g,"<br>");document.getElementById("notice").classList.add("show");setTimeout(()=>document.getElementById("notice").classList.remove("show"),2200)}
function poeticTime(s){const d=new Date(s),m=Math.floor((Date.now()-d)/60000);if(m<1)return"たった今";if(m<60)return"今日 "+d.toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit"});if(m<1440)return d.getHours()<10?"今朝":d.getHours()<17?"今日の午後":d.getHours()<21?"今日の夕方":"今夜";if(m<2880)return"昨日";return new Intl.DateTimeFormat("ja-JP",{month:"long",day:"numeric"}).format(d)}
function isToday(s){const d=new Date(s),n=new Date();return d.toDateString()===n.toDateString()}

async function loadPoems(){try{const r=await fetch(POEMS_API+"?select=id,created_at,author,poem,mood,echoes&order=created_at.desc",{headers:headers()});if(!r.ok)throw new Error(await r.text());userPoems=await r.json();poems=[editorialPoem,...userPoems];renderAll()}catch(e){console.error(e);notice("作品を読み込めませんでした。ページを再読み込みしてください。")}}
async function loadEditorial(){try{const r=await fetch(EDITORIAL_API+"?select=*&order=updated_at.desc&limit=1",{headers:headers()});if(r.ok){const rows=await r.json();if(rows.length)editorialSettings={...editorialSettings,...rows[0]};renderEditorial()}}catch(e){console.error(e)}}

function renderAll(){renderHome();renderPoems();renderBookmarks();renderEditorial()}
function renderHome(){const featured=userPoems[0]||editorialPoem;document.getElementById("heroPoem").innerHTML=esc(featured.poem).replace(/\n/g,"<br>");document.getElementById("todayPoem").textContent=featured.poem;document.getElementById("todayAuthor").textContent=featured.author;document.getElementById("todayMood").textContent="#"+featured.mood;document.getElementById("todayCount").innerHTML=userPoems.filter(p=>isToday(p.created_at)).length+"<small>首</small>";document.getElementById("openToday").onclick=()=>openDetail(poems.findIndex(p=>String(p.id)===String(featured.id)));document.getElementById("todayStage").onclick=document.getElementById("openToday").onclick}
function renderPoems(){const list=document.getElementById("poemList");if(!userPoems.length){list.innerHTML=`<div class="empty"><strong>まだ、この場所は静かです。</strong><p>あなたの一首が、最初に届く言葉になるかもしれません。</p><button class="text-button" data-page="write">余白に置く</button></div>`;bindPageButtons();return}list.innerHTML=poems.map((p,i)=>`<article class="poem-row"><div class="no">${String(i+1).padStart(2,"0")}</div><p data-open="${i}">${esc(p.poem)}</p><div class="poem-meta"><button data-author="${esc(p.author)}">BY ${esc(p.author)}</button><span>#${esc(p.mood)}</span><span>${p.editorial?"編集室より":poeticTime(p.created_at)}</span><span>${p.echoes?`${p.echoes}人が共鳴しました。`:"まだ誰にも共鳴されていません。"}</span></div></article>`).join("");document.querySelectorAll("[data-open]").forEach(x=>x.onclick=()=>openDetail(Number(x.dataset.open)));document.querySelectorAll("[data-author]").forEach(x=>x.onclick=()=>openAuthor(x.dataset.author))}
function renderBookmarks(){const works=userPoems.filter(p=>bookmarks.includes(String(p.id)));const sec=document.getElementById("bookmarksSection");sec.hidden=!works.length;document.getElementById("bookmarksList").innerHTML=works.map(p=>`<article class="bookmark-item" data-open="${poems.findIndex(x=>String(x.id)===String(p.id))}"><div class="no">栞</div><p>${esc(p.poem)}</p><small>— ${esc(p.author)}</small></article>`).join("");document.querySelectorAll(".bookmark-item").forEach(x=>x.onclick=()=>openDetail(Number(x.dataset.open)))}
function renderEditorial(){document.getElementById("editorialTitle").textContent=editorialSettings.title;document.getElementById("editorialBody").textContent=editorialSettings.body;["homeTheme","writeTheme","editorialTheme"].forEach(id=>document.getElementById(id).textContent="「"+editorialSettings.weekly_theme+"」");["homeThemeNote","editorialThemeNote"].forEach(id=>document.getElementById(id).textContent=editorialSettings.theme_note);document.getElementById("editorialClosing").textContent=editorialSettings.closing_message;const selected=userPoems.find(p=>String(p.id)===String(editorialSettings.selected_poem_id));document.getElementById("selectedPoem").textContent=selected?selected.poem:"まだ選ばれていません。";document.getElementById("selectedAuthor").textContent=selected?"— "+selected.author:"編集室"}

function openDetail(i){currentDetail=Math.max(0,i);const p=poems[currentDetail];document.getElementById("detailNo").textContent=String(currentDetail+1).padStart(2,"0");document.getElementById("detailPoem").textContent=p.poem;document.getElementById("detailMeta").innerHTML=`BY ${esc(p.author)}<br>#${esc(p.mood)}<br>${p.editorial?"編集室より":poeticTime(p.created_at)}<br><br>${p.echoes?`${p.echoes}人が共鳴しました。`:"まだ誰にも共鳴されていません。"}`;document.getElementById("echoButton").textContent=p.echoes?`共鳴する　${p.echoes}`:"共鳴する";document.getElementById("bookmarkButton").textContent=bookmarks.includes(String(p.id))?"栞を外す":"栞を挟む";showPage("detail")}
function openAuthor(name){const works=poems.filter(p=>p.author===name);document.getElementById("authorName").textContent=name;const moods=[...new Set(works.map(p=>p.mood))];document.getElementById("authorCount").textContent=`作品 ${works.length}首　気配 ${moods.slice(0,3).join("・")}`;document.getElementById("authorWorks").innerHTML=works.map((p,i)=>`<article class="poem-row"><div class="no">${String(i+1).padStart(2,"0")}</div><p>${esc(p.poem)}</p><div class="poem-meta"><span>#${esc(p.mood)}</span></div></article>`).join("");showPage("author")}

async function echoCurrent(){const p=poems[currentDetail];if(p.editorial)return notice("編集室の一首には、まだ共鳴できません。");try{const r=await fetch(SUPABASE_URL+"/rest/v1/rpc/increment_poem_echo",{method:"POST",headers:headers({"Content-Type":"application/json"}),body:JSON.stringify({poem_id_input:Number(p.id)})});if(!r.ok)throw new Error(await r.text());await loadPoems();notice("あなたの気持ちが、この一首に重なりました。")}catch(e){console.error(e);notice("共鳴を残せませんでした。")}}
function toggleBookmark(){const p=poems[currentDetail];if(p.editorial)return notice("編集室の一首には栞を挟めません。");const id=String(p.id);bookmarks=bookmarks.includes(id)?bookmarks.filter(x=>x!==id):[id,...bookmarks];localStorage.setItem(BOOKMARK_KEY,JSON.stringify(bookmarks));renderBookmarks();openDetail(currentDetail);notice(bookmarks.includes(id)?"栞を挟みました。":"栞を外しました。")}
function downloadCard(){const p=poems[currentDetail],c=document.createElement("canvas"),x=c.getContext("2d");c.width=1080;c.height=1350;x.fillStyle="#f7f5ef";x.fillRect(0,0,1080,1350);x.fillStyle="#171816";x.font="500 52px serif";x.fillText("余白",90,110);x.fillStyle="#7d9da8";x.font="400 20px serif";x.fillText("Y O H A K U",90,150);x.fillStyle="#171816";x.font="500 48px serif";let y=360;p.poem.split("\n").forEach(line=>{x.fillText(line,150,y);y+=105});x.fillStyle="#666";x.font="400 24px serif";x.fillText("— "+p.author,150,1160);const a=document.createElement("a");a.download=`yohaku-${p.id}.png`;a.href=c.toDataURL();a.click()}

function drift(){const pool=userPoems.length?userPoems:[editorialPoem];const p=pool[Math.floor(Math.random()*pool.length)];document.getElementById("driftPoem").textContent=p.poem;document.getElementById("driftAuthor").textContent="— "+p.author;showPage("drift")}
function nextJourney(){const pool=userPoems.length?userPoems:[editorialPoem];const p=pool[Math.floor(Math.random()*pool.length)];journeyIndex=poems.findIndex(x=>String(x.id)===String(p.id));journeyHistory.push(p.mood);if(journeyHistory.length>5)journeyHistory.shift();document.getElementById("journeyPath").textContent=journeyHistory.join("　→　");document.getElementById("journeyPoem").textContent=p.poem;document.getElementById("journeyMeta").textContent="— "+p.author+"　#"+p.mood}
function startJourney(){journeyHistory=[];nextJourney();showPage("journey")}

function bindPageButtons(){document.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>showPage(b.dataset.page))}
bindPageButtons();
document.getElementById("heroQuote").innerHTML=quotes[Math.floor(Math.random()*quotes.length)].replace(/\n/g,"<br>");
document.getElementById("season").textContent=["冬","冬","春","春","春","夏","夏","夏","秋","秋","秋","冬"][new Date().getMonth()].padStart(2,"— ");
document.getElementById("todayDate").textContent=document.getElementById("editorialDate").textContent=new Intl.DateTimeFormat("ja-JP",{year:"numeric",month:"long",day:"numeric"}).format(new Date());
document.getElementById("volume").textContent=new Intl.DateTimeFormat("ja-JP",{year:"numeric",month:"2-digit"}).format(new Date())+" / VOL.01";
document.getElementById("writeThemeButton").onclick=document.getElementById("editorialWrite").onclick=()=>showPage("write");
document.getElementById("toggleBookmarks").onclick=()=>document.getElementById("bookmarksList").classList.toggle("open");
document.getElementById("prevPoem").onclick=()=>openDetail((currentDetail-1+poems.length)%poems.length);
document.getElementById("nextPoem").onclick=()=>openDetail((currentDetail+1)%poems.length);
document.getElementById("echoButton").onclick=echoCurrent;
document.getElementById("bookmarkButton").onclick=toggleBookmark;
document.getElementById("cardButton").onclick=downloadCard;
document.getElementById("navDrift").onclick=drift;
document.getElementById("driftAgain").onclick=drift;
document.getElementById("navJourney").onclick=startJourney;
document.getElementById("journeyNext").onclick=nextJourney;
document.getElementById("journeyOpen").onclick=()=>openDetail(journeyIndex);

document.getElementById("poemForm").onsubmit=async e=>{e.preventDefault();const btn=e.submitter,poem=document.getElementById("poemInput").value.trim();if(!poem)return;btn.disabled=true;btn.textContent="お預かりしています…";try{const r=await fetch(POEMS_API,{method:"POST",headers:headers({"Content-Type":"application/json","Prefer":"return=representation"}),body:JSON.stringify({poem,author:document.getElementById("nameInput").value.trim()||"匿名",mood:document.getElementById("moodInput").value,echoes:0})});if(!r.ok)throw new Error(await r.text());e.target.reset();await loadPoems();showPage("home");notice("あなたの言葉を、お預かりしました。","ありがとうございます。")}catch(err){console.error(err);notice("投稿できませんでした。")}finally{btn.disabled=false;btn.textContent="余白に置く。"}};

const observer=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add("visible")),{threshold:.1});document.querySelectorAll(".reveal").forEach(x=>observer.observe(x));
if(new Date().getHours()>=22||new Date().getHours()<5)document.body.classList.add("night");
setTimeout(()=>document.getElementById("splash")?.remove(),3300);
loadPoems();loadEditorial();
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js"));
