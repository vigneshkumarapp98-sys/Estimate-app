import {useMemo,useRef,useLayoutEffect,useState} from 'react';
import {evaluate,colName} from './engine.js';
const cn=s=>[...s].reduce((a,c)=>a*26+c.charCodeAt(0)-64,0);
const fmt=v=>typeof v==='number'?String(+v.toFixed(4)):(v??'');
export default function SheetView({data,isEditable=()=>false,ov={},onEdit,derive,showHidden,width}){
  const get=useMemo(()=>evaluate(data,ov),[data,ov]);
  const val=a=>derive?.(a,get)??(a in ov?ov[a]:get(a));
  const cells=useMemo(()=>Object.fromEntries(data.cells.map(c=>[c.a,c])),[data]);
  const [,c2,r2]=/:([A-Z]+)(\d+)/.exec(data.range);const maxC=cn(c2),maxR=+r2;
  const anchors={},covered=new Set();
  data.merges.forEach(m=>{const [,a,b,c,d]=/([A-Z]+)(\d+):([A-Z]+)(\d+)/.exec(m);
    anchors[a+b]={cs:cn(c)-cn(a)+1,rs:+d-+b+1};
    for(let r=+b;r<=+d;r++)for(let k=cn(a);k<=cn(c);k++)if(!(r==+b&&k==cn(a)))covered.add(colName(k)+r)});
  const hid=new Set(showHidden?[]:data.hiddenRows.map(Number));
  const cw=Array.from({length:maxC},(_,i)=>{const w=data.colWidths[colName(i+1)];return Math.round((w?w:8.43)*7+5)});
  const total=cw.reduce((a,b)=>a+b,0),ref=useRef(),[z,setZ]=useState(1);
  useLayoutEffect(()=>setZ(Math.min(1,width/total)),[width,total]);
  const rows=[];
  for(let r=1;r<=maxR;r++){ if(hid.has(r))continue;
    const tds=[];
    for(let k=1;k<=maxC;k++){const a=colName(k)+r;if(covered.has(a))continue;
      const c=cells[a],m=anchors[a],bd=data.borders[a]||'',ed=isEditable(a,cells),v=val(a);
      const st={fontWeight:c?.b?700:400,textAlign:c?.al||(typeof v==='number'?'right':'left'),fontSize:c?.sz?c.sz*1.333:13,
        borderTop:bd.includes('t')?'1px solid #000':0,borderBottom:bd.includes('b')?'1px solid #000':0,
        borderLeft:bd.includes('l')?'1px solid #000':0,borderRight:bd.includes('r')?'1px solid #000':0};
      tds.push(<td key={a} colSpan={m?.cs} rowSpan={m?.rs} style={st} className={ed?'ed':''}>
        {ed?<span contentEditable suppressContentEditableWarning key={String(v)} onBlur={e=>onEdit(a,e.target.innerText)}>{fmt(v)}</span>:fmt(v)}</td>)}
    rows.push(<tr key={r} style={{height:(data.rowHeights[r]||15)*1.333}}>{tds}</tr>)}
  return <div ref={ref} style={{zoom:z}}><table className="sheet" style={{width:total}}>
    <colgroup>{cw.map((w,i)=><col key={i} style={{width:w}}/>)}</colgroup><tbody>{rows}</tbody></table></div>;
}
