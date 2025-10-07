import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { marvelApi } from '../services/marvelApi';
import { MarvelCharacter } from '../types/marvel';
import './GalleryView.css';

const GalleryView: React.FC = () => {
  const [characters, setCharacters] = useState<MarvelCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'withDescription' | 'withComics' | 'withSeries'>('all');

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

  // Filter characters based on selected filter
  const filteredCharacters = useMemo(() => {
    let filtered = characters;

    switch (selectedFilter) {
      case 'withDescription':
        filtered = characters.filter(char => char.description && char.description.trim().length > 0);
        break;
      case 'withComics':
        filtered = characters.filter(char => char.comics.available > 0);
        break;
      case 'withSeries':
        filtered = characters.filter(char => char.series.available > 0);
        break;
      case 'all':
      default:
        filtered = characters;
    }

    return filtered;
  }, [characters, selectedFilter]);

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
    <div className="gallery-view">
      <div className="gallery-header">
        <h1 className="page-title">Character Gallery</h1>
        
        <div className="filter-controls">
          <button
            className={`filter-btn ${selectedFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('all')}
          >
            All Characters
          </button>
          <button
            className={`filter-btn ${selectedFilter === 'withDescription' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('withDescription')}
          >
            With Description
          </button>
          <button
            className={`filter-btn ${selectedFilter === 'withComics' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('withComics')}
          >
            With Comics
          </button>
          <button
            className={`filter-btn ${selectedFilter === 'withSeries' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('withSeries')}
          >
            With Series
          </button>
        </div>
      </div>

      <div className="results-info">
        Showing {filteredCharacters.length} of {characters.length} characters
      </div>

      <div className="gallery-grid">
        {filteredCharacters.map((character) => (
          <Link
            key={character.id}
            to={`/character/${character.id}`}
            state={{ characters: filteredCharacters }}
            className="gallery-item"
          >
            <div className="gallery-image-container">
              <img
                src={marvelApi.getImageUrl(character, 'portrait_xlarge')}
                alt={character.name}
                className="gallery-image"
                loading="lazy"
              />
              <div className="gallery-overlay">
                <h3 className="gallery-name">{character.name}</h3>
                <div className="gallery-badges">
                  {character.comics.available > 0 && (
                    <span className="badge">📚 {character.comics.available} Comics</span>
                  )}
                  {character.series.available > 0 && (
                    <span className="badge">📺 {character.series.available} Series</span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredCharacters.length === 0 && (
        <div className="no-results">
          No characters found with the selected filter.
        </div>
      )}
    </div>
  );
};

export default GalleryView;
