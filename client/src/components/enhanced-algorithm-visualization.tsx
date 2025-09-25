import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { EnhancedVisualizer } from "@/lib/enhanced-visualizations";
import { TraceStep } from "@/lib/code-tracer";

interface EnhancedAlgorithmVisualizationProps {
  traceSteps: TraceStep[];
  currentStep: number;
  isPlaying: boolean;
}

export function EnhancedAlgorithmVisualization({ 
  traceSteps, 
  currentStep, 
  isPlaying 
}: EnhancedAlgorithmVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const visualizerRef = useRef<EnhancedVisualizer | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current?.parentElement) {
        const rect = svgRef.current.parentElement.getBoundingClientRect();
        setDimensions({
          width: Math.max(600, rect.width - 32),
          height: 400
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize visualizer
  useEffect(() => {
    if (svgRef.current && !visualizerRef.current) {
      visualizerRef.current = new EnhancedVisualizer(svgRef.current, {
        width: dimensions.width,
        height: dimensions.height,
        theme: 'dark',
        animationSpeed: 1
      });
    }
  }, [dimensions]);

  // Update visualization when step changes
  useEffect(() => {
    if (visualizerRef.current && traceSteps && traceSteps[currentStep]) {
      const step = traceSteps[currentStep];
      visualizerRef.current.renderStep(step);
    }
  }, [traceSteps, currentStep]);

  if (!traceSteps || traceSteps.length === 0) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="text-4xl mb-4">🔍</div>
          <p>Run code with tracing to see enhanced visualization</p>
          <p className="text-sm mt-2">Supports line-by-line execution tracking</p>
        </div>
      </Card>
    );
  }

  const currentTraceStep = traceSteps[currentStep];

  return (
    <Card className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Enhanced Algorithm Visualization
        </h3>
        <div className="flex justify-between items-center mt-2">
          <div className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {traceSteps.length}
          </div>
          <div className="text-sm font-mono bg-secondary px-2 py-1 rounded">
            {currentTraceStep?.action || 'READY'}
          </div>
        </div>
      </div>

      {/* Main visualization area */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        >
          {/* Define arrow marker for queue/stack indicators */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="var(--foreground)"
              />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Step information panel */}
      {currentTraceStep && (
        <div className="mt-4 p-3 bg-secondary rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-2">Current Step</h4>
              <p className="text-sm font-mono text-muted-foreground">
                Line {currentTraceStep.lineNumber + 1}: {currentTraceStep.lineContent}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Action: {currentTraceStep.action}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-2">Variables</h4>
              <div className="text-xs font-mono text-muted-foreground space-y-1">
                {Object.entries(currentTraceStep.variables).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span>{key}:</span>
                    <span className="text-primary">{JSON.stringify(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Data structures summary */}
          {currentTraceStep.dataStructures.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <h4 className="font-semibold text-sm text-foreground mb-2">Data Structures</h4>
              <div className="flex flex-wrap gap-2">
                {currentTraceStep.dataStructures.map((ds, index) => (
                  <div key={index} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    {ds.name || ds.type}: {Array.isArray(ds.data) ? `[${ds.data.length} items]` : ds.type}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}