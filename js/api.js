// api.js — all GitHub API calls live here and nowhere else

const API = (() => {
  const BASE = 'https://api.github.com';

  // Store token in memory only — never in localStorage
  let _token = '';

  function setToken(token) {
    _token = token;
  }

  // Build headers for every request
  function _headers() {
    const headers = {
      'Accept': 'application/vnd.github+json',
    };
    if (_token) {
      headers['Authorization'] = `Bearer ${_token}`;
    }
    return headers;
  }

  // Core fetch wrapper — every API call goes through here
  async function _fetch(endpoint) {
    const cacheKey = endpoint;
    const cached = Cache.get(cacheKey);

    if (cached) {
      console.log(`[Cache HIT] ${endpoint}`);
      return cached;
    }

    console.log(`[API] GET ${BASE}${endpoint}`);

    const response = await fetch(BASE + endpoint, {
      headers: _headers()
    });

    // Handle rate limiting specifically
    if (response.status === 403) {
      const resetTime = response.headers.get('X-RateLimit-Reset');
      const resetDate = resetTime ? new Date(resetTime * 1000).toLocaleTimeString() : 'soon';
      throw new Error(`Rate limit exceeded. Resets at ${resetDate}`);
    }

    // Handle user not found
    if (response.status === 404) {
      throw new Error(`User not found`);
    }

    // Handle any other error
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    // Cache successful responses
    Cache.set(cacheKey, data);

    return data;
  }

  // ── PUBLIC METHODS ──

  async function getUser(username) {
    return _fetch(`/users/${username}`);
  }

  async function getRepos(username) {
    // sort=updated gives us most recently active repos first
    // per_page=100 is the maximum GitHub allows in one request
    return _fetch(`/users/${username}/repos?sort=updated&per_page=100`);
  }

  async function getEvents(username) {
    // Events = recent public activity (pushes, PRs, issues, etc.)
    return _fetch(`/users/${username}/events/public?per_page=100`);
  }

  // Fetch all three in parallel — faster than sequential awaits
  async function getAllUserData(username) {
    const [user, repos, events] = await Promise.all([
      getUser(username),
      getRepos(username),
      getEvents(username)
    ]);
    return { user, repos, events };
  }

  // For comparison mode: fetch up to 3 users in parallel
  async function getMultipleUsers(usernames) {
    const results = await Promise.all(
      usernames.map(username => getAllUserData(username))
    );
    return results;
  }

  return { setToken, getUser, getRepos, getEvents, getAllUserData, getMultipleUsers };
})();