export interface AlgorithmPattern {
  type: string;
  keywords: string[];
  patterns: RegExp[];
  description: string;
}

export const algorithmPatterns: AlgorithmPattern[] = [
  {
    type: 'sorting',
    keywords: ['sort', 'quicksort', 'mergesort', 'bubblesort', 'insertionsort', 'selectionsort', 'heapsort'],
    patterns: [
      /function\s+(\w*sort\w*)/i,
      /def\s+(\w*sort\w*)/i,
      /public\s+(\w+\s+)*(\w*sort\w*)/i,
      /(left|right|pivot|partition)/i,
      /(swap|exchange|compare)/i
    ],
    description: 'Sorting algorithm'
  },
  {
    type: 'searching',
    keywords: ['search', 'binary', 'linear', 'find', 'lookup'],
    patterns: [
      /function\s+(\w*search\w*)/i,
      /def\s+(\w*search\w*)/i,
      /public\s+(\w+\s+)*(\w*search\w*)/i,
      /(binary|linear).*(search|find)/i,
      /(left|right|mid|middle)/i
    ],
    description: 'Searching algorithm'
  },
  {
    type: 'graph',
    keywords: ['dfs', 'bfs', 'depth', 'breadth', 'graph', 'adjacency', 'vertex', 'edge', 'node'],
    patterns: [
      /function\s+(dfs|bfs|depth|breadth)/i,
      /def\s+(dfs|bfs|depth|breadth)/i,
      /(adjacency|graph|vertex|edge|node)/i,
      /(visited|queue|stack)/i,
      /(neighbors|adjacent)/i
    ],
    description: 'Graph traversal algorithm'
  },
  {
    type: 'tree',
    keywords: ['tree', 'binary tree', 'traversal', 'inorder', 'preorder', 'postorder'],
    patterns: [
      /function\s+(\w*tree\w*)/i,
      /def\s+(\w*tree\w*)/i,
      /(inorder|preorder|postorder)/i,
      /(left|right).*(child|node)/i,
      /(root|leaf)/i
    ],
    description: 'Tree traversal algorithm'
  },
  {
    type: 'recursion',
    keywords: ['recursion', 'recursive', 'fibonacci', 'factorial'],
    patterns: [
      /function\s+(\w+)\s*\([^)]*\)\s*\{[^}]*\1\s*\(/i,
      /def\s+(\w+)\s*\([^)]*\):[^:]*\1\s*\(/i,
      /(fibonacci|factorial)/i,
      /return.*\w+\s*\(/i
    ],
    description: 'Recursive algorithm'
  },
  {
    type: 'dynamic programming',
    keywords: ['dp', 'memoization', 'tabulation', 'dynamic'],
    patterns: [
      /(memo|cache|dp)/i,
      /(tabulation|bottom.?up)/i,
      /\[.*\]\[.*\]/i // 2D array access pattern
    ],
    description: 'Dynamic programming algorithm'
  }
];

export function detectAlgorithmType(code: string): {
  type: string;
  confidence: number;
  details: string;
  matches: string[];
} {
  const codeNormalized = code.toLowerCase();
  let maxScore = 0;
  let detectedType = 'unknown';
  let bestPattern: AlgorithmPattern | null = null;
  let allMatches: string[] = [];

  for (const pattern of algorithmPatterns) {
    let score = 0;
    const matches: string[] = [];

    // Check keyword matches
    for (const keyword of pattern.keywords) {
      if (codeNormalized.includes(keyword)) {
        score += 1;
        matches.push(keyword);
      }
    }

    // Check pattern matches
    for (const regex of pattern.patterns) {
      const match = regex.exec(code);
      if (match) {
        score += 2; // Patterns are weighted more heavily
        matches.push(`pattern: ${match[0]}`);
      }
    }

    if (score > maxScore) {
      maxScore = score;
      detectedType = pattern.type;
      bestPattern = pattern;
      allMatches = matches;
    }
  }

  // Calculate confidence based on score and code length
  const confidence = Math.min(maxScore * 0.2, 1.0);
  
  return {
    type: detectedType,
    confidence,
    details: bestPattern?.description || 'Unknown algorithm type',
    matches: allMatches
  };
}

export function getAlgorithmComplexity(algorithmType: string): {
  time: string;
  space: string;
} {
  const complexities: Record<string, { time: string; space: string }> = {
    'quicksort': { time: 'O(n log n)', space: 'O(log n)' },
    'mergesort': { time: 'O(n log n)', space: 'O(n)' },
    'bubblesort': { time: 'O(n²)', space: 'O(1)' },
    'insertionsort': { time: 'O(n²)', space: 'O(1)' },
    'selectionsort': { time: 'O(n²)', space: 'O(1)' },
    'heapsort': { time: 'O(n log n)', space: 'O(1)' },
    'binary search': { time: 'O(log n)', space: 'O(1)' },
    'linear search': { time: 'O(n)', space: 'O(1)' },
    'dfs': { time: 'O(V + E)', space: 'O(V)' },
    'bfs': { time: 'O(V + E)', space: 'O(V)' },
    'tree traversal': { time: 'O(n)', space: 'O(h)' },
    'recursion': { time: 'Varies', space: 'O(depth)' },
    'dynamic programming': { time: 'Varies', space: 'Varies' }
  };

  return complexities[algorithmType] || { time: 'Unknown', space: 'Unknown' };
}
