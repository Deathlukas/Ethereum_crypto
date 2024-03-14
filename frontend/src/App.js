import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    const interval = setInterval(() => {
        fetch("http://localhost:8000/price")
            .then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    throw new Error('Price not available yet');
                }
            })
            .then((data) => {
                console.log(data.price);
                setMessage(data.price);
            })
            .catch((error) => console.error('Error:', error));
    }, 1000); // Fetch the price every second

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
}, []);

  return (
    <div className="App flex items-center justify-center h-screen bg-blue-500">
      <h1 className="text-4xl text-white">{message}</h1>
    </div>
  );
}

export default App;