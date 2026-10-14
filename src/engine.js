// Mini Excel formula evaluator (SUM, ROUND, IF, CHOOSE, MAX, MIN, ABS, AND, OR, SQRT)
const col=s=>[...s].reduce((a,c)=>a*26+c.charCodeAt(0)-64,0);
export const colName=n=>{let s='';while(n){s=String.fromCharCode(65+(n-1)%26)+s;n=Math.floor((n-1)/26)}return s};
const nums=a=>a.flat(Infinity).filter(x=>typeof x==='number');
const F={SUM:(...a)=>nums(a).reduce((s,x)=>s+x,0),ROUND:(x,n=0)=>{const m=10**n;return Math.round((x+Number.EPSILON)*m)/m},
 IF:(c,a,b=false)=>c?a:b,CHOOSE:(i,...a)=>a[i-1],MAX:(...a)=>Math.max(...nums(a)),MIN:(...a)=>Math.min(...nums(a)),
 ABS:Math.abs,AND:(...a)=>a.every(Boolean),OR:(...a)=>a.some(Boolean),SQRT:Math.sqrt};
export const refsOf=f=>[...f.matchAll(/(?<![A-Za-z"])\$?\b([A-Z]{1,3})\$?(\d+)\b(?![("])/g)].map(m=>m[1]+m[2]);
function compile(f){
  const body=f.slice(1).split(/("[^"]*")/).map((p,i)=>i%2?p:p
    .replace(/\$?([A-Z]{1,3})\$?(\d+):\$?([A-Z]{1,3})\$?(\d+)/g,'R("$1$2","$3$4")')
    .replace(/(?<![A-Za-z"])\$?\b([A-Z]{1,3})\$?(\d+)\b(?![("])/g,'V("$1$2")')
    .replace(/<>/g,'!=').replace(/(?<![<>!=])=(?!=)/g,'==').replace(/\^/g,'**')).join('');
  return new Function('V','R',...Object.keys(F),'return '+body);
}
export function evaluate(data,ov={}){
  const cells=Object.fromEntries(data.cells.map(c=>[c.a,c])),memo={},fns={};
  const get=a=>{
    if(a in ov){const x=ov[a];return x!==''&&!isNaN(x)?Number(x):x}
    if(a in memo)return memo[a];
    const c=cells[a]; if(!c)return 0;
    let v=c.v;
    if(c.f&&c.f.length>1){memo[a]=v;
      try{fns[a]??=compile(c.f);const r=fns[a](get,rng,...Object.values(F));if(r!==undefined&&!(typeof r==='number'&&!isFinite(r)))v=r}catch{}}
    return memo[a]=v;
  };
  const rng=(a,b)=>{const [,c1,r1]=/([A-Z]+)(\d+)/.exec(a),[,c2,r2]=/([A-Z]+)(\d+)/.exec(b),o=[];
    for(let r=+r1;r<=+r2;r++)for(let c=col(c1);c<=col(c2);c++)o.push(get(colName(c)+r));return o};
  return get;
}
