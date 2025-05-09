import { Sidebar } from "@/components/sidebar";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Parceiro } from "@shared/schema";

export default function PartnersPage() {
  const { data: partners, isLoading: partnersLoading } = useQuery<Parceiro[]>({
    queryKey: ["/api/partners"],
  });
  
  const handleOpenPartnerLink = (url: string) => {
    window.open(url, '_blank');
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-auto">
          <div className="flex-1 overflow-auto p-4 md:p-6">
            <div className="max-w-screen-xl mx-auto">
              <div className="mb-8">
                <h1 className="text-2xl font-bold">Descontos com Parceiros</h1>
                <p className="text-muted-foreground mt-1">
                  Aproveite ofertas exclusivas dos nossos parceiros
                </p>
              </div>
              
              {partnersLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {partners?.map((partner) => (
                    <div
                      key={partner.id}
                      className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary transition cursor-pointer"
                      onClick={() => handleOpenPartnerLink(partner.link)}
                    >
                      <div className="aspect-video relative overflow-hidden bg-muted">
                        {partner.image_url && (
                          <img
                            src={partner.image_url}
                            alt={partner.name}
                            className="w-full h-full object-cover transition duration-500 hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent opacity-60"></div>
                        <div className="absolute top-0 right-0 p-3">
                          <span 
                            className={`inline-block ${
                              partner.discount.includes("OFF") 
                                ? "bg-red-500" 
                                : partner.discount.includes("GRÁTIS") 
                                ? "bg-green-500" 
                                : "bg-blue-500"
                            } text-white px-2 py-1 rounded text-sm font-medium`}
                          >
                            {partner.discount}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2">{partner.name}</h3>
                        <p className="text-muted-foreground text-sm mb-4">{partner.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground text-sm">{partner.valid_until}</span>
                          <Button size="sm">
                            Ver oferta
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
