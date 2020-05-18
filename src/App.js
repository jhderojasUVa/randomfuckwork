import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [color, setColor] = useState('dark');

  function pageReload() {
    window.location.reload();
  }

  function changeMode() {
    if (color == 'dark') {
      setColor('light');
    } else {
      setColor('dark');
    }
  }

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
  
  let appClass = 'App-header ' + color;
  return (
    <div className="App">
      <div className="App-mode" onClick={changeMode}>
        <p className={color}>{color.toUpperCase()} mode</p>
      </div>
      <header className={appClass}>
        <p onClick={pageReload}>
          FUCK <strong>{randomData}</strong>
        </p>
      </header>
    </div>
  );
}

export default App;

