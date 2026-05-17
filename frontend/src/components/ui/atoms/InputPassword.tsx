/**
 * @file InputPassword.tsx
 * @description Campo de senha com toggle de visibilidade integrado.
 * 
 * Extende o componente Input com um botão de olho que alterna
 * entre mostrar e ocultar a senha.
 * 
 * @example
 * <InputPassword label="Senha" placeholder="••••••••" />
 * <InputPassword label="Confirmar senha" error="As senhas não conferem" />
 */

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from './Input';

/* ═══════════════════════════════════════════════════════════════
   Tipos
   ═══════════════════════════════════════════════════════════════ */

interface InputPasswordProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Rótulo do campo */
  label?: string;
  /** Texto de ajuda */
  hint?: string;
  /** Mensagem de erro */
  error?: string;
  /** Variante visual (padrão: 'default') */
  variant?: 'default' | 'glass';
}

/* ═══════════════════════════════════════════════════════════════
   Componente
   ═══════════════════════════════════════════════════════════════ */

export function InputPassword({
  label = 'Senha',
  hint,
  error,
  variant = 'default',
  ...props
}: InputPasswordProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      label={label}
      hint={hint}
      error={error}
      variant={variant}
      type={visible ? 'text' : 'password'}
      rightIcon={visible ? EyeOff : Eye}
      onRightIconClick={() => setVisible(!visible)}
      {...props}
    />
  );
}