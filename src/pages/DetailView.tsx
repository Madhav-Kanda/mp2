import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { marvelApi } from '../services/marvelApi';
import { MarvelCharacter } from '../types/marvel';
import './DetailView.css';

const DetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<MarvelCharacter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the characters array from location state or use empty array
  const characters = (location.state as { characters?: MarvelCharacter[] })?.characters || [];
  const currentIndex = characters.findIndex(c => c.id === Number(id));

  useEffect(() => {
    const fetchCharacter = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await marvelApi.getCharacterById(Number(id));
        setCharacter(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch character details. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [id]);

  const handlePrevious = () => {
    if (currentIndex > 0 && characters.length > 0) {
      const prevCharacter = characters[currentIndex - 1];
      navigate(`/character/${prevCharacter.id}`, {
        state: { characters },
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < characters.length - 1 && characters.length > 0) {
      const nextCharacter = characters[currentIndex + 1];
      navigate(`/character/${nextCharacter.id}`, {
        state: { characters },
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="error-message">
        {error || 'Character not found.'}
        <br />
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to List
        </Link>
      </div>
    );
  }

  return (
    <div className="detail-view">
      <div className="detail-navigation">
        <button
          className="nav-btn prev-btn"
          onClick={handlePrevious}
          disabled={currentIndex <= 0 || characters.length === 0}
        >
          <span className="nav-arrow">←</span> Previous
        </button>
        
        <Link to="/" className="btn btn-secondary">
          Back to List
        </Link>

        <button
          className="nav-btn next-btn"
          onClick={handleNext}
          disabled={currentIndex >= characters.length - 1 || characters.length === 0}
        >
          Next <span className="nav-arrow">→</span>
        </button>
      </div>

      <div className="detail-content">
        <div className="detail-image-section">
          <img
            src={marvelApi.getImageUrl(character, 'portrait_xlarge')}
            alt={character.name}
            className="detail-image"
          />
        </div>

        <div className="detail-info-section">
          <h1 className="detail-title">{character.name}</h1>
          
          {character.description && (
            <div className="detail-description">
              <h2>Description</h2>
              <p>{character.description}</p>
            </div>
          )}

          <div className="detail-stats-grid">
            <div className="stat-card">
              <div className="stat-number">{character.comics.available}</div>
              <div className="stat-label">Comics</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{character.series.available}</div>
              <div className="stat-label">Series</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{character.stories.available}</div>
              <div className="stat-label">Stories</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{character.events.available}</div>
              <div className="stat-label">Events</div>
            </div>
          </div>

          {character.comics.items.length > 0 && (
            <div className="detail-section">
              <h2>Featured Comics</h2>
              <ul className="item-list">
                {character.comics.items.slice(0, 10).map((comic, index) => (
                  <li key={index}>{comic.name}</li>
                ))}
              </ul>
            </div>
          )}

          {character.series.items.length > 0 && (
            <div className="detail-section">
              <h2>Featured Series</h2>
              <ul className="item-list">
                {character.series.items.slice(0, 10).map((series, index) => (
                  <li key={index}>{series.name}</li>
                ))}
              </ul>
            </div>
          )}

          {character.urls.length > 0 && (
            <div className="detail-section">
              <h2>Links</h2>
              <div className="links-container">
                {character.urls.map((url, index) => (
                  <a
                    key={index}
                    href={url.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="external-link"
                  >
                    {url.type.charAt(0).toUpperCase() + url.type.slice(1)}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="detail-meta">
            <p className="meta-text">
              Last Modified: {new Date(character.modified).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailView;
