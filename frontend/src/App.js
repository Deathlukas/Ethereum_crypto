import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [price, setPrice] = useState('Loading...');
  const [volume, setVolume] = useState('Loading...');
  const [timestamp, setTimestamp] = useState('Loading...');

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
                setPrice(data.price);
            })
            .catch((error) => console.error('Error:', error));

        fetch("http://localhost:8000/volume")
            .then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    throw new Error('Volume not available yet');
                }
            })
            .then((data) => {
                console.log(data.volume);
                setVolume(data.volume);
            })
            .catch((error) => console.error('Error:', error));

          fetch("http://localhost:8000/timestamp")
            .then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    throw new Error('Timestamp not available yet');
                }
            })
            .then((data) => {
                console.log(data.timestamp);
                const date = new Date(data.timestamp);
                setTimestamp(date.toLocaleString());
            })
            .catch((error) => {
                console.error('Error:', error);
                setTimestamp('Loading...');
            });
    }, 1000); // Fetch the price every second

    

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
}, []);

return (
  <div className="App flex items-center justify-center h-screen bg-blue-500">
    <h1 className="text-4xl text-white">Price: {price}</h1>
    <h2 className="text-3xl text-white">Volume: {volume}</h2>
    <h3 className="text-2xl text-white">Timestamp: {timestamp}</h3>
  </div>
);
}

export default App;