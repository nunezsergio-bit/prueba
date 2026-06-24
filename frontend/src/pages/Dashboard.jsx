import React, { useEffect, useState } from 'react'
import api from '../api'
import { Link } from 'react-router-dom'

export default function Dashboard(){
  const [sites,setSites]=useState([]);
  useEffect(()=>{ api.get('/sites').then(r=>setSites(r.data)) },[])
  return (
    <div style={{padding:20}}>
      <h2>Dashboard</h2>
      <Link to='/items/new'>Crear nuevo item</Link>
      <h3>Sedes</h3>
      <ul>{sites.map(s=> <li key={s.id}><Link to={'/items?site='+s.id}>{s.name}</Link></li>)}</ul>
    </div>
  )
}
