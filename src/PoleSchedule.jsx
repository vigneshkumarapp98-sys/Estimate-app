import {calc} from './calc.js';
const num=v=>v===''||v==null?'':v;
export default function PoleSchedule({d,set}){
  const R=calc(d),cc=d.conductorColumns,upd=fn=>{const n=structuredClone(d);fn(n);set(n)};
  const addCol=()=>{const l=prompt('Material பெயர்?');if(l)upd(n=>n.columns.push({key:'X'+Date.now(),label:l,group:'main'}))};
  const delCol=k=>confirm('இந்த நெடுவரிசையை நீக்கவா?')&&upd(n=>{n.columns=n.columns.filter(c=>c.key!==k);Object.values(n.sides).forEach(s=>s.rows.forEach(r=>delete r.qty[k]))});
  const addRow=s=>upd(n=>n.sides[s].rows.push({loc:'',span:'',conductor:{},qty:{}}));
  const delRow=(s,i)=>upd(n=>n.sides[s].rows.splice(i,1));
  const clrRow=(s,i)=>upd(n=>{const r=n.sides[s].rows[i];r.span='';r.conductor={};r.qty={}});
  const Cell=(s,r,i,c)=>{
    if(c.key in cc){const n=cc[c.key],m=r.conductor?.[n];
      return <td key={c.key}><input className="mult" title="multiplier" value={num(m)} onChange={e=>upd(x=>{x.sides[s].rows[i].conductor[n]=e.target.value===''?undefined:+e.target.value})}/>
        <b>{m&&r.span?`×${r.span} = ${r.span*m}`:''}</b></td>}
    return <td key={c.key}><input value={num(r.qty?.[c.key])} onChange={e=>upd(x=>{x.sides[s].rows[i].qty[c.key]=e.target.value===''?undefined:+e.target.value})}/></td>};
  const body=Object.entries(d.sides).map(([s,sd])=>{const S=R.sides[s];return [
    <tr key={s+'h'}><th colSpan={2+d.columns.length} className="side">{sd.label} <button className="noprint" onClick={()=>addRow(s)}>+ வரிசை</button></th></tr>,
    ...sd.rows.map((r,i)=><tr key={s+i}>
      <td><input value={r.loc} onChange={e=>upd(x=>{x.sides[s].rows[i].loc=e.target.value})}/></td>
      <td><input value={num(r.span)} onChange={e=>upd(x=>{x.sides[s].rows[i].span=e.target.value===''?'':+e.target.value})}/>
        <span className="noprint"><button title="Clear" onClick={()=>clrRow(s,i)}>⌫</button><button title="Delete" onClick={()=>delRow(s,i)}>✕</button></span></td>
      {d.columns.map(c=>Cell(s,r,i,c))}</tr>),
    <tr key={s+'a'} className="sum"><td colSpan={2}>Add</td>{d.columns.map(c=><td key={c.key}>{c.key in cc?S.len[cc[c.key]]||'':''}</td>)}</tr>,
    <tr key={s+'p'} className="sum"><td colSpan={2}>{d.gstPercent*100}%</td>{d.columns.map(c=><td key={c.key}>{cc[c.key]?.startsWith('AAAC')?S.five:''}</td>)}</tr>,
    <tr key={s+'t'} className="sum"><td colSpan={2}>Total</td>{d.columns.map(c=><td key={c.key}>{cc[c.key]?.startsWith('AAAC')?S.total:S.qty[c.key]||''}</td>)}</tr>]});
  const D=Object.keys(cc).find(k=>cc[k]==='AAAC 7/2.50'),span=2+d.columns.length;
  return <div>
    <h3>{d.title}</h3>
    <div className="noprint bar"><button onClick={addCol}>+ Material நெடுவரிசை</button></div>
    <div className="scroll"><table className="pole"><thead><tr><th>Loc No</th><th>Span (m)</th>
      {d.columns.map(c=><th key={c.key} className={c.group}>{c.label}<span className="noprint"> <a onClick={()=>delCol(c.key)}>✕</a></span></th>)}</tr></thead>
    <tbody>{body}
      <tr className="sum"><td colSpan={2}>Credit Materials</td><td colSpan={span-2}>
        <label><input type="checkbox" checked={d.creditMaterial.mode==='auto'} onChange={e=>upd(n=>{n.creditMaterial.mode=e.target.checked?'auto':'manual';n.creditMaterial.value=R.credit})}/> தானியங்கி (ACSR 2.59)</label>
        <input className="amt" disabled={d.creditMaterial.mode==='auto'} value={R.credit} onChange={e=>upd(n=>{n.creditMaterial.value=+e.target.value})}/> <i>(Sub Total-ல் கழிக்கப்படாது)</i></td></tr>
      <tr className="sum"><td colSpan={2}>Reusable Materials</td><td colSpan={span-2}><input className="amt" value={d.reusable.value} onChange={e=>upd(n=>{n.reusable.value=+e.target.value})}/></td></tr>
      <tr className="sum grand"><td colSpan={2}>Sub Total</td>{d.columns.map(c=><td key={c.key}>{c.key===D?R.subTotal:(R.colTotals[c.key]||'')}</td>)}</tr>
    </tbody></table></div>
    <p>Total {R.total} − Reusable {R.reusable} = <b>{R.subTotal}</b></p></div>}
