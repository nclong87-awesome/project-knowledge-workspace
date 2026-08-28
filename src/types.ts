export type ProjectKnowledgeItem = {
  id: string;
  project: string;
  category: string;
  title: string;
  content: string;
  tags: string;
  source: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectKnowledgeSearchItem = ProjectKnowledgeItem & {
  score?: number;
};

export type ProjectKnowledgeSearchResponse = {
  items: ProjectKnowledgeSearchItem[];
};

export type CreateProjectKnowledgeInput = {
  project: string;
  title: string;
  content: string;
  category?: string;
  tags?: string;
  source?: string;
};

export type UpdateProjectKnowledgeInput = {
  project?: string;
  category?: string;
  title?: string;
  content?: string;
  tags?: string;
  source?: string;
};

export type StoredAuthToken = {
  accessToken: string;
  tokenType: "Bearer";
  expiresAt: number;
};

export type AuthConfig = {
  apiBaseUrl: string;
  clientId: string;
  clientSecret: string;
};
