import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

function PriceRecharts() {
    const [data, setData] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            Promise.all([
                fetch("http://localhost:8000/price"),
                fetch("http://localhost:8000/timestamp")
            ])

        .then(([priceRes, timestampRes]) => Promise.all([priceRes.json(), timestampRes.json()]))
        .then(([priceData, timestampData]) => {
            const date = new Date(timestampData.timestamp);
            setData(oldData => [...oldData, {timestamp: date.toLocaleString(), price: priceData.price}]);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }, 30000); // Fetch the price and timestamp every second

            // Clean up the interval on component unmount
            return () => clearInterval(interval);
}, []);

return (
    <LineChart width={500} height={300} data={data}>
        <Line type="monotone" dataKey="price" stroke="red" dot={true} fill="red" area={true} />
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip />
        <Legend />
    </LineChart>
);
}
    





export default PriceRecharts;