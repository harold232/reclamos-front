import ClaimForm from '@/components/claim-form';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 lg:p-24 bg-background selection:bg-primary/20 selection:text-primary">
      <div className="w-full max-w-2xl bg-card p-6 sm:p-8 rounded-xl shadow-2xl">
        <h1 className="font-headline text-3xl sm:text-4xl font-bold text-center text-primary mb-6 sm:mb-8">
          Formulario de Reclamo
        </h1>
        <ClaimForm />
      </div>
    </main>
  );
}
