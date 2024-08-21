import React, { createContext, useState, useEffect } from 'react';
import earlySermons from '../sermons/1964-1969/firstset';
import secondSet from '../sermons/1970/1970';
import thirdSet from '../sermons/1971/1971';
import fourthSet from '../sermons/1972/1972';
import lastSet from '../sermons/1973/1973';
import audioSermons from '../sermons/audio';

const SermonContext = createContext();

const sermonCollection = [
  ...earlySermons,
  ...secondSet,
  ...thirdSet,
  ...fourthSet,
  ...lastSet,
];

const SermonProvider = ({ children }) => {
  const [selectedSermon, setSelectedSermon] = useState('');
  const [allSermons, setAllSermons] = useState([]);
  const [searchTerm, setSearchTerm] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  

  const handleRandomSermons = () => {
    let sermonIndex = Math.floor(Math.random() * sermonCollection.length);
    setSelectedSermon(sermonCollection[sermonIndex]);
  };

  useEffect(() => {
    handleRandomSermons();
    try {
      const fetchedSermons = [
        ...earlySermons,
        ...secondSet,
        ...thirdSet,
        ...fourthSet,
        ...lastSet,
        ...audioSermons
      ];
      setAllSermons(fetchedSermons);
      setLoading(false);
    } catch (err) {
      setError('Failed to load sermons');
      setLoading(false);
    }
  }, []);



  return (
    <SermonContext.Provider value={{
      selectedSermon,
      setSelectedSermon,
      allSermons,
      setAllSermons,
    }}>
      {children}
    </SermonContext.Provider>
  );
};

export { SermonContext, SermonProvider };