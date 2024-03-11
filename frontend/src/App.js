import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/message")
      .then((res) => res.text())  // get the response text
      .then((text) => {
        console.log(text);  // log the response text
        setMessage(text);  // set the response text to your state
      })
      .catch((error) => console.error('Error:', error));  // log any errors
  }, []);

  return (
    <div className="App flex items-center justify-center h-screen bg-blue-500">
      <h1 className="text-4xl text-white">{message}</h1>
    </div>
  );
}

export default App;