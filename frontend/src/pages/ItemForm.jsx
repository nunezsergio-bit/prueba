import React, { useState } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'

export default function ItemForm(){
  const [name,setName]=useState('');
  const [site,setSite]=useState('1');
  const [files,setFiles]=useState([]);
  const nav = useNavigate();
  const submit = async e=>{
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', name);
    fd.append('site_id', site);
    for (const f of files) fd.append('photos', f);
    try{
      await api.post('/items', fd, { headers: {'Content-Type':'multipart/form-data'} });
      alert('Creado'); nav('/items');
    }catch(err){ console.error(err); alert('Error') }
  }
  return (
    <div style={{padding:20}}>
      <h2>Nuevo item</h2>
      <form onSubmit={submit}>
        <div><input placeholder='Nombre' value={name} onChange={e=>setName(e.target.value)} /></div>
        <div><input placeholder='Site id' value={site} onChange={e=>setSite(e.target.value)} /></div>
        <div><input type='file' multiple onChange={e=>setFiles(Array.from(e.target.files))} /></div>
        <button>Crear</button>
      </form>
    </div>
  )
}
