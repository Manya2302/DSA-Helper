import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Square, SkipBack, SkipForward, PlayCircle } from "lucide-react";

interface ExecutionControlsProps {
  isPlaying: boolean;
  currentStep: number;
  maxSteps: number;
  animationSpeed: number[];
  onPlayPause: () => void;
  onStep: (direction: 'forward' | 'backward') => void;
  onReset: () => void;
  onSpeedChange: (speed: number[]) => void;
}

export function ExecutionControls({
  isPlaying,
  currentStep,
  maxSteps,
  animationSpeed,
  onPlayPause,
  onStep,
  onReset,
  onSpeedChange
}: ExecutionControlsProps) {
  return (
    <Card data-testid="execution-controls-card">
      <CardHeader>
        <CardTitle className="flex items-center text-base">
          <PlayCircle className="w-4 h-4 text-primary mr-2" />
          Execution Controls
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Main Controls */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={isPlaying ? "secondary" : "default"}
            size="sm"
            onClick={onPlayPause}
            disabled={maxSteps === 0}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            data-testid="button-play-pause"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onReset}
            disabled={maxSteps === 0}
            className="flex-1"
            data-testid="button-reset"
          >
            <Square className="w-4 h-4" />
          </Button>
        </div>

        {/* Step Controls */}
        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStep('backward')}
            disabled={currentStep === 0 || maxSteps === 0}
            className="flex-1"
            data-testid="button-step-backward"
          >
            <SkipBack className="w-4 h-4 mr-1" />
            <span className="text-xs">Step Back</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStep('forward')}
            disabled={currentStep >= maxSteps - 1 || maxSteps === 0}
            className="flex-1"
            data-testid="button-step-forward"
          >
            <span className="text-xs mr-1">Step</span>
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Speed Control */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground">
            Animation Speed
          </Label>
          <Slider
            value={animationSpeed}
            onValueChange={onSpeedChange}
            max={10}
            min={1}
            step={1}
            className="w-full"
            data-testid="slider-animation-speed"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Slow</span>
            <span>Fast</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
