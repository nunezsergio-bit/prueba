import React, { useState } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const nav = useNavigate();
  const submit = async e=>{
    e.preventDefault();
    try{
      await api.post('/auth/login',{ email, password });
      nav('/dashboard');
    }catch(err){ alert('Login failed') }
  }
  return (
    <div style={{padding:20}}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div><input placeholder='email' value={email} onChange={e=>setEmail(e.target.value)} /></div>
        <div><input placeholder='password' type='password' value={password} onChange={e=>setPassword(e.target.value)} /></div>
        <button>Login</button>
      </form>
      <p>Seed admin: admin@example.com / Admin123!</p>
    </div>
  )
}
