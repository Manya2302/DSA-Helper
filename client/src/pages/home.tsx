import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MonacoEditor } from "@/components/monaco-editor";
import { AlgorithmVisualization } from "@/components/algorithm-visualization";
import { AlgorithmSidebar } from "@/components/algorithm-sidebar";
import { ExecutionControls } from "@/components/execution-controls";
import { 
  Play, Pause, Square, SkipBack, SkipForward, 
  Save, Settings, HelpCircle, Code, BarChart3,
  Terminal, Info, Lightbulb, PlayCircle 
} from "lucide-react";

interface Algorithm {
  id: string;
  name: string;
  category: string;
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
  implementations: Record<string, string>;
}

interface ExecutionResult {
  success: boolean;
  algorithmType: string;
  executionTime: number;
  memoryUsage: number;
  output?: string;
  originalArray?: number[];
  sortedArray?: number[];
  found?: boolean;
  foundIndex?: number;
  visitOrder?: number[];
  steps: any[];
}

interface DetectionResult {
  algorithmType: string;
  confidence: number;
  details: string;
}

export default function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(`function quickSort(arr) {
  if (arr.length <= 1) {
    return arr;
  }

  const pivot = arr[Math.floor(arr.length / 2)];
  const left = [];
  const right = [];

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < pivot) {
      left.push(arr[i]);
    } else if (arr[i] > pivot) {
      right.push(arr[i]);
    }
  }

  return [...quickSort(left), pivot, ...quickSort(right)];
}`);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState([5]);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [detectedAlgorithm, setDetectedAlgorithm] = useState<DetectionResult | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all algorithms
  const { data: algorithms, isLoading: algorithmsLoading } = useQuery<Algorithm[]>({
    queryKey: ["/api/algorithms"],
  });

  // Algorithm detection mutation
  const detectAlgorithmMutation = useMutation({
    mutationFn: async ({ code, language }: { code: string; language: string }) => {
      const response = await apiRequest("POST", "/api/algorithm/detect", { code, language });
      return response.json();
    },
    onSuccess: (data: DetectionResult) => {
      setDetectedAlgorithm(data);
    },
    onError: (error: any) => {
      toast({
        title: "Detection Failed",
        description: error.message || "Failed to detect algorithm type",
        variant: "destructive",
      });
    },
  });

  // Code execution mutation
  const executeCodeMutation = useMutation({
    mutationFn: async ({ code, language, input }: { code: string; language: string; input?: any }) => {
      const response = await apiRequest("POST", "/api/execute", { code, language, input });
      return response.json();
    },
    onSuccess: (data: ExecutionResult) => {
      setExecutionResult(data);
      setCurrentStep(0);
      toast({
        title: "Execution Successful",
        description: `Algorithm executed in ${data.executionTime.toFixed(2)}ms`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Execution Failed",
        description: error.message || "Failed to execute code",
        variant: "destructive",
      });
    },
  });

  // Save project mutation
  const saveProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      const response = await apiRequest("POST", "/api/projects", projectData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Project Saved",
        description: "Your project has been saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save project",
        variant: "destructive",
      });
    },
  });

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    
    // Auto-detect algorithm type when code changes
    if (newCode.trim().length > 50) {
      detectAlgorithmMutation.mutate({ code: newCode, language: selectedLanguage });
    }
  }, [selectedLanguage, detectAlgorithmMutation]);

  const handleVisualize = () => {
    executeCodeMutation.mutate({ code, language: selectedLanguage });
  };

  const handleSaveProject = () => {
    saveProjectMutation.mutate({
      name: `${detectedAlgorithm?.algorithmType || 'Unknown'} Algorithm`,
      language: selectedLanguage,
      code,
      algorithmType: detectedAlgorithm?.algorithmType,
      isPublic: false,
    });
  };

  const handleAlgorithmSelect = (algorithm: Algorithm) => {
    if (algorithm.implementations[selectedLanguage]) {
      setCode(algorithm.implementations[selectedLanguage]);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStep = (direction: 'forward' | 'backward') => {
    if (!executionResult?.steps) return;
    
    const maxSteps = executionResult.steps.length - 1;
    if (direction === 'forward' && currentStep < maxSteps) {
      setCurrentStep(currentStep + 1);
    } else if (direction === 'backward' && currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50" data-testid="header">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Code className="text-primary text-2xl" data-testid="logo-icon" />
                <h1 className="text-xl font-bold" data-testid="app-title">DSA Visualizer</h1>
              </div>
              <span className="text-sm text-muted-foreground" data-testid="app-subtitle">Code Execution + Algorithm Visualization</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" data-testid="button-help">
                <HelpCircle className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Help</span>
              </Button>
              <Button variant="ghost" size="sm" data-testid="button-settings">
                <Settings className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
              <Button 
                onClick={handleSaveProject}
                disabled={saveProjectMutation.isPending}
                data-testid="button-save-project"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Project
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-screen">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6" data-testid="sidebar">
            {/* Language Selector */}
            <Card data-testid="card-language-selector">
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Code className="w-4 h-4 text-primary mr-2" />
                  Language
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage} data-testid="select-language">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="c">C</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Algorithm Examples */}
            <AlgorithmSidebar 
              algorithms={algorithms || []}
              loading={algorithmsLoading}
              onAlgorithmSelect={handleAlgorithmSelect}
              data-testid="algorithm-sidebar"
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6" data-testid="main-content">
            {/* Code Editor */}
            <Card data-testid="card-code-editor">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Code className="w-5 h-5 text-primary mr-2" />
                    Code Editor
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {detectedAlgorithm && (
                      <Badge variant="secondary" data-testid="badge-detected-algorithm">
                        {detectedAlgorithm.algorithmType} Detected
                      </Badge>
                    )}
                    <Button 
                      onClick={handleVisualize} 
                      disabled={executeCodeMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                      data-testid="button-visualize"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {executeCodeMutation.isPending ? "Executing..." : "Visualize"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <MonacoEditor
                  value={code}
                  language={selectedLanguage}
                  onChange={handleCodeChange}
                  data-testid="monaco-editor"
                />
              </CardContent>
            </Card>

            {/* Visualization and Controls */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Visualization Panel */}
              <div className="xl:col-span-2" data-testid="visualization-panel">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="w-5 h-5 text-primary mr-2" />
                      Algorithm Visualization
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AlgorithmVisualization
                      executionResult={executionResult}
                      currentStep={currentStep}
                      isPlaying={isPlaying}
                      data-testid="algorithm-visualization"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Controls and Status */}
              <div className="xl:col-span-1 space-y-4" data-testid="controls-panel">
                {/* Execution Controls */}
                <ExecutionControls
                  isPlaying={isPlaying}
                  currentStep={currentStep}
                  maxSteps={executionResult?.steps.length || 0}
                  animationSpeed={animationSpeed}
                  onPlayPause={handlePlayPause}
                  onStep={handleStep}
                  onReset={handleReset}
                  onSpeedChange={setAnimationSpeed}
                  data-testid="execution-controls"
                />

                {/* Execution Status */}
                <Card data-testid="card-execution-status">
                  <CardHeader>
                    <CardTitle className="flex items-center text-base">
                      <Info className="w-4 h-4 text-primary mr-2" />
                      Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Algorithm:</span>
                        <span className="text-sm font-medium" data-testid="text-algorithm-type">
                          {detectedAlgorithm?.algorithmType || 'Unknown'}
                        </span>
                      </div>
                      {detectedAlgorithm && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Confidence:</span>
                            <span className="text-sm font-medium" data-testid="text-confidence">
                              {Math.round(detectedAlgorithm.confidence * 100)}%
                            </span>
                          </div>
                        </>
                      )}
                      {executionResult && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Execution Time:</span>
                            <span className="text-sm font-medium" data-testid="text-execution-time">
                              {executionResult.executionTime.toFixed(2)}ms
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Memory Usage:</span>
                            <span className="text-sm font-medium" data-testid="text-memory-usage">
                              {(executionResult.memoryUsage / 1000).toFixed(1)}KB
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Current Step:</span>
                            <span className="text-sm font-medium" data-testid="text-current-step">
                              {currentStep + 1} / {executionResult.steps.length}
                            </span>
                          </div>
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Progress</span>
                              <span data-testid="text-progress-percentage">
                                {Math.round(((currentStep + 1) / executionResult.steps.length) * 100)}%
                              </span>
                            </div>
                            <Progress 
                              value={((currentStep + 1) / executionResult.steps.length) * 100}
                              data-testid="progress-execution"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Algorithm Info */}
                <Card data-testid="card-algorithm-info">
                  <CardHeader>
                    <CardTitle className="flex items-center text-base">
                      <Lightbulb className="w-4 h-4 text-primary mr-2" />
                      Algorithm Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground space-y-2">
                      {executionResult?.steps[currentStep] ? (
                        <>
                          <p data-testid="text-current-operation">
                            <strong>Current Operation:</strong>{' '}
                            {executionResult.steps[currentStep].description}
                          </p>
                          {currentStep < executionResult.steps.length - 1 && (
                            <p data-testid="text-next-step">
                              <strong>Next Step:</strong>{' '}
                              {executionResult.steps[currentStep + 1]?.description}
                            </p>
                          )}
                        </>
                      ) : (
                        <p data-testid="text-no-execution">
                          Click "Visualize" to execute your algorithm and see step-by-step visualization.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Output and Results */}
            <Card data-testid="card-output-results">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Terminal className="w-5 h-5 text-primary mr-2" />
                  Output & Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-secondary rounded-lg p-4 font-mono text-sm">
                  {executionResult ? (
                    <div data-testid="execution-output">
                      <div className="text-green-400 mb-2">✓ Code executed successfully</div>
                      <div className="text-muted-foreground mb-2">
                        Execution time: {executionResult.executionTime.toFixed(3)}ms
                      </div>
                      <div className="text-muted-foreground mb-4">
                        Memory usage: {(executionResult.memoryUsage / 1000).toFixed(1)}KB
                      </div>
                      
                      <Separator className="my-4" />
                      
                      {executionResult.originalArray && (
                        <>
                          <div className="text-muted-foreground mb-2">Original Array:</div>
                          <div className="text-foreground mb-4" data-testid="text-original-array">
                            [{executionResult.originalArray.join(', ')}]
                          </div>
                        </>
                      )}
                      
                      {executionResult.sortedArray && (
                        <>
                          <div className="text-muted-foreground mb-2">Sorted Array:</div>
                          <div className="text-green-400" data-testid="text-sorted-array">
                            [{executionResult.sortedArray.join(', ')}]
                          </div>
                        </>
                      )}

                      {executionResult.found !== undefined && (
                        <div className="text-green-400" data-testid="text-search-result">
                          {executionResult.found 
                            ? `Target found at index ${executionResult.foundIndex}`
                            : 'Target not found'
                          }
                        </div>
                      )}

                      {executionResult.visitOrder && (
                        <>
                          <div className="text-muted-foreground mb-2">Visit Order:</div>
                          <div className="text-green-400" data-testid="text-visit-order">
                            [{executionResult.visitOrder.join(' → ')}]
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted-foreground" data-testid="no-output">
                      No execution results yet. Run your algorithm to see output here.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
