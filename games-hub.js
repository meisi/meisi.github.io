(()=>{
const map=document.querySelector('#map'),host=document.querySelector('#connection-slot'),main=document.querySelector('main'),play=document.querySelector('#play');
const runner=document.querySelector('#runner-panel'),review=document.querySelector('#review-panel'),status=document.querySelector('#games-selection-status');
const names={connection:'Connection Quest',runner:'Conference Quest',review:'Review Lab'};
let selected=null;
function sync(){
 const onGames=location.hash==='#play';
 if(onGames&&selected==='connection'){host.append(map);map.hidden=false;host.hidden=false}
 else{if(map.parentElement!==main)main.insertBefore(map,play);map.hidden=location.hash!=='#map';host.hidden=true}
 runner.hidden=!onGames||selected!=='runner';review.hidden=!onGames||selected!=='review';
 document.querySelectorAll('[data-game]').forEach(b=>b.setAttribute('aria-pressed',String(onGames&&b.dataset.game===selected)));
 status.textContent=selected?'Now playing: '+names[selected]+'. Choose another game above at any time.':'Select a game to begin.';
 window.dispatchEvent(new Event('gameschange'));
}
function choose(game){
 selected=game;location.hash='play';sync();
 if(game==='connection')newQuest();
 if(game==='runner')document.querySelector('#runner-start').click();
 if(game==='review')document.querySelector('#review-start').click();
}
document.querySelectorAll('[data-game]').forEach(b=>b.onclick=()=>choose(b.dataset.game));
document.querySelector('#quest-mode').onclick=()=>choose('connection');
document.querySelector('#quest-exit').onclick=()=>{location.hash='map';document.querySelector('#browse-map').onclick();sync()};
window.addEventListener('hashchange',sync);sync();
})();