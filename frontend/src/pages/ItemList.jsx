import React, { useEffect, useState } from 'react'
import api from '../api'
import { useLocation } from 'react-router-dom'

function useQuery(){ return new URLSearchParams(useLocation().search) }

export default function ItemList(){
  const q = useQuery();
  const site = q.get('site');
  const [items,setItems]=useState([]);
  useEffect(()=>{ api.get('/items'+(site?('?site='+site):'')).then(r=>setItems(r.data)) },[site])
  return (
    <div style={{padding:20}}>
      <h2>Items {site ? (' - Sede '+site) : ''}</h2>
      <button onClick={async ()=>{ const r=await api.get('/export'+(site?('?site='+site):''), { responseType:'blob' }); const url=URL.createObjectURL(r.data); const a=document.createElement('a'); a.href=url; a.download='export.csv'; a.click(); }}>Exportar CSV</button>
      <ul>{items.map(i=> <li key={i.id}>{i.name} (Fotos: {i.photos?.length||0})</li>)}</ul>
    </div>
  )
}
