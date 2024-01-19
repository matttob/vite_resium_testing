import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import './index.css'

import Home from './home.jsx'
import Layout from "./Layout.jsx"
import About from "./About.jsx"

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <Routes>
    <Route element={<Layout />}>
      <Route path="/" element={<Home />}/>
      <Route path="/about" element={<About />}/>
    </Route>
  </Routes>
</BrowserRouter>,
)



