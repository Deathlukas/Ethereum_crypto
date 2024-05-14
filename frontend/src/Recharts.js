import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

function PriceRecharts() {
    const [data, setData] = useState([]);
    const [yMin, setYMin] = useState(0);
    const [yMax, setYMax] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("http://localhost:8000/alldata");
                const data = await response.json();
                const formattedData = data.map(item => ({
                    timestamp: new Date(item.timestamp),
                    price: parseFloat(item.price)
                }));
                setData(formattedData);

                const minValue = Math.min(...formattedData.map(item => item.price));
                const maxValue = Math.max(...formattedData.map(item => item.price));

                // Calculate the range
                const range = maxValue - minValue;

                // Calculate 10% of the range
                const padding = 0.1;
                const paddingAmount = range * padding;

                // Adjust min and max values by adding/subtracting 10% padding
                const adjustedMinValue = minValue - paddingAmount;
                const adjustedMaxValue = maxValue + paddingAmount;

                setYMin(adjustedMinValue);
                setYMax(adjustedMaxValue);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        const interval = setInterval(fetchData, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatYAxis = (tick) => {
        return tick.toFixed(0); // Format tick to show integer without decimals
    };

    const formatXAxis = (tick) => {
        const date = new Date(tick);
        const formattedDate = `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${date.getMinutes()}`; // Format timestamp to show date and minutes
        return formattedDate;
    };

    return (
        <LineChart width={1000} height={600} data={data}>
            <Line type="monotone" dataKey="price" stroke="red" dot={true} fill="red"/>  
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="timestamp" tickFormatter={formatXAxis} tick={false} />
            <YAxis domain={[yMin, yMax]} tickFormatter={formatYAxis} />
            <Tooltip />
            <Legend />
        </LineChart>
    );
}
    
export default PriceRecharts;