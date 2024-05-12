import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area } from 'recharts';

function PriceRecharts() {
    const [data, setData] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            fetch("http://localhost:8000/alldata")
                .then(response => response.json())
                .then(data => {
                    const formattedData = data.map(item => ({
                        timestamp: new Date(item.timestamp).toLocaleString(),
                        price: parseFloat(item.price)
                    }));
                    setData(formattedData);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

return (
    <LineChart width={1000} height={600} data={data}>
        <Line type="monotone" dataKey="price" stroke="red" dot={true} fill="red"/>  
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip />
        <Legend />
    </LineChart>
);
}
    
export default PriceRecharts;