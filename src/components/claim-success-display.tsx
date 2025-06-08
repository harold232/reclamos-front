
"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface ClaimSuccessDisplayProps {
  classificationMessage: string;
  onRegisterNewClaim: () => void;
}

export default function ClaimSuccessDisplay({ classificationMessage, onRegisterNewClaim }: ClaimSuccessDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-4 sm:p-6 space-y-6">
      <CheckCircle2 className="h-20 w-20 text-green-500" />
      <h2 className="text-2xl sm:text-3xl font-semibold text-primary">
        ¡Reclamo Enviado Exitosamente!
      </h2>
      <div className="bg-muted/70 p-4 rounded-lg w-full shadow-inner">
        <p className="text-md sm:text-lg text-foreground">
          {classificationMessage}
        </p>
      </div>
      <Button 
        onClick={onRegisterNewClaim}
        className="w-full max-w-sm bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3 text-base sm:text-lg mt-4"
        aria-label="Registrar un nuevo reclamo"
      >
        Registrar Nuevo Reclamo
      </Button>
    </div>
  );
}
