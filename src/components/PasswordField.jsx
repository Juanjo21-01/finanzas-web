import { useState } from 'react';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import { Input } from '@/components/ui/input';

export function PasswordField({ id, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? 'text' : 'password'}
        className="pr-12"
        {...props}
      />
      <button
        className="absolute inset-y-0 right-1 grid w-10 place-items-center rounded-md border-0 bg-transparent text-xl text-tinta-suave hover:text-tinta"
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={visible}
      >
        {visible ? <EyeSlash aria-hidden="true" /> : <Eye aria-hidden="true" />}
      </button>
    </div>
  );
}
