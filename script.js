'use strict';
const toggle=document.querySelector('.menu-toggle');
const navigation=document.querySelector('#navigation');
function closeMenu(){navigation.classList.remove('open');toggle.setAttribute('aria-expanded','false');}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));navigation.classList.toggle('open',open);});
navigation.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){closeMenu();toggle.focus();}});
matchMedia('(min-width:1051px)').addEventListener('change',closeMenu);
const boards=[...document.querySelectorAll('[data-board]')];
let loading=false;
async function refreshBoards(){
 if(loading)return;loading=true;document.querySelector('#refresh').disabled=true;
 const results=await Promise.all(boards.map(card=>new Promise(resolve=>{
  const n=card.dataset.board,probe=new Image();let done=false;
  const finish=(ok)=>{if(done)return;done=true;clearTimeout(timeout);probe.onload=null;probe.onerror=null;
   const link=card.querySelector('.board-image');link.hidden=!ok;card.querySelector('.board-message').hidden=ok;card.querySelector('.board-number').hidden=ok;
   card.querySelector('.board-status').textContent=ok?'Tavle hentet':'Afventer';
   if(ok)link.querySelector('img').src=probe.src;
   card.querySelector('.board-message').textContent='Afventer live-data';resolve(ok);
  };
  const timeout=setTimeout(()=>finish(false),9000);probe.onload=()=>finish(true);probe.onerror=()=>finish(false);
  probe.src=`https://billardklubbengilleleje.dk/bord${n}/bord${n}.jpg?t=${Date.now()}`;
 })));
 const n=results.filter(Boolean).length;
 document.querySelector('#score-status').textContent=`${n} af 4 tavler hentet · Kontrolleret ${new Date().toLocaleTimeString('da-DK',{hour:'2-digit',minute:'2-digit'})}. Opdateres hvert 15. sekund. Tavlens kampdato og resultat kommer fra klubben; en hentet tavle betyder ikke, at kampen er live.`;
 loading=false;document.querySelector('#refresh').disabled=false;
}
document.querySelector('#refresh').addEventListener('click',refreshBoards);
refreshBoards();setInterval(()=>{if(!document.hidden)refreshBoards();},15000);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const motionButton=document.querySelector('#motion-toggle');
let paused=false;
motionButton.addEventListener('click',()=>{paused=!paused;document.body.classList.toggle('motion-paused',paused);motionButton.setAttribute('aria-pressed',String(paused));motionButton.textContent=paused?'Start effekter':'Pause effekter';motionButton.setAttribute('aria-label',paused?'Start bevægelige effekter':'Sæt bevægelige effekter på pause');resetDepth();});
function resetDepth(){boards.forEach(c=>c.style.transform='');document.querySelector('.hero-photo').style.transform='';}
for(const card of boards){card.addEventListener('pointermove',e=>{if(reduced.matches||paused||e.pointerType!=='mouse')return;const r=card.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(900px) rotateX(${-y*5}deg) rotateY(${x*5}deg) translateY(-3px)`;});card.addEventListener('pointerleave',()=>card.style.transform='');}
const hero=document.querySelector('.hero');
hero.addEventListener('pointermove',e=>{if(reduced.matches||paused||e.pointerType!=='mouse')return;const r=hero.getBoundingClientRect();document.querySelector('.hero-photo').style.transform=`scale(1.025) translate(${((e.clientX-r.left)/r.width-.5)*-9}px,${((e.clientY-r.top)/r.height-.5)*-6}px)`;});hero.addEventListener('pointerleave',resetDepth);reduced.addEventListener('change',resetDepth);
const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Copenhagen'}).format(new Date());
document.querySelectorAll('[data-date]').forEach(row=>{if(row.dataset.date<today)row.remove();});
if(!document.querySelector('[data-date]'))document.querySelector('#match-status').textContent='Den gemte kampoversigt er udløbet. Se kommende kampe hos DDBU.';
const backButton=document.querySelector('#back-button');
if(backButton){
 backButton.addEventListener('click',()=>{
   if(location.hash && location.hash!=='#forside'){location.hash='forside';return;}
   window.scrollTo({top:0,behavior:'smooth'});
 });
}