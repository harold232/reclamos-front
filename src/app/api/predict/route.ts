import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.fecha || !body.descripcion || !body.medioPresentacion || !body.medioRecepcion || !body.servicio || !body.competencia) {
      return NextResponse.json({ message: 'Datos incompletos. Todos los campos son requeridos.' }, { status: 400 });
    }
    
    console.log('Datos del reclamo recibidos en /api/predict:', body);

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (Math.random() > 0.15) { 
      return NextResponse.json({ message: 'Reclamo recibido y procesado exitosamente.', data: body }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Error simulado al procesar el reclamo en el servidor.' }, { status: 500 });
    }

  } catch (error) {
    let errorMessage = 'Error interno del servidor.';
    if (error instanceof SyntaxError) {
      errorMessage = 'Error en el formato JSON de la solicitud.';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Error en /api/predict:', error);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
