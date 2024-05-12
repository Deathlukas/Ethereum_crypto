import React, { useState, useEffect } from "react";
import PriceRecharts from "./Recharts";
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
                const dateParts = data.timestamp.split(' '); 
                const formattedDateParts = dateParts[0].split(','); 
                const formattedTime = dateParts[1];
                const formattedDate = `${formattedDateParts[2]}-${formattedDateParts[1]}-${formattedDateParts[0]}`;
                setTimestamp(`${formattedDate} ${formattedTime}`);
            })
            .catch((error) => {
                console.error('Error:', error);
                setTimestamp('Loading...');
            });
    }, 30000);

    return () => clearInterval(interval);
}, []);

return (
    <div className="App relative flex flex-col items-center justify-center h-screen" style={{ backgroundColor: "#37367b" }}>
      <div className="header py-8 text-7xl text-white mt-12" style={{ position: "absolute", top: 0, left: 0, right: 0, textAlign: "center" }}>
        <h1>Ethereum</h1>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center w-full mt-24">
        <div className="md:w-1/2 p-4 flex justify-center">
          <PriceRecharts />
        </div>
        <div className="md:w-1/2 p-4 flex justify-center">
          <div className="text-white">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-4xl mr-4">Price:</h1>
              <p className="text-3xl">{price}</p>
            </div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl mr-4">Volume:</h2>
              <p className="text-2xl">{volume}</p>
            </div>
            <div className="flex justify-between items-center">
              <h3 className="text-2xl mr-4">Timestamp:</h3>
              <p>{timestamp}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;