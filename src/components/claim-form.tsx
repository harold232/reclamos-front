
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
  fecha: z.string().min(1, "La fecha es obligatoria."),
  medioPresentacion: z.string().min(1, "Medio de presentación es obligatorio."),
  medioRecepcion: z.string().min(1, "Medio de recepción es obligatorio."),
  servicio: z.string().min(1, "Servicio es obligatorio."),
  competencia: z.string().min(1, "Competencia es obligatoria."),
  descripcion: z
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
      fecha: "", 
      medioPresentacion: "",
      medioRecepcion: "",
      servicio: "",
      competencia: "",
      descripcion: "",
    },
  });

  const resetDateFields = () => {
    const today = new Date();
    const formattedDateForDisplay = today.toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    const formattedDateForSchema = today.toISOString().split('T')[0]; 
    
    setCurrentDateDisplay(formattedDateForDisplay);
    form.setValue('fecha', formattedDateForSchema, { shouldValidate: true });
  };

  useEffect(() => {
    resetDateFields();
  }, [form]);


  async function onSubmit(data: ClaimFormValues) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

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
    form.reset({ // Restablece los campos a sus valores defaultValues o vacíos
      fecha: "", // Se actualizará con resetDateFields
      medioPresentacion: "",
      medioRecepcion: "",
      servicio: "",
      competencia: "",
      descripcion: "",
    });
    resetDateFields(); // Asegura que la fecha se actualice correctamente
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
          name="fecha"
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
          name="medioPresentacion"
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
          name="medioRecepcion"
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
          name="servicio"
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
          name="competencia"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center font-semibold">
                <Scale className="mr-2 h-4 w-4 text-primary" />
                Competencia
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value} defaultValue="">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una competencia" />
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
          name="descripcion"
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
