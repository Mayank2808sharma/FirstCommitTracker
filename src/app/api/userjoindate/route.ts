// src/app/api/userjoindata/route.ts

import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';

dotenv.config();

interface GithubUserData {
  username: string;
  joinDate: string;
  trendAnalysis: string;
  popularRepositories?: PopularRepository[];
}

interface PopularRepository {
  name: string;
  stars: number;
  language: string;
}

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

async function fetchGithubUserJoinDate(username: string): Promise<GithubUserData | null> {
  try {
    const { data } = await octokit.rest.users.getByUsername({ username });
    const joinDate = new Date(data.created_at);
    const joinYear = joinDate.getFullYear();
    const trendAnalysis = joinYear < 2015 ? 'Early GitHub adopter' : 'Joined GitHub after 2015';
    const popularRepositories = await fetchPopularRepositories(joinYear);

    return {
      username: data.login,
      joinDate: data.created_at,
      trendAnalysis,
      popularRepositories,
    };
  } catch (error) {
    console.error('Error fetching GitHub user data:', error);
    return null;
  }
}

async function fetchPopularRepositories(year: number): Promise<PopularRepository[]> {
  const searchYear = `${year}-01-01..${year}-12-31`;
  const { data } = await octokit.rest.search.repos({
    q: `created:${searchYear}`,
    sort: "stars",
    order: "desc",
    per_page: 10,
  });

  return data.items.map(repo => ({
    name: repo.name,
    stars: repo.stargazers_count,
    language: repo.language,
  }));
}

export async function POST(req: Request) {
  const { username } = await req.json();
  if (!username) {
    return new Response(JSON.stringify({ message: 'Username is required' }), { status: 400 });
  }

  const userData = await fetchGithubUserJoinDate(username);
  if (userData) {
    return new Response(JSON.stringify(userData), { status: 200 });
  } else {
    return new Response(JSON.stringify({ message: 'Failed to fetch user data' }), { status: 500 });
  }
}
