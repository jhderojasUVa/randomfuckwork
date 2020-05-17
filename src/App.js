import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const dataFetched = await axios.get('storage/arraystorage.json');

      setData(dataFetched.data);
    } 

    fetchData();
  }, []);

  let randomData = 'yourself';
  if (data.length > 0) {
    randomData = data[Math.floor(Math.random() * data.length)].string;
  }
  
  return (
    <div className="App">
      <header className="App-header">
        <p>
          FUCK <strong>{randomData}</strong>
        </p>
      </header>
    </div>
  );
}

export default App;

