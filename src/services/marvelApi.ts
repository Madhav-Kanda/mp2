import axios from 'axios';
import md5 from 'md5';
import { MarvelApiResponse, MarvelCharacter } from '../types/marvel';

// Marvel API Configuration
// Note: These are demo keys. Get your own from https://developer.marvel.com/
const PUBLIC_KEY = '4c1d691648fb3987bf330302fbfa397a';
const PRIVATE_KEY = 'e89abb41e5ec085354217587e3cacb37703cc714';

// Generate Marvel API authentication parameters
// Hash = MD5(timestamp + privateKey + publicKey)
const generateAuthParams = () => {
  const ts = Date.now().toString();
  const hash = md5(ts + PRIVATE_KEY + PUBLIC_KEY);
  return { ts, apikey: PUBLIC_KEY, hash };
};

const BASE_URL = 'https://gateway.marvel.com/v1/public';

class MarvelApiService {
  private async request<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    try {
      const authParams = generateAuthParams();
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        params: {
          ...authParams,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Marvel API Error:', error);
      throw error;
    }
  }

  async getCharacters(params: {
    nameStartsWith?: string;
    limit?: number;
    offset?: number;
    orderBy?: string;
  } = {}): Promise<MarvelApiResponse> {
    const queryParams: Record<string, string> = {
      limit: (params.limit || 20).toString(),
      offset: (params.offset || 0).toString(),
    };

    if (params.nameStartsWith) {
      queryParams.nameStartsWith = params.nameStartsWith;
    }

    if (params.orderBy) {
      queryParams.orderBy = params.orderBy;
    }

    return this.request<MarvelApiResponse>('/characters', queryParams);
  }

  async getCharacterById(id: number): Promise<MarvelCharacter | null> {
    try {
      const response = await this.request<MarvelApiResponse>(`/characters/${id}`);
      return response.data.results[0] || null;
    } catch (error) {
      console.error(`Error fetching character ${id}:`, error);
      return null;
    }
  }

  async searchCharacters(query: string): Promise<MarvelCharacter[]> {
    try {
      const response = await this.getCharacters({
        nameStartsWith: query,
        limit: 100,
      });
      return response.data.results;
    } catch (error) {
      console.error('Error searching characters:', error);
      return [];
    }
  }

  getImageUrl(character: MarvelCharacter, size: 'portrait_small' | 'portrait_medium' | 'portrait_xlarge' | 'standard_medium' | 'standard_large' | 'standard_xlarge' = 'standard_medium'): string {
    const { path, extension } = character.thumbnail;
    return `${path}/${size}.${extension}`;
  }
}

export const marvelApi = new MarvelApiService();
