import {useState,useEffect,useMemo} from 'react';
import SheetView from './SheetView.jsx'; import PoleSchedule from './PoleSchedule.jsx'; import {refsOf} from './engine.js';
import pole from './data/poleSchedule.json'; import cover from './data/cover.json'; import credit from './data/credit.json';
import reg from './data/regulation.json'; import rep from './data/reportaCopy.json'; import refr from './data/referance.json';
const KEY='estimate-app-v1',TABS=['Cover','Reporta copy','Pole schedule','Referance','Regulation','Credit'];
const init={pole,covers:[{}],credit:{},reg:{},rep:{},sig:null,orient:{Cover:'portrait','Reporta copy':'portrait','Pole schedule':'landscape',Referance:'portrait',Regulation:'landscape',Credit:'portrait'}};
const COVER_ED=new Set('A3 A4 A5 K3 K4 K5 A7 B11 B12 J12 B18 H18 B19 H19 E24'.split(' '));
const cmap=d=>Object.fromEntries(d.cells.map(c=>[c.a,c]));
const credC=cmap(credit),regC=cmap(reg);
const regInputs=new Set(reg.cells.filter(c=>typeof c.v==='number'&&!c.f).map(c=>c.a));
reg.cells.forEach(c=>c.f&&refsOf(c.f).forEach(a=>!regC[a]&&regInputs.add(a)));
reg.cells.forEach(c=>typeof c.v==='string'&&/LT tail end/.test(c.v)&&regInputs.add(c.a));
const satRows=reg.cells.filter(c=>/^Satisfactory$/.test(c.v)).map(c=>c.a);
const regDerive=(a,get)=>{if(!satRows.includes(a))return;const p=get('P'+a.slice(1));return typeof p==='number'?(p<=5.99?'Satisfactory':'Not Satisfactory'):undefined};
const W={portrait:718,landscape:1047};
export default function App(){
  const [s,setS]=useState(()=>{try{return {...init,...JSON.parse(localStorage.getItem(KEY))}}catch{return init}});
  const [tab,setTab]=useState(TABS[0]),[all,setAll]=useState(false);
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify(s))},[s]);
  useEffect(()=>{const f=()=>setAll(false);addEventListener('afterprint',f);return()=>removeEventListener('afterprint',f)},[]);
  const up=(k,v)=>setS(p=>({...p,[k]:v})),edit=k=>(a,v)=>setS(p=>({...p,[k]:{...p[k],[a]:v}}));
  const printAll=()=>{setAll(true);setTimeout(()=>print(),150)};
  const exp=()=>{const u=URL.createObjectURL(new Blob([JSON.stringify(s,null,1)],{type:'application/json'}));Object.assign(document.createElement('a'),{href:u,download:'estimate-data.json'}).click()};
  const imp=e=>{const f=e.target.files[0];f&&f.text().then(t=>setS({...init,...JSON.parse(t)}))};
  const sig=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>up('sig',r.result);r.readAsDataURL(f)};
  const Page=(name,key,child)=>{const o=s.orient[name];return <section key={key} className={'page '+o}>
    <div className="noprint bar"><b>{name}</b> <select value={o} onChange={e=>up('orient',{...s.orient,[name]:e.target.value})}><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></div>
    {child(W[o])}{s.sig&&<div className="sig"><img src={s.sig} alt="signature"/></div>}</section>};
  const pages={
    'Cover':()=>s.covers.map((o,i)=>Page('Cover','c'+i,w=><>
      <div className="noprint bar">Cover {i+1} <button onClick={()=>up('covers',[...s.covers,{...o}])}>+ நகல்</button>{s.covers.length>1&&<button onClick={()=>up('covers',s.covers.filter((_,j)=>j!==i))}>நீக்கு</button>}</div>
      <SheetView data={cover} width={w} ov={o} isEditable={a=>COVER_ED.has(a)} onEdit={(a,v)=>up('covers',s.covers.map((x,j)=>j===i?{...x,[a]:v}:x))}/></>)),
    'Reporta copy':()=>Page('Reporta copy','r',w=><><label className="noprint"><input type="checkbox" checked={!!s.showHidden} onChange={e=>up('showHidden',e.target.checked)}/> மறைக்கப்பட்ட வரிசைகளைக் காட்டு (Applicant detail, Regulation, Estimate cost)</label>
      <SheetView data={rep} width={w} ov={s.rep} showHidden={s.showHidden} isEditable={(a,c)=>!c[a]?.f&&!!c[a]} onEdit={edit('rep')}/></>),
    'Pole schedule':()=>Page('Pole schedule','p',()=><PoleSchedule d={s.pole} set={v=>up('pole',v)}/>),
    'Referance':()=>Page('Referance','f',w=><SheetView data={refr} width={w}/>),
    'Regulation':()=>Page('Regulation','g',w=><SheetView data={reg} width={w} ov={s.reg} derive={regDerive} isEditable={a=>regInputs.has(a)} onEdit={edit('reg')}/>),
    'Credit':()=>Page('Credit','d',w=><SheetView data={credit} width={w} ov={s.credit} isEditable={a=>/^[CD]\d+$/.test(a)&&typeof credC['A'+a.slice(1)]?.v==='number'&&+a.slice(1)>2} onEdit={edit('credit')}/>)};
  return <div><header className="noprint"><nav>{TABS.map(t=><button key={t} className={t===tab?'on':''} onClick={()=>setTab(t)}>{t}</button>)}</nav>
    <div className="tools"><button onClick={()=>print()}>🖨 இந்தத் தாள்</button><button onClick={printAll}>🖨 அனைத்தும்</button>
      <label className="btn">✍ கையொப்பம்<input hidden type="file" accept="image/*" onChange={sig}/></label>{s.sig&&<button onClick={()=>up('sig',null)}>கையொப்பம் நீக்கு</button>}
      <button onClick={exp}>⬇ JSON</button><label className="btn">⬆ JSON<input hidden type="file" accept=".json" onChange={imp}/></label>
      <button onClick={()=>confirm('அனைத்தையும் மீட்டமை?')&&setS(init)}>Reset</button></div></header>
    <main>{(all?TABS:[tab]).map(t=><div key={t}>{pages[t]()}</div>)}</main></div>}
