
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import ClaimSuccessDisplay from "@/components/claim-success-display";
import {
  CalendarDays,
  FileSignature,
  Mailbox,
  Briefcase,
  Scale,
  BookText,
  Loader2
} from "lucide-react";

const claimFormSchema = z.object({
  FE_PRESEN_RECLA: z.string().min(1, "La fecha es obligatoria."),
  DE_TIPO_INSTITUCION: z.string().min(1, "Tipo de institución es obligatorio."),
  DE_MEDIO_PRESENTACION: z.string().min(1, "Medio de presentación es obligatorio."),
  DE_MEDIO_RECEPCION: z.string().min(1, "Medio de recepción es obligatorio."),
  DE_SERVICIO: z.string().min(1, "Servicio es obligatorio."),
  DESCRIPCION: z
      .string()
      .min(1, "Descripción es obligatoria.")
      .max(500, "Descripción no debe exceder 500 caracteres."),
});

type ClaimFormValues = z.infer<typeof claimFormSchema>;

const genericOptions = [
  { value: "opcion_1", label: "Opción 1" },
  { value: "opcion_2", label: "Opción 2" },
  { value: "opcion_3", label: "Opción 3" },
];

export default function ClaimForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentDateDisplay, setCurrentDateDisplay] = useState('');
  const [submissionResult, setSubmissionResult] = useState<{ classificationMessage: string; toastMessage: string } | null>(null);

  const form = useForm<ClaimFormValues>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      FE_PRESEN_RECLA: "",
      DE_TIPO_INSTITUCION: "",
      DE_MEDIO_PRESENTACION: "",
      DE_MEDIO_RECEPCION: "",
      DE_SERVICIO: "",
      DESCRIPCION: "",
    },
  });

  const resetDateFields = () => {
    const today = new Date();
    const formattedDateForDisplay = today.toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    const formattedDateForSchema = today.toISOString().split('T')[0]; 
    
    setCurrentDateDisplay(formattedDateForDisplay);
    form.setValue('FE_PRESEN_RECLA', formattedDateForSchema, { shouldValidate: true });
  };

  useEffect(() => {
    resetDateFields();
  }, [form]);


  async function onSubmit(data: ClaimFormValues) {
    console.log("Formulario enviado con:", data);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      console.log("Respuesta del backend:", result);

      if (response.ok) {
        toast({
          title: "Éxito",
          description: result.toastMessage || "Reclamo enviado correctamente.",
        });
        setSubmissionResult({ 
          classificationMessage: result.classificationMessage, 
          toastMessage: result.toastMessage 
        });
        // No reseteamos el formulario aquí, se hará al volver de la pantalla de éxito
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Hubo un problema al enviar el reclamo.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de Red",
        description: "No se pudo conectar al servidor. Intente más tarde.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleRegisterNewClaim = () => {
    setSubmissionResult(null);
    form.reset({
      FE_PRESEN_RECLA: "",
      DE_TIPO_INSTITUCION: "",
      DE_MEDIO_PRESENTACION: "",
      DE_MEDIO_RECEPCION: "",
      DE_SERVICIO: "",
      DESCRIPCION: "",
    });
    resetDateFields();
  };

  if (submissionResult) {
    return (
      <ClaimSuccessDisplay 
        classificationMessage={submissionResult.classificationMessage}
        onRegisterNewClaim={handleRegisterNewClaim}
      />
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="FE_PRESEN_RECLA"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center font-semibold">
                <CalendarDays className="mr-2 h-4 w-4 text-primary" />
                Fecha del Reclamo
              </FormLabel>
              <FormControl>
                <Input
                  readOnly
                  value={currentDateDisplay} 
                  className="bg-muted/50 cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
            control={form.control}
            name="DE_TIPO_INSTITUCION"
            render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center font-semibold">
                    <Briefcase className="mr-2 h-4 w-4 text-primary" />
                    Tipo de Institución
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue="">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un tipo de institución" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {genericOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
            )}
        />

        <FormField
          control={form.control}
          name="DE_MEDIO_PRESENTACION"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center font-semibold">
                <FileSignature className="mr-2 h-4 w-4 text-primary" />
                Medio de Presentación
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value} defaultValue="">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un medio" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {genericOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="DE_MEDIO_RECEPCION"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center font-semibold">
                <Mailbox className="mr-2 h-4 w-4 text-primary" />
                Medio de Recepción
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value} defaultValue="">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un medio" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {genericOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="DE_SERVICIO"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center font-semibold">
                <Briefcase className="mr-2 h-4 w-4 text-primary" />
                Servicio
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value} defaultValue="">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un servicio" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {genericOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="DESCRIPCION"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center font-semibold">
                <BookText className="mr-2 h-4 w-4 text-primary" />
                Descripción del Reclamo
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describa detalladamente su reclamo aquí..."
                  className="resize-y min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3 text-base mt-8" 
          disabled={isSubmitting}
          aria-live="polite"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar Reclamo"
          )}
        </Button>
      </form>
    </Form>
  );
}
