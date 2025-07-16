"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import * as z from "zod";
import {useState, useEffect} from "react";

import {Button} from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {useToast} from "@/hooks/use-toast";
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

//const genericOptions = [
// { value: "opcion_1", label: "Opción 1" },
//{ value: "opcion_2", label: "Opción 2" },
//{ value: "opcion_3", label: "Opción 3" },
//];

export default function ClaimForm() {
    const {toast} = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentDateDisplay, setCurrentDateDisplay] = useState('');
    const [submissionResult, setSubmissionResult] = useState<{
        classificationMessage: string;
        toastMessage: string
    } | null>(null);

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
        form.setValue('fecha', formattedDateForSchema, {shouldValidate: true});
    };

    useEffect(() => {
        resetDateFields();
    }, [form]);


    async function onSubmit(data: ClaimFormValues) {
        setIsSubmitting(true);
        const payload = {
            FE_PRESEN_RECLA: data.fecha,
            DE_TIPO_INSTITUCION: data.competencia,
            DE_MEDIO_PRESENTACION: data.medioPresentacion,
            DE_MEDIO_RECEPCION: data.medioRecepcion,
            DE_SERVICIO: data.servicio,
            DESCRIPCION: data.descripcion,
        };
        try {
            const response = await fetch("https://myclaimclassifieraci-10998.eastus.azurecontainer.io:8080/predict", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            // Inside onSubmit
            if (response.ok) {
                toast({
                    title: "Éxito",
                    description: result.toastMessage || "Reclamo enviado correctamente.",
                });
                setSubmissionResult({
                    classificationMessage: `Reclamo clasificado como "${result.prediccion}"`,
                    toastMessage: result.toastMessage
                });
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
                    render={({field}) => (
                        <FormItem>
                            <FormLabel className="flex items-center font-semibold">
                                <CalendarDays className="mr-2 h-4 w-4 text-primary"/>
                                Fecha del Reclamo
                            </FormLabel>
                            <FormControl>
                                <Input
                                    readOnly
                                    value={currentDateDisplay}
                                    className="bg-muted/50 cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="medioPresentacion"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel className="flex items-center font-semibold">
                                <FileSignature className="mr-2 h-4 w-4 text-primary"/>
                                Medio de Presentación
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} defaultValue="">
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione un medio"/>
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="fisico">Físico</SelectItem>
                                    <SelectItem value="virtual">Virtual</SelectItem>
                                    <SelectItem value="telefonico">Telefónico</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="medioRecepcion"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel className="flex items-center font-semibold">
                                <Mailbox className="mr-2 h-4 w-4 text-primary"/>
                                Medio de Recepción
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} defaultValue="">
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione un medio"/>
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="documento_escrito">Documento Escrito</SelectItem>
                                    <SelectItem value="libro_reclamaciones_fisico">Libro de Reclamaciones
                                        Físico</SelectItem>
                                    <SelectItem value="libro_reclamaciones_virtual">Libro de Reclamaciones
                                        Virtual</SelectItem>
                                    <SelectItem value="llamada_telefonica">Llamada telefónica</SelectItem>
                                    <SelectItem value="reclamo_coparticipado">Reclamo coparticipado con otra
                                        administrada</SelectItem>
                                    <SelectItem value="reclamo_presencial">Reclamo Presencial</SelectItem>
                                    <SelectItem value="reclamo_trasladado">Reclamo trasladado de otra
                                        administrada</SelectItem>
                                </SelectContent>
                            </Select>

                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="servicio"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel className="flex items-center font-semibold">
                                <Briefcase className="mr-2 h-4 w-4 text-primary"/>
                                Servicio
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} defaultValue="">
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione un servicio"/>
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="farmacia">Farmacia</SelectItem>
                                    <SelectItem value="areas_administrativas">Oficinas o Áreas Administrativas de IAFAS
                                        o IPRESS o UGIPRES</SelectItem>
                                    <SelectItem value="servicios_medicos">Servicios Médicos de Apoyo</SelectItem>
                                    <SelectItem value="consulta_externa">Consulta Externa</SelectItem>
                                    <SelectItem value="hospitalizacion">Hospitalización</SelectItem>
                                    <SelectItem value="atencion_emergencia">Atención a domicilio, urgencia o
                                        emergencia</SelectItem>
                                    <SelectItem value="atencion_domicilio">Atención a domicilio, consulta
                                        ambulatoria</SelectItem>
                                    <SelectItem value="emergencia">Emergencia</SelectItem>
                                    <SelectItem value="centro_quirurgico">Centro Quirúrgico</SelectItem>
                                    <SelectItem value="uci">UCI o UCIN</SelectItem>
                                    <SelectItem value="infraestructura">Infraestructura</SelectItem>
                                    <SelectItem value="referencia">Referencia y Contrareferencia</SelectItem>
                                    <SelectItem value="centro_obstetrico">Centro Obstétrico</SelectItem>
                                    <SelectItem value="oficinas">Emergencia</SelectItem>

                                </SelectContent>
                            </Select>

                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="competencia"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel className="flex items-center font-semibold">
                                <Scale className="mr-2 h-4 w-4 text-primary"/>
                                Competencia
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} defaultValue="">
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione una competencia"/>
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="si">Sí</SelectItem>
                                    <SelectItem value="no">No</SelectItem>
                                    <SelectItem value="compartida">Compartida</SelectItem>
                                </SelectContent>

                            </Select>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="descripcion"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel className="flex items-center font-semibold">
                                <BookText className="mr-2 h-4 w-4 text-primary"/>
                                Descripción del Reclamo
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Describa detalladamente su reclamo aquí..."
                                    className="resize-y min-h-[120px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
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
                            <Loader2 className="mr-2 h-5 w-5 animate-spin"/>
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
