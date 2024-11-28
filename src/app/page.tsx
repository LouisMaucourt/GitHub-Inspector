'use client';
import { useState, FormEvent, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';

type GitHubUser = {
  id: number;
  login: string;
  avatar_url: string;
};

type GitHubRepository = {
  id: number;
  name: string;
  html_url: string;
  owner: {
    login: string;
    avatar_url: string;
  };
};

type SearchType = 'users' | 'repositories' | 'both';

function SearchComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialUsername = searchParams.get('username') || '';
  const [username, setUsername] = useState(initialUsername);
  const [searchType, setSearchType] = useState<SearchType>('both');
  const [userSearchResults, setUserSearchResults] = useState<GitHubUser[]>([]);
  const [repositorySearchResults, setRepositorySearchResults] = useState<GitHubRepository[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  type FetchResponse<T> = {
    items: T[];
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setUserSearchResults([]);
    setRepositorySearchResults([]);

    try {
      router.push(`/?username=${username}`);
      const searchPromises = [];

      if (searchType === 'users' || searchType === 'both') {
        searchPromises.push(
          fetch(`https://api.github.com/search/users?q=${username}`)
            .then((response) => response.json())
            .then((data: FetchResponse<GitHubUser>) => {
              if (data.items) {
                setUserSearchResults(data.items);
              }
            })
        );
      }

      if (searchType === 'repositories' || searchType === 'both') {
        searchPromises.push(
          fetch(`https://api.github.com/search/repositories?q=${username}`)
            .then((response) => response.json())
            .then((data: FetchResponse<GitHubRepository>) => {
              if (data.items) {
                setRepositorySearchResults(data.items);
              }
            })
        );
      }

      await Promise.all(searchPromises);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserClick = (user: string) => {
    router.push(`/user?username=${user}`);
  };

  const handleRepositoryClick = (repo: string, user: string) => {
    router.push(`/repositories/${user}/${repo}`);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-black text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">Inspecteur GoGoGitHub</h1>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex mb-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-grow border rounded-l px-4 py-2 text-black"
            placeholder="Entrer un nom d'utilisateur ou repository de Github"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'ça arrive...' : 'Rechercher'}
          </button>
        </div>

        <div className="flex justify-center space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="both"
              checked={searchType === 'both'}
              onChange={() => setSearchType('both')}
              className="mr-2"
            />
            Les deux
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="users"
              checked={searchType === 'users'}
              onChange={() => setSearchType('users')}
              className="mr-2"
            />
            Utilisateurs
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="repositories"
              checked={searchType === 'repositories'}
              onChange={() => setSearchType('repositories')}
              className="mr-2"
            />
            Repositories
          </label>
        </div>
      </form>

      {error && <div className="text-red-500">{error}</div>}

      <div>
        {userSearchResults.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Users</h2>
            {userSearchResults.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserClick(user.login)}
                className="flex items-center space-x-4 mb-4 cursor-pointer hover:bg-gray-800 p-2 rounded"
              >
                <Image
                  width={300}
                  height={300}
                  src={user.avatar_url}
                  alt={user.login}
                  className="w-12 h-12 rounded-full"
                />
                <span className="text-blue-400 hover:underline">{user.login}</span>
              </div>
            ))}
          </div>
        )}

        {repositorySearchResults.map((repo) => (
          <div
            key={repo.id}
            onClick={() => handleRepositoryClick(repo.name, repo.owner.login)}
            className="flex items-center space-x-4 mb-4 cursor-pointer hover:bg-gray-800 p-2 rounded"
          >
            <Image
              width={300}
              height={300}
              src={repo.owner.avatar_url}
              alt={repo.owner.login}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <span className="text-blue-400 hover:underline block">{repo.name}</span>
              <span className="text-gray-500 text-sm">{repo.owner.login}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export default function Home() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <SearchComponent />
      </Suspense>
    </div>
  );
}