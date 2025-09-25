import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertVisualizationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all algorithms
  app.get("/api/algorithms", async (req, res) => {
    try {
      const algorithms = await storage.getAllAlgorithms();
      res.json(algorithms);
    } catch (error) {
      console.error("Error fetching algorithms:", error);
      res.status(500).json({ error: "Failed to fetch algorithms" });
    }
  });

  // Get algorithms by category
  app.get("/api/algorithms/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const algorithms = await storage.getAlgorithmsByCategory(category);
      res.json(algorithms);
    } catch (error) {
      console.error("Error fetching algorithms by category:", error);
      res.status(500).json({ error: "Failed to fetch algorithms" });
    }
  });

  // Get all public projects
  app.get("/api/projects/public", async (req, res) => {
    try {
      const projects = await storage.getPublicProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching public projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  // Create a new project
  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid project data", details: error.errors });
      } else {
        console.error("Error creating project:", error);
        res.status(500).json({ error: "Failed to create project" });
      }
    }
  });

  // Get project by ID
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  // Update project
  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, updateData);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid project data", details: error.errors });
      } else {
        console.error("Error updating project:", error);
        res.status(500).json({ error: "Failed to update project" });
      }
    }
  });

  // Delete project
  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteProject(id);
      if (!deleted) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Detect algorithm type from code
  app.post("/api/algorithm/detect", async (req, res) => {
    try {
      const { code, language } = req.body;
      
      if (!code || !language) {
        return res.status(400).json({ error: "Code and language are required" });
      }

      // Algorithm detection logic
      const detectedType = detectAlgorithmType(code.toLowerCase());
      
      res.json({ 
        algorithmType: detectedType.type,
        confidence: detectedType.confidence,
        details: detectedType.details
      });
    } catch (error) {
      console.error("Error detecting algorithm:", error);
      res.status(500).json({ error: "Failed to detect algorithm" });
    }
  });

  // Execute code and generate visualization steps
  app.post("/api/execute", async (req, res) => {
    try {
      const { code, language, input } = req.body;
      
      if (!code || !language) {
        return res.status(400).json({ error: "Code and language are required" });
      }

      // Simulate code execution and generate visualization steps
      const executionResult = simulateExecution(code, language, input);
      
      res.json(executionResult);
    } catch (error) {
      console.error("Error executing code:", error);
      res.status(500).json({ error: "Failed to execute code" });
    }
  });

  // Create visualization
  app.post("/api/visualizations", async (req, res) => {
    try {
      const visualizationData = insertVisualizationSchema.parse(req.body);
      const visualization = await storage.createVisualization(visualizationData);
      res.status(201).json(visualization);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid visualization data", details: error.errors });
      } else {
        console.error("Error creating visualization:", error);
        res.status(500).json({ error: "Failed to create visualization" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Algorithm detection helper function
function detectAlgorithmType(code: string) {
  const sortingKeywords = ['sort', 'quicksort', 'mergesort', 'bubblesort', 'insertionsort', 'selectionsort', 'heapsort'];
  const searchKeywords = ['search', 'binary', 'linear', 'find'];
  const graphKeywords = ['dfs', 'bfs', 'depth', 'breadth', 'graph', 'adjacency', 'vertex', 'edge'];
  const treeKeywords = ['tree', 'binary tree', 'traversal', 'inorder', 'preorder', 'postorder'];
  const recursionKeywords = ['recursion', 'recursive', 'fibonacci', 'factorial'];

  let maxMatches = 0;
  let detectedType = 'unknown';
  let details = '';

  const categories = [
    { type: 'sorting', keywords: sortingKeywords, description: 'Sorting algorithm' },
    { type: 'searching', keywords: searchKeywords, description: 'Searching algorithm' },
    { type: 'graph', keywords: graphKeywords, description: 'Graph traversal algorithm' },
    { type: 'tree', keywords: treeKeywords, description: 'Tree traversal algorithm' },
    { type: 'recursion', keywords: recursionKeywords, description: 'Recursive algorithm' }
  ];

  categories.forEach(category => {
    const matches = category.keywords.filter(keyword => code.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedType = category.type;
      details = category.description;
    }
  });

  const confidence = maxMatches > 0 ? Math.min(maxMatches * 0.3, 1.0) : 0.1;

  return {
    type: detectedType,
    confidence,
    details
  };
}

// Code execution simulation helper function
function simulateExecution(code: string, language: string, input: any) {
  const algorithmType = detectAlgorithmType(code.toLowerCase());
  
  // Generate mock execution results based on algorithm type
  if (algorithmType.type === 'sorting') {
    return generateSortingVisualization(input || [64, 34, 25, 12, 22, 11, 90, 88]);
  } else if (algorithmType.type === 'searching') {
    return generateSearchVisualization(input || { array: [1, 3, 5, 7, 9, 11, 13, 15], target: 7 });
  } else if (algorithmType.type === 'graph') {
    return generateGraphVisualization(input || { nodes: 6, edges: [[0,1],[0,2],[1,3],[2,4],[3,5],[4,5]] });
  }

  return {
    success: true,
    algorithmType: algorithmType.type,
    executionTime: Math.random() * 100 + 10,
    memoryUsage: Math.random() * 1000 + 500,
    output: "Execution completed",
    steps: []
  };
}

function generateSortingVisualization(array: number[]) {
  const steps = [];
  const arr = [...array];
  
  // Generate sorting steps (simplified quicksort simulation)
  steps.push({
    type: 'initial',
    array: [...arr],
    description: 'Initial array state',
    highlights: []
  });

  // Simulate some sorting steps
  for (let i = 0; i < Math.min(arr.length, 5); i++) {
    const pivot = Math.floor(Math.random() * arr.length);
    steps.push({
      type: 'partition',
      array: [...arr],
      description: `Partitioning around pivot ${arr[pivot]}`,
      highlights: [pivot],
      pivot
    });
  }

  arr.sort((a, b) => a - b);
  steps.push({
    type: 'final',
    array: [...arr],
    description: 'Array sorted successfully',
    highlights: []
  });

  return {
    success: true,
    algorithmType: 'sorting',
    executionTime: 45,
    memoryUsage: 2100,
    originalArray: array,
    sortedArray: arr,
    steps
  };
}

function generateSearchVisualization(input: { array: number[], target: number }) {
  const steps = [];
  const { array, target } = input;
  
  let left = 0;
  let right = array.length - 1;
  let found = false;
  let foundIndex = -1;

  steps.push({
    type: 'initial',
    array: [...array],
    description: `Searching for ${target} in array`,
    left,
    right,
    target
  });

  // Simulate binary search
  while (left <= right && !found) {
    const mid = Math.floor((left + right) / 2);
    
    steps.push({
      type: 'compare',
      array: [...array],
      description: `Comparing ${target} with ${array[mid]} at index ${mid}`,
      left,
      right,
      mid,
      target
    });

    if (array[mid] === target) {
      found = true;
      foundIndex = mid;
    } else if (array[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  steps.push({
    type: 'final',
    array: [...array],
    description: found ? `Target ${target} found at index ${foundIndex}` : `Target ${target} not found`,
    found,
    foundIndex,
    target
  });

  return {
    success: true,
    algorithmType: 'searching',
    executionTime: 12,
    memoryUsage: 800,
    found,
    foundIndex,
    steps
  };
}

function generateGraphVisualization(input: { nodes: number, edges: number[][] }) {
  const steps = [];
  const { nodes, edges } = input;
  const visited = new Array(nodes).fill(false);
  const visitOrder: number[] = [];

  steps.push({
    type: 'initial',
    nodes,
    edges,
    description: 'Starting DFS traversal from node 0',
    visited: [...visited],
    current: 0
  });

  // Simulate DFS traversal
  const dfs = (node: number) => {
    if (visited[node]) return;
    
    visited[node] = true;
    visitOrder.push(node);
    
    steps.push({
      type: 'visit',
      nodes,
      edges,
      description: `Visiting node ${node}`,
      visited: [...visited],
      current: node,
      visitOrder: [...visitOrder]
    });

    // Find adjacent nodes
    const adjacentNodes = edges
      .filter(([a, b]) => a === node || b === node)
      .map(([a, b]) => a === node ? b : a)
      .filter(neighbor => !visited[neighbor]);

    adjacentNodes.forEach(neighbor => dfs(neighbor));
  };

  dfs(0);

  steps.push({
    type: 'final',
    nodes,
    edges,
    description: 'DFS traversal completed',
    visited: [...visited],
    visitOrder: [...visitOrder]
  });

  return {
    success: true,
    algorithmType: 'graph',
    executionTime: 28,
    memoryUsage: 1200,
    visitOrder,
    steps
  };
}
