import { useCallback, useRef } from "react";
import { TraceStep } from "@/lib/code-tracer";

interface EnhancedMonacoEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  height?: string;
  theme?: string;
  currentTraceStep?: TraceStep | null;
  onLineHighlight?: (lineNumber: number) => void;
}

export function EnhancedMonacoEditor({ 
  value, 
  language, 
  onChange, 
  height = "400px",
  currentTraceStep,
  onLineHighlight
}: EnhancedMonacoEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle line clicking for debugging - properly memoized
  const handleTextareaClick = useCallback((e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (textareaRef.current && onLineHighlight) {
      const textarea = textareaRef.current;
      const clickPosition = textarea.selectionStart;
      const textBeforeCursor = textarea.value.substring(0, clickPosition);
      const lineNumber = textBeforeCursor.split('\n').length; // Fixed: no -1 needed
      onLineHighlight(lineNumber - 1); // Pass 0-based index
    }
  }, [onLineHighlight]);

  // Handle textarea change properly for controlled component
  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  // Calculate which lines to highlight
  const getHighlightedText = () => {
    if (!currentTraceStep) return value;
    
    const lines = value.split('\n');
    const currentLine = currentTraceStep.lineNumber;
    
    return lines.map((line, index) => {
      if (index === currentLine) {
        return `>>> ${line} <<<`;  // Simple highlight indicator
      }
      return line;
    }).join('\n');
  };

  return (
    <div className="relative">
      <style>{`
        .code-editor {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 14px;
          line-height: 1.6;
          background-color: var(--secondary);
          color: var(--foreground);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 16px;
          resize: none;
          width: 100%;
          height: ${height};
          outline: none;
          tab-size: 2;
          white-space: pre;
          overflow-wrap: normal;
          overflow-x: auto;
        }
        .code-editor:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(var(--primary), 0.2);
        }
        .code-editor-container {
          position: relative;
        }
        .line-numbers {
          position: absolute;
          left: 0;
          top: 16px;
          padding: 0 8px;
          background-color: var(--muted);
          color: var(--muted-foreground);
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 14px;
          line-height: 1.6;
          text-align: right;
          user-select: none;
          border-right: 1px solid var(--border);
          width: 40px;
          overflow: hidden;
        }
        .code-editor-with-numbers {
          padding-left: 56px;
        }
      `}</style>
      
      <div className="code-editor-container">
        {/* Line numbers */}
        <div className="line-numbers">
          {value.split('\n').map((_, index) => (
            <div 
              key={index}
              style={{ 
                backgroundColor: currentTraceStep?.lineNumber === index ? 'rgba(255, 215, 0, 0.3)' : 'transparent',
                fontWeight: currentTraceStep?.lineNumber === index ? 'bold' : 'normal'
              }}
            >
              {index + 1}
            </div>
          ))}
        </div>
        
        {/* Code editor */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextareaChange}
          onClick={handleTextareaClick}
          className="code-editor code-editor-with-numbers"
          placeholder={`Enter your ${language} code here...`}
          spellCheck={false}
          data-testid="enhanced-code-editor"
        />
        
        {/* Language indicator */}
        <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-background px-2 py-1 rounded">
          {language}
        </div>
        
        {/* Current execution indicator */}
        {currentTraceStep && (
          <div className="absolute top-8 right-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-mono">
            ▶ Line {currentTraceStep.lineNumber + 1}: {currentTraceStep.action}
          </div>
        )}
      </div>
    </div>
  );
}