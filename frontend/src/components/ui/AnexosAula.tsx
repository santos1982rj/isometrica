import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/useAuth';
import { fetchAnexos, uploadAnexo, deletarAnexo, getDownloadUrl, type AnexoData } from '../../services/api';
import { Spinner } from '../ui/atoms/Spinner';
import { Download, Upload, Trash2, FileText, FileSpreadsheet, FileImage, Presentation, Archive, File } from 'lucide-react';

function iconePorTipo(tipo: string) {
  if (tipo.includes('pdf')) return FileText;
  if (tipo.includes('sheet') || tipo.includes('csv') || tipo.includes('excel')) return FileSpreadsheet;
  if (tipo.includes('image')) return FileImage;
  if (tipo.includes('presentation') || tipo.includes('powerpoint')) return Presentation;
  if (tipo.includes('zip') || tipo.includes('rar') || tipo.includes('compress')) return Archive;
  return File;
}

function corPorTipo(tipo: string): string {
  if (tipo.includes('pdf')) return 'text-red-500 bg-red-50 dark:bg-red-900/20';
  if (tipo.includes('sheet') || tipo.includes('csv') || tipo.includes('excel')) return 'text-green-500 bg-green-50 dark:bg-green-900/20';
  if (tipo.includes('image')) return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
  if (tipo.includes('presentation') || tipo.includes('powerpoint')) return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
  if (tipo.includes('zip') || tipo.includes('rar') || tipo.includes('compress')) return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20';
  return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
}

function formatarTamanho(bytes: number | null): string {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface AnexosAulaProps {
  aulaId: number;
}

const AnexosAula: React.FC<AnexosAulaProps> = ({ aulaId }) => {
  const { token, usuario } = useAuth();
  const [anexos, setAnexos] = useState<AnexoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const data = await fetchAnexos(aulaId);
      setAnexos(data.anexos);
    } catch { /* silencioso */ }
    finally { setLoading(false); }
  }, [aulaId]);

  useEffect(() => {
    const timer = setTimeout(() => { carregar(); }, 0);
    return () => clearTimeout(timer);
  }, [carregar]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploading(true);
    try {
      await uploadAnexo(aulaId, file, token);
      toast.success('Arquivo enviado!');
      carregar();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm('Excluir este anexo?')) return;
    try {
      await deletarAnexo(id, token);
      toast.success('Anexo excluído!');
      carregar();
    } catch { toast.error('Erro ao excluir.'); }
  };

  return (
    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Download size={20} className="text-primary-500" />
          Materiais para Download
        </h3>
        {usuario && token && (
          <div>
            <input
              type="file"
              id="upload-anexo"
              className="hidden"
              onChange={handleUpload}
            />
            <label
              htmlFor="upload-anexo"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Upload size={16} />
              {uploading ? 'Enviando...' : 'Enviar arquivo'}
            </label>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : anexos.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
          Nenhum material disponível para esta aula.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {anexos.map(anexo => {
            const Icone = iconePorTipo(anexo.tipo);
            const cor = corPorTipo(anexo.tipo);
            return (
              <motion.div
                key={anexo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${cor}`}>
                  <Icone size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{anexo.nome}</p>
                  <p className="text-xs text-gray-500">{formatarTamanho(anexo.tamanho)}</p>
                </div>
                <a
                  href={getDownloadUrl(anexo.id)}
                  download={anexo.nome}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                  title="Baixar"
                >
                  <Download size={16} />
                </a>
                {usuario?.role === 'ADMIN' && (
                  <button
                    onClick={() => handleDelete(anexo.id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AnexosAula;