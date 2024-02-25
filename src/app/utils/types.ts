// src/app/utils/types.ts
export interface GithubUserData {
    username: string;
    joinDate: string;
    trendAnalysis: string;
    firstContribution?: CommitDetail | null;
  }
  
  export interface CommitDetail {
    date: string;
    repositoryName: string;
    commitUrl: string;
  }
  