import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [color, setColor] = useState('dark');
  const [wikipedia, setWikipedia] = useState(false);
  const [isLoading, setLoading] = useState(false);

  function pageReload() {
    reDo();
  }
  
  function changeFrom() {
    if (wikipedia === true) {
      setWikipedia(false);
      pageReload();
    } else {
      setWikipedia(true);
      pageReload();
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
    if (wikipedia === true) {
      setLoading(true);
      fechWikiPediaData();
    } else if (wikipedia === false) {
      fetchData();
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const dataFetched = await axios.get('storage/arraystorage.json');

      setData(dataFetched.data);
    }
    fetchData();
  }, []);
  
  const fechWikiPediaData = async () => {
    const dataFetched = await axios.get('https://en.wikipedia.org/api/rest_v1/page/random/summary');

    const stringTitle = {string: dataFetched.data.title};

    setData([stringTitle]);
    setLoading(false);
  }

  const fetchData = async () => {
    const dataFetched = await axios.get('storage/arraystorage.json');

    setData(dataFetched.data);
  } 

  let randomData;

  if (data.length > 0 && wikipedia === false) {
    randomData = data[Math.floor(Math.random() * data.length)].string;
  } else if (wikipedia === true) {
    randomData = data[0].string;
  } else if (isLoading === true) {
    randomData = 'loading...'
  }

  let isVisible = isLoading == true ? 'visibilityYes' : 'visibilityNo';
  
  let appClass = 'App-header ' + color;
  return (
    <div className="App">
      <div className="App-menu">
        <div className="App-where">
          <p className={color} onClick={changeFrom}>{wikipedia ? 'Wikipedia' : 'Internal'}</p>
        </div>
        <div className="App-mode">
          <p className={color} onClick={changeMode}>{color.toUpperCase()} mode</p>
        </div>
      </div>
      <header className={appClass}>
        <p onClick={pageReload}>
          FUCK <strong>{randomData}</strong>
        </p>
      </header>
      <div className="App-loading">
        <img className={isVisible} src="images/loading.gif" width="100" alt="loading... please wait!"/>
      </div>
    </div>
  );
}

export default App;

