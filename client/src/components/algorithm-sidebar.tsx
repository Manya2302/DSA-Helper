import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Book, Clock } from "lucide-react";

interface Algorithm {
  id: string;
  name: string;
  category: string;
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
  implementations: Record<string, string>;
}

interface AlgorithmSidebarProps {
  algorithms: Algorithm[];
  loading: boolean;
  onAlgorithmSelect: (algorithm: Algorithm) => void;
}

export function AlgorithmSidebar({ algorithms, loading, onAlgorithmSelect }: AlgorithmSidebarProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <Book className="w-4 h-4 text-primary mr-2" />
            Algorithm Examples
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group algorithms by category
  const algorithmsByCategory = algorithms.reduce((acc, algorithm) => {
    const category = algorithm.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(algorithm);
    return acc;
  }, {} as Record<string, Algorithm[]>);

  const categoryOrder = ['sorting', 'searching', 'graph', 'tree', 'recursion'];
  const sortedCategories = categoryOrder.filter(cat => algorithmsByCategory[cat]);

  return (
    <Card data-testid="algorithm-examples-card">
      <CardHeader>
        <CardTitle className="flex items-center text-base">
          <Book className="w-4 h-4 text-primary mr-2" />
          Algorithm Examples
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96" data-testid="algorithms-scroll-area">
          <div className="space-y-4">
            {sortedCategories.map((category) => (
              <div key={category} className="mb-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  {category}
                </h4>
                <div className="space-y-1">
                  {algorithmsByCategory[category].map((algorithm) => (
                    <Button
                      key={algorithm.id}
                      variant="ghost"
                      className="w-full justify-start p-3 h-auto text-left hover:bg-accent transition-colors"
                      onClick={() => onAlgorithmSelect(algorithm)}
                      data-testid={`algorithm-button-${algorithm.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{algorithm.name}</span>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {algorithm.timeComplexity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {algorithm.description}
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
            
            {algorithms.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Book className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No algorithm examples available</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
