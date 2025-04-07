
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, User } from "lucide-react";

interface ProfessionalSelectorProps {
  professionalsList: {
    id: string;
    name: string;
  }[];
  isLoading: boolean;
  onProfessionalChange: (professionalId: string) => void;
}

const ProfessionalSelector = ({
  professionalsList,
  isLoading,
  onProfessionalChange
}: ProfessionalSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecione um Profissional</CardTitle>
        <CardDescription>
          Escolha um profissional para gerenciar sua agenda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3">Carregando profissionais...</span>
          </div>
        ) : professionalsList.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum profissional encontrado. Adicione profissionais na seção Profissionais.</p>
          </div>
        ) : (
          <Select onValueChange={onProfessionalChange}>
            <SelectTrigger className="w-full sm:w-[300px]">
              <SelectValue placeholder="Selecione um profissional" />
            </SelectTrigger>
            <SelectContent>
              {professionalsList.map(professional => (
                <SelectItem key={professional.id} value={professional.id}>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{professional.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfessionalSelector;
