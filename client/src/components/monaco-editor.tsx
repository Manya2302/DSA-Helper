import { useEffect, useRef } from "react";

interface MonacoEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  height?: string;
  theme?: string;
}

export function MonacoEditor({ 
  value, 
  language, 
  onChange, 
  height = "400px",
  theme = "vs-dark"
}: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<any>(null);
  const editorInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Load Monaco Editor dynamically
    const loadMonaco = async () => {
      if (typeof window !== 'undefined' && !monacoRef.current) {
        try {
          // Load Monaco from CDN
          await loadScript('https://unpkg.com/monaco-editor@latest/min/vs/loader.js');
          
          // Give time for the script to load and initialize
          await new Promise(resolve => setTimeout(resolve, 100));
          
          if (!(window as any).require) {
            console.error('Monaco loader failed to initialize');
            return;
          }
          
          (window as any).require.config({ 
            paths: { vs: 'https://unpkg.com/monaco-editor@latest/min/vs' } 
          });
          
          (window as any).require(['vs/editor/editor.main'], (monaco: any) => {
            if (monaco && monaco.editor) {
              monacoRef.current = monaco;
              initializeEditor();
            } else {
              console.error('Monaco editor object not properly loaded');
            }
          });
        } catch (error) {
          console.error('Failed to load Monaco Editor:', error);
        }
      }
    };

    const initializeEditor = () => {
      if (editorRef.current && monacoRef.current && monacoRef.current.editor && !editorInstanceRef.current) {
        try {
          editorInstanceRef.current = monacoRef.current.editor.create(editorRef.current, {
            value,
            language,
            theme,
            automaticLayout: true,
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            minimap: { enabled: false },
            folding: true,
            lineDecorationsWidth: 20,
            lineNumbersMinChars: 3,
          });

          // Set up change listener
          editorInstanceRef.current.onDidChangeModelContent(() => {
            const newValue = editorInstanceRef.current.getValue();
            onChange(newValue);
          });
        } catch (error) {
          console.error('Failed to initialize Monaco Editor:', error);
        }
      }
    };

    loadMonaco();

    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.dispose();
        editorInstanceRef.current = null;
      }
    };
  }, []);

  // Update editor value when prop changes
  useEffect(() => {
    if (editorInstanceRef.current && value !== editorInstanceRef.current.getValue()) {
      editorInstanceRef.current.setValue(value);
    }
  }, [value]);

  // Update editor language when prop changes
  useEffect(() => {
    if (editorInstanceRef.current && monacoRef.current) {
      const model = editorInstanceRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelLanguage(model, language);
      }
    }
  }, [language]);

  // Fallback to simple textarea if Monaco fails
  if (!monacoRef.current || !editorInstanceRef.current) {
    return (
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-96 p-4 font-mono text-sm bg-secondary text-foreground border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder={`Enter your ${language} code here...`}
          spellCheck={false}
          data-testid="fallback-code-editor"
        />
        <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-background px-2 py-1 rounded">
          {language} (fallback editor)
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={editorRef} 
      style={{ height, border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
      className="monaco-editor-container"
    />
  );
}

// Utility function to load external scripts
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}
