import { 
  users, projects, algorithms, visualizations,
  type User, type InsertUser,
  type Project, type InsertProject,
  type Algorithm, type InsertAlgorithm,
  type Visualization, type InsertVisualization
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Project operations
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByUser(userId: string): Promise<Project[]>;
  getPublicProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;

  // Algorithm operations
  getAlgorithm(id: string): Promise<Algorithm | undefined>;
  getAlgorithmsByCategory(category: string): Promise<Algorithm[]>;
  getAllAlgorithms(): Promise<Algorithm[]>;
  createAlgorithm(algorithm: InsertAlgorithm): Promise<Algorithm>;

  // Visualization operations
  getVisualization(id: string): Promise<Visualization | undefined>;
  getVisualizationsByProject(projectId: string): Promise<Visualization[]>;
  createVisualization(visualization: InsertVisualization): Promise<Visualization>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Project operations
  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.updatedAt));
  }

  async getPublicProjects(): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.isPublic, true)).orderBy(desc(projects.createdAt));
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async updateProject(id: string, updateProject: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set({ ...updateProject, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project || undefined;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Algorithm operations
  async getAlgorithm(id: string): Promise<Algorithm | undefined> {
    const [algorithm] = await db.select().from(algorithms).where(eq(algorithms.id, id));
    return algorithm || undefined;
  }

  async getAlgorithmsByCategory(category: string): Promise<Algorithm[]> {
    return await db.select().from(algorithms).where(eq(algorithms.category, category));
  }

  async getAllAlgorithms(): Promise<Algorithm[]> {
    return await db.select().from(algorithms).orderBy(algorithms.category, algorithms.name);
  }

  async createAlgorithm(insertAlgorithm: InsertAlgorithm): Promise<Algorithm> {
    const [algorithm] = await db
      .insert(algorithms)
      .values(insertAlgorithm)
      .returning();
    return algorithm;
  }

  // Visualization operations
  async getVisualization(id: string): Promise<Visualization | undefined> {
    const [visualization] = await db.select().from(visualizations).where(eq(visualizations.id, id));
    return visualization || undefined;
  }

  async getVisualizationsByProject(projectId: string): Promise<Visualization[]> {
    return await db.select().from(visualizations).where(eq(visualizations.projectId, projectId));
  }

  async createVisualization(insertVisualization: InsertVisualization): Promise<Visualization> {
    const [visualization] = await db
      .insert(visualizations)
      .values(insertVisualization)
      .returning();
    return visualization;
  }
}

export const storage = new DatabaseStorage();
