import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { createSortingVisualization, createSearchVisualization, createGraphVisualization } from "@/lib/d3-visualization";

interface ExecutionResult {
  success: boolean;
  algorithmType: string;
  executionTime: number;
  memoryUsage: number;
  steps: any[];
}

interface AlgorithmVisualizationProps {
  executionResult: ExecutionResult | null;
  currentStep: number;
  isPlaying: boolean;
}

export function AlgorithmVisualization({ 
  executionResult, 
  currentStep, 
  isPlaying 
}: AlgorithmVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 300 });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current?.parentElement) {
        const rect = svgRef.current.parentElement.getBoundingClientRect();
        setDimensions({
          width: Math.max(400, rect.width - 32),
          height: 300
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!executionResult || !svgRef.current) return;

    const svg = svgRef.current;
    const currentStepData = executionResult.steps[currentStep];

    // Clear previous visualization
    svg.innerHTML = '';

    try {
      switch (executionResult.algorithmType) {
        case 'sorting':
          createSortingVisualization(svg, currentStepData, dimensions);
          break;
        case 'searching':
          createSearchVisualization(svg, currentStepData, dimensions);
          break;
        case 'graph':
          createGraphVisualization(svg, currentStepData, dimensions);
          break;
        default:
          createDefaultVisualization(svg, dimensions);
      }
    } catch (error) {
      console.error('Visualization error:', error);
      createDefaultVisualization(svg, dimensions);
    }
  }, [executionResult, currentStep, dimensions]);

  if (!executionResult) {
    return (
      <div className="h-64 flex items-center justify-center bg-card border border-border rounded-lg">
        <div className="text-center text-muted-foreground">
          <div className="text-4xl mb-4">📊</div>
          <p>Execute your algorithm to see visualization</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 bg-card border border-border rounded-lg overflow-hidden">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      />
    </div>
  );
}

function createDefaultVisualization(svg: SVGSVGElement, dimensions: { width: number; height: number }) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', (dimensions.width / 2).toString());
  text.setAttribute('y', (dimensions.height / 2).toString());
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('fill', 'var(--muted-foreground)');
  text.setAttribute('font-size', '16');
  text.textContent = 'Algorithm visualization will appear here';
  
  g.appendChild(text);
  svg.appendChild(g);
}
