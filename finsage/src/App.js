import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginSignup from "./LoginSignup";
import "./App.css";

function App() 
{
return (
    <Router>
    <div className="App">
        <Routes>
        <Route path="/" element={<LoginSignup />} />
        </Routes>
    </div>
    </Router>
);
}

export default App;
