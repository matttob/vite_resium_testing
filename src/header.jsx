import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import './home.css'

export default function Header() {
    return (
<header className="nav-bar">
    <Link to="/" className="trito-logo" >
        <img src="./Tritonia_White.png" alt=" "  className="trito-logo"/>
    </Link>    
    <Link to="/" className="logo-text">
        Hydrophis
    </Link>
    <nav className="nav-bar-text">
        <Link>LOGIN</Link> 
        <Link>CONTACT</Link> 
        <Link to="/About">ABOUT</Link>  
    </nav>
</header>

)
}


