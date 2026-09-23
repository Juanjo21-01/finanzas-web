import { Button } from '@/components/ui/button';

function App() {
  return (
    <>
      <section className="bg-white dark:bg-gray-900 p-10 m-10">
        <h1 className="text-3xl font-bold underline">
          Empezando el proyecto!!!
        </h1>
        <button type="button" className="counter"></button>
      </section>

      <div className="flex gap-2 p-10 m-10">
        <Button
          onClick={() => alert('El botón funciona')}
          className="rounded-full"
        >
          Probar botón
        </Button>
        <Button variant="destructive" className="rounded-full">
          Secundario
        </Button>
      </div>
    </>
  );
}

export default App;
