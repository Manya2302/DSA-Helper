// D3.js visualization utilities
export function createSortingVisualization(svg: SVGSVGElement, stepData: any, dimensions: { width: number; height: number }) {
  if (!stepData || !stepData.array) return;

  const { width, height } = dimensions;
  const array = stepData.array;
  const maxValue = Math.max(...array);
  const barWidth = Math.min(60, (width - 40) / array.length);
  const barSpacing = 4;
  const maxBarHeight = height - 80;

  // Create container group
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', 'translate(20, 20)');

  // Title
  const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  title.setAttribute('x', (width / 2 - 20).toString());
  title.setAttribute('y', '20');
  title.setAttribute('text-anchor', 'middle');
  title.setAttribute('fill', 'var(--foreground)');
  title.setAttribute('font-size', '16');
  title.setAttribute('font-weight', 'bold');
  title.textContent = stepData.description || 'Sorting Visualization';
  g.appendChild(title);

  // Create bars
  array.forEach((value: number, index: number) => {
    const barHeight = (value / maxValue) * maxBarHeight;
    const x = index * (barWidth + barSpacing);
    const y = height - barHeight - 60;

    // Bar
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x.toString());
    rect.setAttribute('y', y.toString());
    rect.setAttribute('width', barWidth.toString());
    rect.setAttribute('height', barHeight.toString());

    // Color based on highlights
    let fill = 'hsl(207 90% 54%)'; // Default blue
    if (stepData.highlights && stepData.highlights.includes(index)) {
      fill = 'hsl(120 60% 50%)'; // Green for highlighted
    } else if (stepData.pivot !== undefined && index === stepData.pivot) {
      fill = 'hsl(38 92% 50%)'; // Yellow for pivot
    }

    rect.setAttribute('fill', fill);
    rect.setAttribute('opacity', '0.8');
    rect.setAttribute('rx', '4');
    
    // Add animation
    if (stepData.type !== 'initial') {
      const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
      animate.setAttribute('attributeName', 'opacity');
      animate.setAttribute('values', '0.8;1;0.8');
      animate.setAttribute('dur', '1s');
      animate.setAttribute('repeatCount', 'indefinite');
      rect.appendChild(animate);
    }

    g.appendChild(rect);

    // Value label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', (x + barWidth / 2).toString());
    text.setAttribute('y', (height - 40).toString());
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'var(--muted-foreground)');
    text.setAttribute('font-size', '12');
    text.textContent = value.toString();
    g.appendChild(text);
  });

  svg.appendChild(g);
}

export function createSearchVisualization(svg: SVGSVGElement, stepData: any, dimensions: { width: number; height: number }) {
  if (!stepData || !stepData.array) return;

  const { width, height } = dimensions;
  const array = stepData.array;
  const cellWidth = Math.min(50, (width - 40) / array.length);
  const cellHeight = 40;
  const startX = (width - array.length * cellWidth) / 2;
  const startY = height / 2 - cellHeight / 2;

  // Create container group
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  // Title
  const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  title.setAttribute('x', (width / 2).toString());
  title.setAttribute('y', '30');
  title.setAttribute('text-anchor', 'middle');
  title.setAttribute('fill', 'var(--foreground)');
  title.setAttribute('font-size', '16');
  title.setAttribute('font-weight', 'bold');
  title.textContent = stepData.description || 'Binary Search Visualization';
  g.appendChild(title);

  // Create array cells
  array.forEach((value: number, index: number) => {
    const x = startX + index * cellWidth;
    const y = startY;

    // Cell background
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x.toString());
    rect.setAttribute('y', y.toString());
    rect.setAttribute('width', cellWidth.toString());
    rect.setAttribute('height', cellHeight.toString());
    rect.setAttribute('stroke', 'var(--border)');
    rect.setAttribute('stroke-width', '1');
    rect.setAttribute('rx', '4');

    // Color based on search state
    let fill = 'var(--card)';
    if (stepData.left !== undefined && stepData.right !== undefined) {
      if (index < stepData.left || index > stepData.right) {
        fill = 'var(--muted)'; // Excluded area
      } else if (stepData.mid !== undefined && index === stepData.mid) {
        fill = 'hsl(38 92% 50%)'; // Current middle element
      } else if (stepData.found && stepData.foundIndex === index) {
        fill = 'hsl(120 60% 50%)'; // Found element
      } else {
        fill = 'hsl(207 90% 54%)'; // Active search area
      }
    }

    rect.setAttribute('fill', fill);
    rect.setAttribute('opacity', '0.8');
    g.appendChild(rect);

    // Value text
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', (x + cellWidth / 2).toString());
    text.setAttribute('y', (y + cellHeight / 2 + 4).toString());
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'var(--foreground)');
    text.setAttribute('font-size', '14');
    text.setAttribute('font-weight', 'bold');
    text.textContent = value.toString();
    g.appendChild(text);

    // Index label
    const indexText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    indexText.setAttribute('x', (x + cellWidth / 2).toString());
    indexText.setAttribute('y', (y + cellHeight + 20).toString());
    indexText.setAttribute('text-anchor', 'middle');
    indexText.setAttribute('fill', 'var(--muted-foreground)');
    indexText.setAttribute('font-size', '10');
    indexText.textContent = index.toString();
    g.appendChild(indexText);
  });

  // Target indicator
  if (stepData.target !== undefined) {
    const targetText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    targetText.setAttribute('x', (width / 2).toString());
    targetText.setAttribute('y', (startY - 20).toString());
    targetText.setAttribute('text-anchor', 'middle');
    targetText.setAttribute('fill', 'var(--foreground)');
    targetText.setAttribute('font-size', '14');
    targetText.textContent = `Target: ${stepData.target}`;
    g.appendChild(targetText);
  }

  svg.appendChild(g);
}

export function createGraphVisualization(svg: SVGSVGElement, stepData: any, dimensions: { width: number; height: number }) {
  if (!stepData || !stepData.nodes || !stepData.edges) return;

  const { width, height } = dimensions;
  const nodeCount = stepData.nodes;
  const edges = stepData.edges;
  const visited = stepData.visited || [];
  const current = stepData.current;

  // Create container group
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  // Title
  const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  title.setAttribute('x', (width / 2).toString());
  title.setAttribute('y', '30');
  title.setAttribute('text-anchor', 'middle');
  title.setAttribute('fill', 'var(--foreground)');
  title.setAttribute('font-size', '16');
  title.setAttribute('font-weight', 'bold');
  title.textContent = stepData.description || 'Graph Traversal Visualization';
  g.appendChild(title);

  // Calculate node positions (simple circular layout)
  const centerX = width / 2;
  const centerY = height / 2 + 10;
  const radius = Math.min(width, height) / 4;
  const nodePositions: { x: number; y: number }[] = [];

  for (let i = 0; i < nodeCount; i++) {
    const angle = (2 * Math.PI * i) / nodeCount - Math.PI / 2;
    nodePositions.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    });
  }

  // Draw edges
  edges.forEach(([from, to]: [number, number]) => {
    const fromPos = nodePositions[from];
    const toPos = nodePositions[to];

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', fromPos.x.toString());
    line.setAttribute('y1', fromPos.y.toString());
    line.setAttribute('x2', toPos.x.toString());
    line.setAttribute('y2', toPos.y.toString());
    line.setAttribute('stroke', 'var(--border)');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('opacity', '0.6');
    g.appendChild(line);
  });

  // Draw nodes
  for (let i = 0; i < nodeCount; i++) {
    const pos = nodePositions[i];
    const nodeRadius = 20;

    // Node circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', pos.x.toString());
    circle.setAttribute('cy', pos.y.toString());
    circle.setAttribute('r', nodeRadius.toString());
    circle.setAttribute('stroke', 'var(--border)');
    circle.setAttribute('stroke-width', '2');

    // Color based on state
    let fill = 'var(--card)';
    if (current !== undefined && i === current) {
      fill = 'hsl(38 92% 50%)'; // Current node
    } else if (visited[i]) {
      fill = 'hsl(120 60% 50%)'; // Visited node
    } else {
      fill = 'hsl(207 90% 54%)'; // Unvisited node
    }

    circle.setAttribute('fill', fill);
    circle.setAttribute('opacity', '0.8');

    // Add pulse animation for current node
    if (current !== undefined && i === current) {
      const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
      animate.setAttribute('attributeName', 'r');
      animate.setAttribute('values', `${nodeRadius};${nodeRadius + 5};${nodeRadius}`);
      animate.setAttribute('dur', '1s');
      animate.setAttribute('repeatCount', 'indefinite');
      circle.appendChild(animate);
    }

    g.appendChild(circle);

    // Node label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', pos.x.toString());
    text.setAttribute('y', (pos.y + 4).toString());
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'var(--foreground)');
    text.setAttribute('font-size', '14');
    text.setAttribute('font-weight', 'bold');
    text.textContent = i.toString();
    g.appendChild(text);
  }

  // Visit order indicator
  if (stepData.visitOrder) {
    const visitText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    visitText.setAttribute('x', '20');
    visitText.setAttribute('y', (height - 20).toString());
    visitText.setAttribute('fill', 'var(--muted-foreground)');
    visitText.setAttribute('font-size', '12');
    visitText.textContent = `Visit Order: ${stepData.visitOrder.join(' → ')}`;
    g.appendChild(visitText);
  }

  svg.appendChild(g);
}
