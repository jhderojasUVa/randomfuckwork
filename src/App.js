import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [color, setColor] = useState('dark');
  const [wikipedia, setWikipedia] = useState(false);
  const [itscalled, setItscalled] = useState(true);

  function pageReload() {
    setItscalled(false);
    reDo();
  }
  
  function changeFrom() {
    if (wikipedia === true) {
      setWikipedia(false);
      setItscalled(false);

      fechWikiPediaData();
    } else {
      setWikipedia(true);
      setItscalled(false);

      fetchData();
    }
  }

  function changeMode() {
    if (color === 'dark') {
      setColor('light');
    } else {
      setColor('dark');
    }
  }

  function reDo() {
    if (wikipedia === true && itscalled === false) {
      fechWikiPediaData();
      setItscalled(true);
    } else if (wikipedia === false && itscalled === false) {
      fetchData();
      setItscalled(true);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const dataFetched = await axios.get('storage/arraystorage.json');

      setData(dataFetched.data);
    }
    fetchData();
    setItscalled(true);
  }, []);
  
  const fechWikiPediaData = async () => {
    const dataFetched = await axios.get('https://en.wikipedia.org/api/rest_v1/page/random/summary');

    const stringTitle = {string: dataFetched.data.title};

    setData([stringTitle]);
  }

  const fetchData = async () => {
    const dataFetched = await axios.get('storage/arraystorage.json');

    setData(dataFetched.data);
  } 

  let randomData = '(click again)';

  if (data.length > 0 && wikipedia === false) {
    randomData = data[Math.floor(Math.random() * data.length)].string;
  } else if (wikipedia === true) {
    randomData = data[0].string;
  }
  
  let appClass = 'App-header ' + color;
  return (
    <div className="App">
      <div className="App-where">
        <p className={color} onClick={changeFrom}>{wikipedia ? 'Wikipedia' : 'Internal'}</p>
      </div>
      <div className="App-mode">
        <p className={color} onClick={changeMode}>{color.toUpperCase()} mode</p>
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

