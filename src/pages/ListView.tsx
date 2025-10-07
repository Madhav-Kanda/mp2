import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { marvelApi } from '../services/marvelApi';
import { MarvelCharacter, SortOption, SortOrder } from '../types/marvel';
import './ListView.css';

const ListView: React.FC = () => {
  const [characters, setCharacters] = useState<MarvelCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        const response = await marvelApi.getCharacters({ limit: 100 });
        setCharacters(response.data.results);
        setError(null);
      } catch (err) {
        setError('Failed to fetch characters. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  // Filter and sort characters
  const filteredAndSortedCharacters = useMemo(() => {
    let filtered = characters;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(character =>
        character.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let compareValue = 0;

      if (sortBy === 'name') {
        compareValue = a.name.localeCompare(b.name);
      } else if (sortBy === 'modified') {
        compareValue = new Date(a.modified).getTime() - new Date(b.modified).getTime();
      } else if (sortBy === 'comics') {
        compareValue = a.comics.available - b.comics.available;
      } else if (sortBy === 'series') {
        compareValue = a.series.available - b.series.available;
      } else if (sortBy === 'stories') {
        compareValue = a.stories.available - b.stories.available;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return sorted;
  }, [characters, searchQuery, sortBy, sortOrder]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="list-view">
      <div className="list-header">
        <h1 className="page-title">Marvel Characters</h1>
        
        <div className="controls">
          <div className="search-container">
            <input
              type="text"
              className="input-field search-input"
              placeholder="Search characters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="sort-controls">
            <select
              className="select-field"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              <option value="name">Sort by Name</option>
              <option value="modified">Sort by Modified Date</option>
              <option value="comics">Sort by Comics Count</option>
              <option value="series">Sort by Series Count</option>
              <option value="stories">Sort by Stories Count</option>
            </select>

            <select
              className="select-field"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>

      <div className="results-info">
        Showing {filteredAndSortedCharacters.length} of {characters.length} characters
      </div>

      <div className="character-list">
        {filteredAndSortedCharacters.map((character, index) => (
          <Link
            key={character.id}
            to={`/character/${character.id}`}
            state={{ characters: filteredAndSortedCharacters }}
            className="character-list-item"
          >
            <div className="serial-number">{index + 1}</div>
            <div className="character-info">
              <h3 className="character-name">{character.name}</h3>
              <p className="character-date">
                Modified: {formatDate(character.modified)}
              </p>
              {character.description && (
                <p className="character-description">
                  {character.description.substring(0, 200)}
                  {character.description.length > 200 ? '...' : ''}
                </p>
              )}
              <div className="character-stats">
                <span className="stat">Comics: {character.comics.available}</span>
                <span className="stat">Series: {character.series.available}</span>
                <span className="stat">Stories: {character.stories.available}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredAndSortedCharacters.length === 0 && (
        <div className="no-results">
          No characters found matching your search.
        </div>
      )}
    </div>
  );
};

export default ListView;
