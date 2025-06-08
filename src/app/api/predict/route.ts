import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (
        !body.FE_PRESEN_RECLA ||
        !body.DE_TIPO_INSTITUCION ||
        !body.DE_MEDIO_PRESENTACION ||
        !body.DE_MEDIO_RECEPCION ||
        !body.DE_SERVICIO ||
        !body.DESCRIPCION
    ) {
      return NextResponse.json(
          {message: 'Datos incompletos. Todos los campos son requeridos.'},
          {status: 400}
      );
    }

    const formData = new FormData();
    formData.append('FE_PRESEN_RECLA', body.FE_PRESEN_RECLA);
    formData.append('DE_TIPO_INSTITUCION', body.DE_TIPO_INSTITUCION);
    formData.append('DE_MEDIO_PRESENTACION', body.DE_MEDIO_PRESENTACION);
    formData.append('DE_MEDIO_RECEPCION', body.DE_MEDIO_RECEPCION);
    formData.append('DE_SERVICIO', body.DE_SERVICIO);
    formData.append('DESCRIPCION', body.DESCRIPCION);

    // Forward the request to FastAPI with the expected keys
    const response = await fetch('http://127.0.0.1:5000/predict', {
      method: 'POST',
      body: formData,
    });

    const result = await response.text();

    if (response.ok) {
      const predictionMatch = result.match(/<strong>(.*?)<\/strong>/);
      const prediction = predictionMatch ? predictionMatch[1] : 'No se pudo determinar';

      return NextResponse.json({
        classificationMessage: `Clasificación del reclamo: ${prediction}`,
        toastMessage: 'Reclamo procesado exitosamente'
      }, { status: 200 });
    } else {
      return NextResponse.json(
          { message: 'Error al procesar el reclamo en el servidor FastAPI.' },
          { status: response.status }
      );
    }
  } catch (error) {
    let errorMessage = 'Error interno del servidor.';
    if (error instanceof SyntaxError) {
      errorMessage = 'Error en el formato de la solicitud.';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Error en /api/predict:', error);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}