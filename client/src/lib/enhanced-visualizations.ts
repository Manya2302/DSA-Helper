// Enhanced visualization library for advanced data structure visualization
import { TraceStep, DataStructureState } from './code-tracer';

export interface VisualizationConfig {
  width: number;
  height: number;
  theme: 'light' | 'dark';
  animationSpeed: number;
}

export class EnhancedVisualizer {
  private svg: SVGSVGElement;
  private config: VisualizationConfig;

  constructor(svg: SVGSVGElement, config: VisualizationConfig) {
    this.svg = svg;
    this.config = config;
  }

  public renderStep(step: TraceStep): void {
    // Clear previous visualization
    this.svg.innerHTML = '';

    // Create main container
    const mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Add step description
    this.addStepDescription(mainGroup, step);
    
    // Render all data structures
    step.dataStructures.forEach((ds, index) => {
      const yOffset = 60 + (index * 150);
      this.renderDataStructure(mainGroup, ds, yOffset);
    });

    this.svg.appendChild(mainGroup);
  }

  private addStepDescription(container: SVGElement, step: TraceStep): void {
    // Title with step information
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', '20');
    title.setAttribute('y', '25');
    title.setAttribute('fill', 'var(--foreground)');
    title.setAttribute('font-size', '16');
    title.setAttribute('font-weight', 'bold');
    title.textContent = `Line ${step.lineNumber + 1}: ${step.action}`;
    container.appendChild(title);

    // Description with word wrapping
    const description = step.description;
    const lines = this.wrapText(description, 80);
    
    lines.forEach((line, index) => {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', '20');
      text.setAttribute('y', (45 + index * 16).toString());
      text.setAttribute('fill', 'var(--muted-foreground)');
      text.setAttribute('font-size', '12');
      text.textContent = line;
      container.appendChild(text);
    });
  }

  private renderDataStructure(container: SVGElement, ds: DataStructureState, yOffset: number): void {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('transform', `translate(0, ${yOffset})`);

    switch (ds.type) {
      case 'array':
        this.renderArray(group, ds);
        break;
      case 'queue':
        this.renderQueue(group, ds);
        break;
      case 'stack':
        this.renderStack(group, ds);
        break;
      case 'tree':
        this.renderTree(group, ds);
        break;
      case 'graph':
        this.renderGraph(group, ds);
        break;
      default:
        this.renderGeneric(group, ds);
    }

    container.appendChild(group);
  }

  private renderArray(container: SVGElement, ds: DataStructureState): void {
    const array = ds.data as number[];
    const cellWidth = Math.min(60, (this.config.width - 40) / array.length);
    const cellHeight = 40;
    const startX = 20;

    // Array label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', startX.toString());
    label.setAttribute('y', '15');
    label.setAttribute('fill', 'var(--foreground)');
    label.setAttribute('font-size', '14');
    label.setAttribute('font-weight', 'bold');
    label.textContent = ds.name || 'Array';
    container.appendChild(label);

    // Render array cells
    array.forEach((value, index) => {
      const x = startX + index * (cellWidth + 2);
      const y = 25;

      // Cell background
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x.toString());
      rect.setAttribute('y', y.toString());
      rect.setAttribute('width', cellWidth.toString());
      rect.setAttribute('height', cellHeight.toString());
      rect.setAttribute('stroke', 'var(--border)');
      rect.setAttribute('stroke-width', '2');
      rect.setAttribute('rx', '4');

      // Color based on state
      let fill = 'var(--card)';
      let strokeColor = 'var(--border)';

      if (ds.pivot !== undefined && index === ds.pivot) {
        fill = 'hsl(38 92% 50%)'; // Pivot - yellow/orange
        strokeColor = 'hsl(38 92% 40%)';
      } else if (ds.highlight && ds.highlight.includes(index)) {
        fill = 'hsl(120 60% 50%)'; // Highlighted - green
        strokeColor = 'hsl(120 60% 40%)';
      } else if (ds.current !== undefined && index === ds.current) {
        fill = 'hsl(207 90% 54%)'; // Current - blue
        strokeColor = 'hsl(207 90% 44%)';
      } else if (ds.left !== undefined && ds.right !== undefined) {
        if (index < ds.left || index > ds.right) {
          fill = 'var(--muted)'; // Excluded
          strokeColor = 'var(--muted-foreground)';
        }
      }

      rect.setAttribute('fill', fill);
      rect.setAttribute('stroke', strokeColor);
      rect.setAttribute('opacity', '0.9');

      // Add pulse animation for highlighted elements
      if ((ds.highlight && ds.highlight.includes(index)) || 
          (ds.current !== undefined && index === ds.current) ||
          (ds.pivot !== undefined && index === ds.pivot)) {
        const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animate.setAttribute('attributeName', 'opacity');
        animate.setAttribute('values', '0.9;1;0.9');
        animate.setAttribute('dur', '1.5s');
        animate.setAttribute('repeatCount', 'indefinite');
        rect.appendChild(animate);
      }

      container.appendChild(rect);

      // Value text
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', (x + cellWidth / 2).toString());
      text.setAttribute('y', (y + cellHeight / 2 + 5).toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', 'var(--foreground)');
      text.setAttribute('font-size', '14');
      text.setAttribute('font-weight', 'bold');
      text.textContent = value.toString();
      container.appendChild(text);

      // Index label
      const indexText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      indexText.setAttribute('x', (x + cellWidth / 2).toString());
      indexText.setAttribute('y', (y + cellHeight + 15).toString());
      indexText.setAttribute('text-anchor', 'middle');
      indexText.setAttribute('fill', 'var(--muted-foreground)');
      indexText.setAttribute('font-size', '10');
      indexText.textContent = index.toString();
      container.appendChild(indexText);
    });

    // Add partition indicators for quicksort
    if (ds.left !== undefined && ds.right !== undefined && ds.pivot !== undefined) {
      this.addPartitionIndicators(container, startX, cellWidth, ds.left, ds.right, ds.pivot, array.length);
    }
  }

  private renderQueue(container: SVGElement, ds: DataStructureState): void {
    const queue = ds.data as number[];
    const cellWidth = 50;
    const cellHeight = 40;
    const startX = 20;

    // Queue label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', startX.toString());
    label.setAttribute('y', '15');
    label.setAttribute('fill', 'var(--foreground)');
    label.setAttribute('font-size', '14');
    label.setAttribute('font-weight', 'bold');
    label.textContent = 'Queue (FIFO)';
    container.appendChild(label);

    // Front and Rear arrows
    const frontArrow = this.createArrow(startX - 15, 45, 'Front');
    const rearArrow = this.createArrow(startX + queue.length * (cellWidth + 2) + 15, 45, 'Rear');
    container.appendChild(frontArrow);
    container.appendChild(rearArrow);

    // Render queue cells
    queue.forEach((value, index) => {
      const x = startX + index * (cellWidth + 2);
      const y = 25;

      // Cell
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x.toString());
      rect.setAttribute('y', y.toString());
      rect.setAttribute('width', cellWidth.toString());
      rect.setAttribute('height', cellHeight.toString());
      rect.setAttribute('stroke', 'hsl(207 90% 54%)');
      rect.setAttribute('stroke-width', '2');
      rect.setAttribute('fill', 'hsl(207 90% 54%)');
      rect.setAttribute('opacity', '0.8');
      rect.setAttribute('rx', '4');

      // Highlight for operations
      if (ds.highlight && ds.highlight.includes(index)) {
        rect.setAttribute('fill', 'hsl(120 60% 50%)');
        const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animate.setAttribute('attributeName', 'opacity');
        animate.setAttribute('values', '0.8;1;0.8');
        animate.setAttribute('dur', '1s');
        animate.setAttribute('repeatCount', 'indefinite');
        rect.appendChild(animate);
      }

      container.appendChild(rect);

      // Value
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', (x + cellWidth / 2).toString());
      text.setAttribute('y', (y + cellHeight / 2 + 5).toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', 'white');
      text.setAttribute('font-size', '14');
      text.setAttribute('font-weight', 'bold');
      text.textContent = value.toString();
      container.appendChild(text);
    });
  }

  private renderStack(container: SVGElement, ds: DataStructureState): void {
    const stack = ds.data as number[];
    const cellWidth = 60;
    const cellHeight = 30;
    const startX = 20;

    // Stack label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', startX.toString());
    label.setAttribute('y', '15');
    label.setAttribute('fill', 'var(--foreground)');
    label.setAttribute('font-size', '14');
    label.setAttribute('font-weight', 'bold');
    label.textContent = 'Stack (LIFO)';
    container.appendChild(label);

    // Top indicator
    if (stack.length > 0) {
      const topArrow = this.createArrow(startX + cellWidth + 15, 25 + cellHeight / 2, 'Top');
      container.appendChild(topArrow);
    }

    // Render stack cells (bottom to top)
    stack.forEach((value, index) => {
      const x = startX;
      const y = 25 + (stack.length - 1 - index) * (cellHeight + 2);

      // Cell
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x.toString());
      rect.setAttribute('y', y.toString());
      rect.setAttribute('width', cellWidth.toString());
      rect.setAttribute('height', cellHeight.toString());
      rect.setAttribute('stroke', 'hsl(280 60% 50%)');
      rect.setAttribute('stroke-width', '2');
      rect.setAttribute('fill', 'hsl(280 60% 50%)');
      rect.setAttribute('opacity', '0.8');
      rect.setAttribute('rx', '4');

      // Highlight top element
      if (index === stack.length - 1) {
        rect.setAttribute('fill', 'hsl(280 60% 60%)');
        const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animate.setAttribute('attributeName', 'opacity');
        animate.setAttribute('values', '0.8;1;0.8');
        animate.setAttribute('dur', '1.5s');
        animate.setAttribute('repeatCount', 'indefinite');
        rect.appendChild(animate);
      }

      container.appendChild(rect);

      // Value
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', (x + cellWidth / 2).toString());
      text.setAttribute('y', (y + cellHeight / 2 + 5).toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', 'white');
      text.setAttribute('font-size', '12');
      text.setAttribute('font-weight', 'bold');
      text.textContent = value.toString();
      container.appendChild(text);
    });
  }

  private renderTree(container: SVGElement, ds: DataStructureState): void {
    // Tree visualization implementation
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', '20');
    label.setAttribute('y', '15');
    label.setAttribute('fill', 'var(--foreground)');
    label.setAttribute('font-size', '14');
    label.setAttribute('font-weight', 'bold');
    label.textContent = 'Tree Structure';
    container.appendChild(label);
    // TODO: Implement tree visualization
  }

  private renderGraph(container: SVGElement, ds: DataStructureState): void {
    // Graph visualization implementation
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', '20');
    label.setAttribute('y', '15');
    label.setAttribute('fill', 'var(--foreground)');
    label.setAttribute('font-size', '14');
    label.setAttribute('font-weight', 'bold');
    label.textContent = 'Graph Structure';
    container.appendChild(label);
    // TODO: Implement graph visualization
  }

  private renderGeneric(container: SVGElement, ds: DataStructureState): void {
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', '20');
    label.setAttribute('y', '15');
    label.setAttribute('fill', 'var(--foreground)');
    label.setAttribute('font-size', '14');
    label.setAttribute('font-weight', 'bold');
    label.textContent = ds.name || 'Data Structure';
    container.appendChild(label);

    const value = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    value.setAttribute('x', '20');
    value.setAttribute('y', '35');
    value.setAttribute('fill', 'var(--muted-foreground)');
    value.setAttribute('font-size', '12');
    value.textContent = JSON.stringify(ds.data);
    container.appendChild(value);
  }

  private addPartitionIndicators(container: SVGElement, startX: number, cellWidth: number, 
                                 left: number, right: number, pivot: number, arrayLength: number): void {
    const y = 85;
    
    // Left partition
    if (left > 0) {
      const leftBracket = this.createBracket(
        startX, 
        startX + left * (cellWidth + 2) - 2, 
        y, 
        `≤${pivot}`, 
        'hsl(120 60% 50%)'
      );
      container.appendChild(leftBracket);
    }

    // Right partition
    if (right < arrayLength - 1) {
      const rightBracket = this.createBracket(
        startX + (right + 1) * (cellWidth + 2), 
        startX + arrayLength * (cellWidth + 2) - 2, 
        y, 
        `>${pivot}`, 
        'hsl(207 90% 54%)'
      );
      container.appendChild(rightBracket);
    }
  }

  private createBracket(x1: number, x2: number, y: number, label: string, color: string): SVGElement {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Bracket line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1.toString());
    line.setAttribute('y1', y.toString());
    line.setAttribute('x2', x2.toString());
    line.setAttribute('y2', y.toString());
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '2');
    group.appendChild(line);

    // Label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', ((x1 + x2) / 2).toString());
    text.setAttribute('y', (y + 15).toString());
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', color);
    text.setAttribute('font-size', '12');
    text.setAttribute('font-weight', 'bold');
    text.textContent = label;
    group.appendChild(text);

    return group;
  }

  private createArrow(x: number, y: number, label: string): SVGElement {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Arrow line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x.toString());
    line.setAttribute('y1', (y - 10).toString());
    line.setAttribute('x2', x.toString());
    line.setAttribute('y2', (y + 10).toString());
    line.setAttribute('stroke', 'var(--foreground)');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('marker-end', 'url(#arrowhead)');
    group.appendChild(line);

    // Label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x.toString());
    text.setAttribute('y', (y + 25).toString());
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'var(--muted-foreground)');
    text.setAttribute('font-size', '10');
    text.textContent = label;
    group.appendChild(text);

    return group;
  }

  private wrapText(text: string, maxLength: number): string[] {
    const lines = text.split('\n');
    const wrappedLines: string[] = [];

    for (const line of lines) {
      if (line.length <= maxLength) {
        wrappedLines.push(line);
      } else {
        const words = line.split(' ');
        let currentLine = '';
        
        for (const word of words) {
          if ((currentLine + word).length <= maxLength) {
            currentLine += (currentLine ? ' ' : '') + word;
          } else {
            if (currentLine) wrappedLines.push(currentLine);
            currentLine = word;
          }
        }
        
        if (currentLine) wrappedLines.push(currentLine);
      }
    }

    return wrappedLines;
  }
}