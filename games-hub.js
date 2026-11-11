(()=>{
const map=document.querySelector('#map'),host=document.querySelector('#connection-slot'),main=document.querySelector('main'),play=document.querySelector('#play');
const runner=document.querySelector('#runner-panel'),review=document.querySelector('#review-panel'),status=document.querySelector('#games-selection-status');
function sync(){
 const onGames=location.hash==='#play';
 if(onGames){host.append(map);map.hidden=false;host.hidden=false;runner.hidden=false;review.hidden=false;if(!quest)newQuest()}
 else{if(map.parentElement!==main)main.insertBefore(map,play);map.hidden=location.hash!=='#map';host.hidden=true;runner.hidden=true;review.hidden=true}
 status.textContent='All three games are below. Scroll to play, or use the shortcuts above.';
 window.dispatchEvent(new Event('gameschange'));
}
function jump(game){
 location.hash='play';sync();
 const section=game==='connection'?host:game==='runner'?runner:review;
 requestAnimationFrame(()=>section.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));
}
document.querySelectorAll('[data-game]').forEach(b=>b.onclick=()=>jump(b.dataset.game));
document.querySelector('#quest-mode').onclick=()=>{location.hash='play';sync();newQuest();host.scrollIntoView({block:'start',behavior:'auto'})};
document.querySelector('#quest-exit').onclick=()=>{location.hash='map';document.querySelector('#browse-map').onclick();sync()};
window.addEventListener('hashchange',sync);sync();
})();