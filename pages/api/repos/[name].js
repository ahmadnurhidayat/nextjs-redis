import getRepository from "server/redis";

// Fetch user info from cache
async function findInCache(name) {
  const repository = await getRepository();
  return repository.search().where("login").equals(name).return.first();
}

// Store user info in cache
async function storeInCache(data) {
  const repository = await getRepository();

  let repo = repository.createEntity();
  repo.login = data.login;
  repo.url = data.url;
  repo.avatar_url = data.avatar_url;
  repo.type = data.type;
  repo.public_repos = data.public_repos;
  repo.followers = data.followers;
  repo.following = data.following;
  repo.time = data.time;

  await repository.save(repo);

  return repo;
}

// Fetch repository data for the user
async function getRepositories(name) {
  const url = `https://api.github.com/users/${name}/repos`;
  const response = await fetch(url);
  const repositories = await response.json();
  return repositories;
}

// Main function to get GitHub user info and repositories
export async function getGitRepo(name) {
  const start = Date.now();
  const repo = await findInCache(name);

  // If the repo data is cached, return it with cached info
  if (repo) {
    const repositories = await getRepositories(name); // Fetch repos if user is cached
    return {
      repo: repo.toJSON(),
      repositories,
      cached: true,
      time: Date.now() - start,
    };
  }

  // If not cached, fetch from GitHub
  const url = `https://api.github.com/users/${name}`;
  
  const response = await fetch(url);
  let data = await response.json();

  // After fetching user info, fetch repositories
  const repositories = await getRepositories(name);

  if (!!data) {
    data.time = Date.now() - start;
    data = await storeInCache(data);
  }

  return {
    repo: data,
    repositories, // Include repositories in the response
    cached: false,
    time: data.time,
  };
}

export default async function handler(req, res) {
  res.send(await getGitRepo(req.query.name));
}
