// Pole Schedule calculation (Way B): subTotal = total(board+consumer) - reusable. Credit is display-only.
export function calc(d){
  const side=s=>{const len={},qty={};
    for(const r of s.rows){
      for(const [n,m] of Object.entries(r.conductor||{}))len[n]=(len[n]||0)+(+r.span||0)*(+m||0);
      for(const [k,q] of Object.entries(r.qty||{}))qty[k]=(qty[k]||0)+(+q||0);}
    const add=Object.entries(len).filter(([n])=>n.startsWith('AAAC')).reduce((a,[,v])=>a+v,0);
    const five=Math.round(add*d.gstPercent);return {len,qty,add,five,total:add+five}};
  const sides=Object.fromEntries(Object.entries(d.sides).map(([k,s])=>[k,side(s)]));
  const all=Object.values(sides),colTotals={};
  all.forEach(s=>Object.entries(s.qty).forEach(([k,q])=>colTotals[k]=(colTotals[k]||0)+q));
  const acsr=all.reduce((a,s)=>a+(s.len['ACSR 7/2.59']||0),0);
  const total=all.reduce((a,s)=>a+s.total,0);
  const credit=d.creditMaterial.mode==='manual'?+d.creditMaterial.value||0:acsr;
  return {sides,colTotals,add:all.reduce((a,s)=>a+s.add,0),five:all.reduce((a,s)=>a+s.five,0),total,
    reusable:+d.reusable.value||0,credit,subTotal:total-(+d.reusable.value||0)};
}
