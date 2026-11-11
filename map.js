/* Topic edges are curated navigation associations, not bibliographic citations. */
const areas=[
{id:'a0',label:'Human–AI interaction',character:'The Communicator',icon:'robot',color:'#79c0ff',x:240,y:200,description:'Conversational agents, Theory of Mind, and shared task understanding.'},
{id:'a1',label:'Narrative & creativity',character:'The Storyweaver',icon:'wizard',color:'#d2a8ff',x:660,y:200,description:'Story generation, annotation, and narrative sensemaking.'},
{id:'a2',label:'Learning',character:'The Explorer',icon:'explorer',color:'#7ee787',x:660,y:490,description:'Learning experiences supported by interactive and generative AI.'},
{id:'a3',label:'Trustworthy AI',character:'The Guardian',icon:'guardian',color:'#f78166',x:240,y:490,description:'Alignment, safety, and reliable human–AI collaboration.'}];
areas.push(
{id:'a4',label:'Reinforcement learning',character:'The Strategist',icon:'robot',color:'#ffa657',description:'Quantum and classical reinforcement learning, uncertainty, and planning.'},
{id:'a5',label:'Health & behavior',character:'The Healer',icon:'guardian',color:'#ff9bce',description:'Health interventions, mindfulness, behavior, and embodied human experience.'},
{id:'a6',label:'Speech & acoustics',character:'The Listener',icon:'robot',color:'#56d4dd',description:'Speech, emotion recognition, spatial audio, and acoustic modeling.'},
{id:'a7',label:'Information exploration',character:'The Navigator',icon:'explorer',color:'#e3b341',description:'Exploration of information, data, networks, and archival materials.'},
{id:'a8',label:'Other / review',character:'The Archivist',icon:'wizard',color:'#8b949e',description:'Entries whose titles do not support a confident topic assignment. Review the original record.'}
);
const paperLayout=[
{x:90,y:345,short:['Fluent but Fragile'],areas:['a0','a3'],why:'Shared task interpretation connects human–AI interaction with questions about the reliability of AI collaboration.'},
{x:450,y:350,short:['Contract Negotiation','Learning'],areas:['a0','a2'],why:'Interactive generative agents connect conversational interaction with negotiation learning.'},
{x:90,y:75,short:['Speech Emotion','Recognition'],areas:['a0'],why:'Speech emotion recognition is a capability relevant to human-facing conversational interfaces.'},
{x:275,y:60,short:['Theory of Mind','in Human–AI'],areas:['a0'],why:'Theory of Mind is studied here in the context of human–AI interaction.'},
{x:475,y:80,short:['Reflections','& Resonance'],areas:['a0','a1'],why:'A two-agent partnership for story annotation connects agent interaction with computational narrative.'},
{x:90,y:580,short:['Bergeron'],areas:['a3'],why:'The conscience-based alignment framework addresses robustness against adversarial attacks.'},
{x:810,y:350,short:['Visual Story','Generation'],areas:['a1'],why:'Emotion- and keyword-guided story generation connects this work with computational narrative and creative AI.'},
{x:800,y:75,short:['Image Understanding','& Sensemaking'],areas:['a1'],why:'This work uses sensemaking and narrative for image understanding.'}];
const mapNodes=[...areas.map(a=>({...a,type:'area'})),...papers.map((p,i)=>({...(paperLayout[i]||{}),...p,id:'p'+i,label:p.title,short:paperLayout[i]?.short||shortLabel(p.title),type:'paper',why:p.classificationNote}))];
function shortLabel(title){const words=title.split(/\s+/),lines=[''];for(const w of words){if((lines.at(-1)+' '+w).length>22&&lines.length<2)lines.push(w);else if((lines.at(-1)+' '+w).length<=24)lines[lines.length-1]+=(lines.at(-1)?' ':'')+w;else{lines[lines.length-1]+='…';break}}return lines}
const mapEdges=papers.flatMap((p,i)=>p.areaIds.map(a=>['p'+i,a]));
let scopeId='',mapPage=0;
const perPage=12;
const scopeSelect=document.querySelector('#map-scope');
for(const a of areas)scopeSelect.add(new Option(a.label,a.id));
scopeSelect.onchange=()=>{scopeId=scopeSelect.value;mapPage=0;quest=null;selected=scopeId||'a0';drawMap();showDetail();updateQuest()};
function layoutVisible(){let nodes,edges,total=0;
if(!quest&&!scopeId){nodes=areas.map(a=>nodeById(a.id));nodes.forEach((n,i)=>{n.x=150+(i%3)*300;n.y=100+Math.floor(i/3)*220});edges=[];for(let i=0;i<areas.length;i++)for(let j=i+1;j<areas.length;j++)if(papers.some(p=>p.areaIds.includes(areas[i].id)&&p.areaIds.includes(areas[j].id)))edges.push([areas[i].id,areas[j].id]);}
else{const root=quest?quest.path.at(-1):scopeId;const connected=neighbors(root);total=connected.length;mapPage=Math.min(mapPage,Math.max(0,Math.ceil(total/perPage)-1));const subset=connected.slice(mapPage*perPage,(mapPage+1)*perPage);const ids=[...new Set([root,...subset,...(quest?[...quest.path,quest.to]:[]),...(!quest&&selected.startsWith('p')?[selected]:[])])];nodes=ids.map(nodeById);const center=nodeById(root);center.x=450;center.y=330;const outer=nodes.filter(n=>n!==center);outer.forEach((n,i)=>{const angle=-Math.PI/2+i*Math.PI*2/outer.length;n.x=450+330*Math.cos(angle);n.y=330+245*Math.sin(angle)});const set=new Set(ids);edges=mapEdges.filter(([a,b])=>set.has(a)&&set.has(b));}
document.querySelector('#map-pagination').hidden=!total;document.querySelector('#map-page-count').textContent=total?`${mapPage*perPage+1}–${Math.min((mapPage+1)*perPage,total)} of ${total} connected nodes`:'';document.querySelector('#map-prev').disabled=mapPage===0;document.querySelector('#map-next').disabled=(mapPage+1)*perPage>=total;scopeSelect.value=scopeId;return {nodes,edges};}
document.querySelector('#map-prev').onclick=()=>{if(mapPage>0){mapPage--;drawMap()}};document.querySelector('#map-next').onclick=()=>{mapPage++;drawMap()};
const nodeById=id=>mapNodes.find(n=>n.id===id);
function neighbors(id){return mapEdges.flatMap(([a,b])=>a===id?[b]:b===id?[a]:[])}
function shortestPath(from,to){const queue=[[from]],seen=new Set([from]);for(let i=0;i<queue.length;i++){const path=queue[i],last=path[path.length-1];if(last===to)return path;for(const n of neighbors(last))if(!seen.has(n)){seen.add(n);queue.push([...path,n])}}return []}
const graph=document.querySelector('#paper-graph'),detail=document.querySelector('#node-detail'),findNode=document.querySelector('#map-find');
let selected='a0',quest=null,zoom=1,missionIndex=-1;
const missions=[['p5','a1'],['p7','a3'],['p2','a2'],['p6','a3'],['p3','a1'],['p1','a1']];
const ns='http://www.w3.org/2000/svg';
function svgEl(tag,attrs={}){const el=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))el.setAttribute(k,v);return el}
function htmlEl(tag,text,cls){const el=document.createElement(tag);if(text)el.textContent=text;if(cls)el.className=cls;return el}
function edgeInPath(a,b){if(!quest)return false;return quest.path.some((v,i)=>i>0&&((v===a&&quest.path[i-1]===b)||(v===b&&quest.path[i-1]===a)))}
function drawMap(){const visible=layoutVisible();graph.replaceChildren();const bg=svgEl('defs');const pattern=svgEl('pattern',{id:'grid-dots',width:24,height:24,patternUnits:'userSpaceOnUse'});pattern.append(svgEl('circle',{cx:1,cy:1,r:1,class:'grid-dot'}));bg.append(pattern);graph.append(bg,svgEl('rect',{width:900,height:660,fill:'url(#grid-dots)'}));
for(const [a,b]of visible.edges){const n=nodeById(a),m=nodeById(b),onRoute=edgeInPath(a,b),connected=a===selected||b===selected;graph.append(svgEl('line',{x1:n.x,y1:n.y,x2:m.x,y2:m.y,class:'graph-edge'+(connected?' connected':'')+(onRoute?' on-route':''),'aria-hidden':'true'}))}
const allowed=quest&&!quest.finished?neighbors(quest.path.at(-1)):[];
for(const n of visible.nodes){const current=quest&&quest.path.at(-1)===n.id,target=quest&&quest.to===n.id;const g=svgEl('g',{transform:`translate(${n.x} ${n.y})`,class:'graph-node '+n.type+(selected===n.id?' selected':'')+(allowed.includes(n.id)?' reachable':'')+(current?' current':'')+(target?' target':'')+(target&&quest.finished?' won-target':''),role:'button',tabindex:0,'aria-label':n.label+(n.type==='paper'?' — '+n.year:' — research area')+(current?' — current position':'')+(target?' — destination':''),'aria-pressed':String(selected===n.id)});
if(n.type==='area'){g.append(svgEl('rect',{x:-98,y:-49,width:196,height:104,rx:12,class:'area-node-bg',stroke:n.color}));const img=svgEl('image',{href:`assets/${n.icon}.svg`,x:-27,y:-43,width:54,height:54,'aria-hidden':'true'});g.append(img);const label=svgEl('text',{x:0,y:31,'text-anchor':'middle',class:'area-label'});label.textContent=n.label;g.append(label)}else{g.append(svgEl('circle',{r:20,class:'paper-node-bg'}));const symbol=svgEl('text',{'text-anchor':'middle',y:6,class:'paper-glyph'});symbol.textContent='▤';g.append(symbol);n.short.forEach((t,i)=>{const label=svgEl('text',{x:0,y:39+i*15,'text-anchor':'middle',class:'paper-node-label'});label.textContent=t;g.append(label)});const y=svgEl('text',{x:0,y:-29,'text-anchor':'middle',class:'paper-node-year'});y.textContent=n.year||'Undated';g.append(y)}
if(current||target){const flag=svgEl('text',{x:n.type==='area'?83:27,y:n.type==='area'?-58:-16,class:'map-flag','text-anchor':'middle'});flag.textContent=target&&quest.finished?'✓':target?'⚑':'●';g.append(flag)}
g.onclick=()=>activateNode(n.id);g.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activateNode(n.id)}};graph.append(g)}updateViewBox();}
function showDetail(){const n=nodeById(selected);detail.replaceChildren();if(n.type==='area'){const img=htmlEl('img');img.src=`assets/${n.icon}.svg`;img.alt=n.character+' pixel character';img.className='detail-sprite';detail.append(img,htmlEl('p',n.character,'eyebrow'),htmlEl('h3',n.label),htmlEl('p',n.description));}else detail.append(htmlEl('p',(n.year||'Undated')+' / SCHOLAR ENTRY','eyebrow'),htmlEl('h3',n.label),htmlEl('p',n.authors,'detail-authors'),htmlEl('p',n.venue||'Venue not listed on Scholar','source-note'),htmlEl('p',n.why,'association-note'));
if(n.type==='paper'){const a=htmlEl('a','Open paper record ↗','button primary');a.href=n.url;a.target='_blank';a.rel='noopener';detail.append(a);if(n.pdf){const pdf=htmlEl('a','Read PDF ↗','button');pdf.href=n.pdf;pdf.target='_blank';pdf.rel='noopener';detail.append(pdf)}}
detail.append(htmlEl('h4',n.type==='area'?'Connected papers':'Connected research areas'));for(const id of neighbors(n.id)){const neighbor=nodeById(id),b=htmlEl('button',neighbor.label,'connection-button');b.onclick=()=>activateNode(id);detail.append(b)}findNode.value=selected;}
function activateNode(id){selected=id;if(!quest){const n=nodeById(id);if(n.type==='area'){scopeId=id;mapPage=0}else if(!scopeId||!neighbors(scopeId).includes(id)){scopeId=n.areaIds[0];mapPage=Math.floor(neighbors(scopeId).indexOf(id)/perPage)}else mapPage=Math.floor(neighbors(scopeId).indexOf(id)/perPage)}if(quest&&!quest.finished){const current=quest.path.at(-1);if(id!==current){if(neighbors(current).includes(id)){quest.path.push(id);mapPage=0;if(id===quest.to)quest.finished=true;quest.feedback=''}else quest.feedback='That node is not connected to your current position. Follow a highlighted link.'}}drawMap();showDetail();updateQuest();}
for(const n of mapNodes)findNode.add(new Option((n.type==='area'?'Area · ':'Paper · ')+n.label,n.id));findNode.onchange=()=>{if(findNode.value)activateNode(findNode.value)};
function updateViewBox(){const w=900/zoom,h=660/zoom;graph.setAttribute('viewBox',`${(900-w)/2} ${(660-h)/2} ${w} ${h}`)}
document.querySelector('#zoom-in').onclick=()=>{zoom=Math.min(1.8,zoom+.2);updateViewBox()};document.querySelector('#zoom-out').onclick=()=>{zoom=Math.max(.8,zoom-.2);updateViewBox()};document.querySelector('#reset-map').onclick=()=>{zoom=1;updateViewBox()};
function updateQuest(){const panel=document.querySelector('#quest-panel');panel.hidden=!quest;
const complete=document.querySelector('#quest-complete');
complete.hidden=!(quest&&quest.finished);
if(quest&&quest.finished){
 const moves=quest.path.length-1;
 document.querySelector('#quest-complete-summary').textContent='You reached '+nodeById(quest.to).label+' in '+moves+' moves. '+(moves===quest.optimal?'You found a shortest route!':'Shortest possible: '+quest.optimal+' moves.')+' Hints used: '+quest.hints+'.';
 if(!quest.completionShown){quest.completionShown=true;document.querySelector('#quest-complete-title').focus({preventScroll:true});complete.scrollIntoView?.({block:'nearest',behavior:'auto'});}
}else if(quest)quest.completionShown=false;
document.querySelector('#browse-map').setAttribute('aria-pressed',String(!quest));document.querySelector('#quest-mode').setAttribute('aria-pressed',String(!!quest));if(!quest)return;const start=nodeById(quest.from),end=nodeById(quest.to),moves=quest.path.length-1;document.querySelector('#quest-goal').textContent=`From “${start.short.join(' ')}” to ${end.label}`;document.querySelector('#quest-status').textContent=quest.finished?`Destination reached in ${moves} moves! Shortest possible: ${quest.optimal} moves.${moves===quest.optimal&&!quest.hints?' Perfect route!':''} Hints used: ${quest.hints}.`:`Click a connected node to travel. Current: ${nodeById(quest.path.at(-1)).label}. Moves: ${moves}. Gold links show your route; outlined nodes are your next steps.`;document.querySelector('#quest-feedback').textContent=quest.feedback||'';const trail=document.querySelector('#quest-path');trail.replaceChildren();quest.path.forEach((id,i)=>{if(i)trail.append(htmlEl('span','→'));const n=nodeById(id);trail.append(htmlEl('span',n.type==='area'?n.label:n.short.join(' '),'route-chip'))});document.querySelector('#undo-step').disabled=quest.path.length<2;document.querySelector('#quest-hint').disabled=quest.finished;
const choices=document.querySelector('#quest-next-moves');choices.replaceChildren();
if(quest.finished){const b=htmlEl('button','Play another challenge →','next-move-button');b.onclick=newQuest;choices.append(b);}
else for(const id of neighbors(quest.path.at(-1))){const n=nodeById(id),b=htmlEl('button','Go to '+(n.type==='area'?n.label:n.short.join(' '))+' →','next-move-button');b.onclick=()=>activateNode(id);choices.append(b);}}
function newQuest(){missionIndex=(missionIndex+1)%missions.length;const [from,to]=missions[missionIndex];quest={from,to,path:[from],optimal:shortestPath(from,to).length-1,hints:0,finished:false,feedback:''};selected=from;mapPage=0;zoom=1;drawMap();showDetail();updateQuest()}
document.querySelector('#quest-mode').onclick=newQuest;document.querySelector('#new-quest').onclick=newQuest;document.querySelector('#browse-map').onclick=()=>{quest=null;scopeId='';mapPage=0;drawMap();showDetail();updateQuest()};document.querySelector('#undo-step').onclick=()=>{if(quest&&quest.path.length>1){quest.path.pop();quest.finished=false;quest.feedback='';selected=quest.path.at(-1);drawMap();showDetail();updateQuest()}};document.querySelector('#restart-quest').onclick=()=>{quest.path=[quest.from];quest.finished=false;quest.feedback='';quest.hints=0;selected=quest.from;drawMap();showDetail();updateQuest()};document.querySelector('#quest-hint').onclick=()=>{if(!quest||quest.finished)return;const path=shortestPath(quest.path.at(-1),quest.to);quest.hints++;quest.feedback='Next step on a shortest route: '+nodeById(path[1]).label;updateQuest()};
document.querySelectorAll('[data-map-area]').forEach(b=>b.onclick=()=>{quest=null;selected=b.dataset.mapArea;scopeId=selected;mapPage=0;zoom=1;drawMap();showDetail();updateQuest();location.hash='map'});
drawMap();showDetail();updateQuest();

document.querySelector('#quest-exit').onclick=()=>document.querySelector('#browse-map').onclick();


document.querySelector('#quest-next-challenge').onclick=newQuest;
