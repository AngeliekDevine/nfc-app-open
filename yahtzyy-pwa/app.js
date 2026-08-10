const CATEGORIES = [
  ["ones","Ones"],["twos","Twos"],["threes","Threes"],["fours","Fours"],["fives","Fives"],["sixes","Sixes"],
  ["threeKind","Three of a Kind"],["fourKind","Four of a Kind"],["fullHouse","Full House"],
  ["smallStraight","Small Straight"],["largeStraight","Large Straight"],["Yahtzyy","Yahtzyy"],["chance","Chance"]
];
const KEY="Yahtzyy-pwa-v1";
let state=load()||{players:[newPlayer("Player 1")],active:0,round:0,dice:[1,1,1,1,1],held:[false,false,false,false,false],rolls:0};

function newPlayer(name){return {name,scores:{}}}
function load(){try{return JSON.parse(localStorage.getItem(KEY))}catch{return null}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function toast(msg){const t=document.querySelector("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1400)}
function counts(){return state.dice.reduce((a,n)=>(a[n]=(a[n]||0)+1,a),{})}
function sum(){return state.dice.reduce((a,b)=>a+b,0)}
function hasStraight(n){let u=[...new Set(state.dice)].sort((a,b)=>a-b), run=1;for(let i=1;i<u.length;i++){if(u[i]===u[i-1]+1)run++;else run=1;if(run>=n)return true}return false}
function potential(key){
 const c=counts(), s=sum(), vals=Object.values(c);
 if(key==="ones")return state.dice.filter(x=>x===1).length;
 if(key==="twos")return state.dice.filter(x=>x===2).length*2;
 if(key==="threes")return state.dice.filter(x=>x===3).length*3;
 if(key==="fours")return state.dice.filter(x=>x===4).length*4;
 if(key==="fives")return state.dice.filter(x=>x===5).length*5;
 if(key==="sixes")return state.dice.filter(x=>x===6).length*6;
 if(key==="threeKind")return vals.some(x=>x>=3)?s:0;
 if(key==="fourKind")return vals.some(x=>x>=4)?s:0;
 if(key==="fullHouse")return vals.includes(3)&&vals.includes(2)?25:0;
 if(key==="smallStraight")return hasStraight(4)?30:0;
 if(key==="largeStraight")return hasStraight(5)?40:0;
 if(key==="Yahtzyy")return vals.includes(5)?50:0;
 if(key==="chance")return s;
}
function upper(p){return ["ones","twos","threes","fours","fives","sixes"].reduce((a,k)=>a+(p.scores[k]??0),0)}
function total(p){return Object.values(p.scores).reduce((a,b)=>a+b,0)+(upper(p)>=63?35:0)}
function renderDice(){
 const el=document.querySelector("#dice");el.innerHTML="";
 state.dice.forEach((n,i)=>{let b=document.createElement("button");b.className="die"+(state.held[i]?" held":"");b.textContent=n;b.title=state.held[i]?"Held":"Tap to hold";b.onclick=()=>{if(state.rolls){state.held[i]=!state.held[i];save();renderDice()}};el.appendChild(b)});
 document.querySelector("#rollLabel").textContent=`Roll ${state.rolls} / 3`;
 document.querySelector("#rollBtn").disabled=state.rolls>=3||state.round>=13;
 document.querySelector("#clearHoldsBtn").disabled=!state.held.some(Boolean);
}
function renderPlayers(){
 const el=document.querySelector("#players");el.innerHTML="";
 state.players.forEach((p,i)=>{let d=document.createElement("div");d.className="player"+(i===state.active?" active":"");
 const input=document.createElement("input");input.value=p.name;input.setAttribute("aria-label","Player name");input.onchange=()=>{p.name=input.value.trim()||`Player ${i+1}`;save();renderAll()};
 d.appendChild(input);
 if(state.players.length>1){let x=document.createElement("button");x.className="remove";x.textContent="×";x.onclick=()=>{state.players.splice(i,1);if(state.active>=state.players.length)state.active=state.players.length-1;save();renderAll()};d.appendChild(x)}
 d.onclick=(e)=>{if(e.target!==input&&e.target.tagName!=="BUTTON"){state.active=i;save();renderAll()}};
 el.appendChild(d)});
}
function renderScore(){
 const wrap=document.querySelector("#scoreTableWrap"), t=document.createElement("table");t.className="score-table";
 let h="<thead><tr><th>Category</th>"+state.players.map(p=>`<th>${escapeHtml(p.name)}</th>`).join("")+"</tr></thead><tbody>";
 h+=`<tr class="subhead"><td colspan="${state.players.length+1}">Upper Section</td></tr>`;
 for(const [k,n] of CATEGORIES.slice(0,6))h+=row(k,n);
 h+=`<tr class="total"><td>Upper Total</td>${state.players.map(p=>`<td>${upper(p)}</td>`).join("")}</tr>`;
 h+=`<tr class="total"><td>Bonus (63+)</td>${state.players.map(p=>`<td>${upper(p)>=63?35:0}</td>`).join("")}</tr>`;
 h+=`<tr class="subhead"><td colspan="${state.players.length+1}">Lower Section</td></tr>`;
 for(const [k,n] of CATEGORIES.slice(6))h+=row(k,n);
 h+=`<tr class="total"><td>Grand Total</td>${state.players.map(p=>`<td>${total(p)}</td>`).join("")}</tr></tbody>`;
 t.innerHTML=h;wrap.innerHTML="";let s=document.createElement("div");s.className="score-wrap";s.appendChild(t);wrap.appendChild(s);
 function row(k,n){return `<tr><td class="category">${n}</td>`+state.players.map((p,i)=>{let v=p.scores[k];if(v!==undefined)return `<td class="score-cell scored">${v}</td>`;let disabled=i!==state.active||state.rolls===0||state.round>=13;return `<td class="score-cell ${disabled?"":"available"}" data-key="${k}" data-player="${i}">${disabled?"—":potential(k)}</td>`}).join("")+"</tr>"}
 t.querySelectorAll(".available").forEach(c=>c.onclick=()=>score(c.dataset.player,c.dataset.key));
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function score(pi,key){
 if(+pi!==state.active||state.players[pi].scores[key]!==undefined||state.rolls===0)return;
 state.players[pi].scores[key]=potential(key);state.round++;
 state.active=(state.active+1)%state.players.length;
 state.dice=[1,1,1,1,1];state.held=[false,false,false,false,false];state.rolls=0;
 save();renderAll();toast(state.round>=13?"Game complete!":"Score recorded");
}
function roll(){
 if(state.rolls>=3||state.round>=13)return;
 state.dice=state.dice.map((v,i)=>state.held[i]?v:Math.floor(Math.random()*6)+1);
 state.rolls++;save();renderAll();
}
function reset(){if(confirm("Start a new game? Current scores will be erased.")){state={players:state.players.map((p,i)=>newPlayer(p.name||`Player ${i+1}`)),active:0,round:0,dice:[1,1,1,1,1],held:[false,false,false,false,false],rolls:0};save();renderAll()}}
document.querySelector("#rollBtn").onclick=roll;
document.querySelector("#clearHoldsBtn").onclick=()=>{state.held.fill(false);save();renderDice()};
document.querySelector("#addPlayerBtn").onclick=()=>{state.players.push(newPlayer(`Player ${state.players.length+1}`));save();renderAll()};
document.querySelector("#newGameBtn").onclick=reset;
function renderAll(){renderDice();renderPlayers();renderScore();document.querySelector("#roundLabel").textContent=state.round>=13?"Game Complete":`Round ${Math.min(state.round+1,13)} of 13`}
renderAll();
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
