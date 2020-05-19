import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // States
  const [data, setData] = useState([]);
  const [color, setColor] = useState('dark');
  const [wikipedia, setWikipedia] = useState(false);
  const [isLoading, setLoading] = useState(false);

  // Reload function
  function pageReload() {
    reDo();
  }
  
  // Change from wikipedia to internal json
  function changeFrom() {
    if (wikipedia === true) {
      setWikipedia(false);
      pageReload();
    } else {
      setWikipedia(true);
      pageReload();
    }
  }

  // Change from dark to light theme
  function changeMode() {
    if (color === 'dark') {
      setColor('light');
    } else {
      setColor('dark');
    }
  }

  // Reload function (one who do the calls)
  function reDo() {
    if (wikipedia === true) {
      setLoading(true);
      fechWikiPediaData();
    } else if (wikipedia === false) {
      fetchData();
    }
  }

  // React hook for default start
  useEffect(() => {
    const fetchData = async () => {
      const dataFetched = await axios.get('storage/arraystorage.json');

      setData(dataFetched.data);
    }
    fetchData();
  }, []);
  
  // Fetch wikipedia data
  const fechWikiPediaData = async () => {
    const dataFetched = await axios.get('https://en.wikipedia.org/api/rest_v1/page/random/summary');

    const stringTitle = {string: dataFetched.data.title};

    setData([stringTitle]);
    setLoading(false);
  }

  // Fetch JSON data
  const fetchData = async () => {
    const dataFetched = await axios.get('storage/arraystorage.json');

    setData(dataFetched.data);
  } 

  let randomData = '';

  // Select a random word or returned from Wikipedia
  if (data.length > 0 && wikipedia === false) {
    randomData = data[Math.floor(Math.random() * data.length)].string;
  } else if (wikipedia === true) {
    randomData = data[0].string;
  } else if (isLoading === true) {
    randomData = 'loading...'
  }

  // Show or hide (by CSS style) the loading image
  let isVisible = isLoading === true ? 'visibilityYes' : 'visibilityNo';
  
  // Change the theme
  let appClass = 'App-header ' + color;

  // Font size
  let fontSize = {
    fontSize: 'calc(100px - ' + randomData.length  + 'px)'
  }

  return (
    <div className="App">
      <div className="App-menu">
        <div className="App-where" onClick={changeFrom}>
          <p className={color}>{wikipedia ? 'Wikipedia' : 'Internal'}</p>
        </div>
        <div className="App-mode" onClick={changeMode}>
          <p className={color}>{color.toUpperCase()} mode</p>
        </div>
      </div>
      <header className={appClass}>
        <p onClick={pageReload} style={fontSize}>
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

