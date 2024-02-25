import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";

dotenv.config();

interface GithubUserData {
  username: string;
  joinDate: string;
  trendAnalysis: string;
  firstContribution?: CommitDetail|null;
}

interface CommitDetail {
  date: string;
  repositoryName: string;
  commitUrl: string;
}

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

async function listUserRepositories(username: string): Promise<string[]> {
  const repos = await octokit.paginate(octokit.repos.listForUser, {
    username,
    type: 'owner',
    per_page: 100,
  });
  return repos.map(repo => repo.full_name);
}

async function findEarliestCommitInRepo(repositoryFullName: string, username: string): Promise<CommitDetail | null> {
  try {
    const [owner, repo] = repositoryFullName.split('/');
    const commits = await octokit.paginate(octokit.repos.listCommits, {
      owner,
      repo,
      author: username,
      per_page: 1,
    });

    if (commits.length === 0) return null;

    const earliestCommit = commits[0];
    return {
      date: earliestCommit.commit.author?.date??"",
      repositoryName: repositoryFullName,
      commitUrl: earliestCommit.html_url,
    };
  } catch (error) {
    console.error(`Error fetching commits for ${repositoryFullName}:`, error);
    return null;
  }
}

async function findUsersFirstCommit(username: string): Promise<CommitDetail | null> {
  const repositories = await listUserRepositories(username);
  const commitPromises = repositories.map(repo => findEarliestCommitInRepo(repo, username));
  const commits = await Promise.all(commitPromises);
  const validCommits = commits.filter(commit => commit !== null);

  if (validCommits.length === 0) return null;

  return validCommits.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
}

async function fetchGithubUserJoinDate(username: string): Promise<GithubUserData | null> {
  try {
    // Initiate both requests simultaneously
    const userPromise = octokit.rest.users.getByUsername({ username });
    const firstContributionPromise = findUsersFirstCommit(username);

    // Wait for both promises to resolve
    const [{ data }, firstContribution] = await Promise.all([userPromise, firstContributionPromise]);

    const joinDate = new Date(data.created_at);
    const joinYear = joinDate.getFullYear();
    const trendAnalysis = joinYear < 2015 ? "Early GitHub adopter" : "Joined GitHub after 2015";

    return {
      username: data.login,
      joinDate: data.created_at,
      trendAnalysis,
      firstContribution,
    };
  } catch (error) {
    console.error("Error fetching GitHub user data:", error);
    return null;
  }
}

export async function POST(req: Request) {
  const { username } = await req.json();
  if (!username) {
    return new Response(JSON.stringify({ message: "Username is required" }), {
      status: 400,
    });
  }

  const userData = await fetchGithubUserJoinDate(username);
  if (userData) {
    return new Response(JSON.stringify(userData), { status: 200 });
  } else {
    return new Response(JSON.stringify({ message: "Failed to fetch user data" }), { status: 500 });
  }
}
