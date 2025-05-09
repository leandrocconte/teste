import { Sidebar } from "@/components/sidebar";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { List } from "@shared/schema";

export default function AILibraryPage() {
  const [_, navigate] = useLocation();
  
  const { data: lists, isLoading: listsLoading } = useQuery<List[]>({
    queryKey: ["/api/lists"],
  });
  
  const handleSelectCategory = (id: number) => {
    navigate(`/chat/${id}`);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-auto">
          <div className="flex-1 overflow-auto p-4 md:p-6">
            <div className="max-w-screen-xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold">Biblioteca de IAs</h1>
                <p className="text-muted-foreground mt-1">
                  Escolha uma categoria para começar a conversar
                </p>
              </div>
              
              {listsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lists?.map((category) => (
                    <div 
                      key={category.id}
                      className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary transition cursor-pointer"
                      onClick={() => handleSelectCategory(category.id)}
                    >
                      <div className="aspect-video relative overflow-hidden bg-muted">
                        {category.image_url && (
                          <img 
                            src={category.image_url} 
                            alt={category.title} 
                            className="w-full h-full object-cover transition duration-500 hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60"></div>
                        {category.tag && (
                          <div className="absolute bottom-0 left-0 p-4">
                            <span className="inline-block bg-primary text-white px-2 py-1 rounded text-sm font-medium">
                              {category.tag}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2">{category.title}</h3>
                        <p className="text-muted-foreground text-sm mb-4">{category.description}</p>
                        <div className="flex justify-end items-center">
                          <Button size="sm">
                            Iniciar chat
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
