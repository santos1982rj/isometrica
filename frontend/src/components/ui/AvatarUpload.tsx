/**
 * @file AvatarUpload.tsx
 * @description Componente de upload de avatar com preview e crop básico.
 * 
 * Permite ao usuário fazer upload de uma imagem para substituir
 * o avatar de iniciais. Inclui preview em tempo real e botão de remover.
 * 
 * O armazenamento é local (base64 no estado) — no futuro,
 * será integrado a um serviço de storage (S3, Cloudinary, etc.).
 * 
 * @example
 * <AvatarUpload
 *   currentAvatar={null}
 *   onAvatarChange={(base64) => console.log(base64)}
 * />
 */

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Camera, Trash2, Upload } from 'lucide-react';


/* ═══════════════════════════════════════════════════════════════
   Tipos
   ═══════════════════════════════════════════════════════════════ */

interface AvatarUploadProps {
  /** URL ou base64 do avatar atual (null = sem avatar) */
  currentAvatar: string | null;
  /** Iniciais para fallback quando não há avatar */
  iniciais: string;
  /** Callback chamado quando uma nova imagem é selecionada */
  onAvatarChange: (base64: string | null) => void;
}

/* ═══════════════════════════════════════════════════════════════
   Constantes
   ═══════════════════════════════════════════════════════════════ */

/** Tamanho máximo do arquivo: 2MB */
const MAX_FILE_SIZE = 2 * 1024 * 1024;

/** Tipos de imagem aceitos */
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/* ═══════════════════════════════════════════════════════════════
   Componente
   ═══════════════════════════════════════════════════════════════ */

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  iniciais,
  onAvatarChange,
}) => {
  const [preview, setPreview] = useState<string | null>(currentAvatar);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Processa o arquivo selecionado: valida tipo e tamanho,
   * converte para base64 e atualiza o preview.
   */
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file) return;

    // Valida tipo
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Formato inválido', {
        description: 'Aceito apenas JPG, PNG ou WebP.',
      });
      return;
    }

    // Valida tamanho
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Arquivo muito grande', {
        description: 'O tamanho máximo é 2MB.',
      });
      return;
    }

    // Converte para base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      onAvatarChange(base64);
      toast.success('Avatar atualizado!', {
        description: 'Sua foto de perfil foi alterada.',
      });
    };
    reader.readAsDataURL(file);
  }

  /**
   * Remove o avatar atual, voltando para as iniciais.
   */
  function handleRemove(): void {
    setPreview(null);
    onAvatarChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Avatar removido!', {
      description: 'Sua foto de perfil foi removida.',
    });
  }

  /**
   * Abre o seletor de arquivos.
   */
  function handleClick(): void {
    fileInputRef.current?.click();
  }

  return (
    <div className="relative inline-block">
      {/* Input file oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Selecionar foto de perfil"
      />

      {/* Área do avatar */}
      <div
        className="relative cursor-pointer group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        aria-label="Alterar foto de perfil"
      >
        {preview ? (
          /* ─── Avatar com imagem ─────────────────────────── */
          <div className="relative">
            <img
              src={preview}
              alt="Avatar do usuário"
              className="w-24 h-24 rounded-full object-cover shadow-xl ring-4 ring-white dark:ring-gray-800"
            />
            {/* Overlay no hover */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovering ? 1 : 0 }}
              className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center"
            >
              <Camera size={24} className="text-white" />
            </motion.div>
          </div>
        ) : (
          /* ─── Avatar com iniciais ────────────────────────── */
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 via-primary-500 to-secondary-500 
                          flex items-center justify-center text-white text-3xl font-bold
                          shadow-xl shadow-primary-500/30
                          ring-4 ring-white dark:ring-gray-800"
            >
              {iniciais}
            </div>
            {/* Overlay no hover */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovering ? 1 : 0 }}
              className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center"
            >
              <Upload size={24} className="text-white" />
            </motion.div>
          </div>
        )}
      </div>

      {/* Botão de remover (só aparece se houver avatar) */}
      {preview && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemove();
          }}
          className="absolute -bottom-1 -right-1 p-1.5 bg-red-500 text-white rounded-full 
                     shadow-lg hover:bg-red-600 transition-colors interactive"
          title="Remover foto"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
};

export default AvatarUpload;