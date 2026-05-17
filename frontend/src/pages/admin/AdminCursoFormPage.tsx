/**
 * @file AdminCursoFormPage.tsx
 * @description Formulário para criar ou editar um curso.
 * Refatorado com Design System: Input, Select, Button, GlassPanel.
 * Suporta upload de imagem JPG (local) ou URL externa.
 * @route /admin/cursos/novo
 * @route /admin/cursos/:id/editar
 */

import React, { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import GlassPanel from '../../components/ui/GlassPanel';
import { Button } from '../../components/ui/atoms/Button';
import { Input } from '../../components/ui/atoms/Input';
import { Select } from '../../components/ui/atoms/Select';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { useAuth } from '../../contexts/useAuth';
import { criarCurso, fetchCursoPorSlug, atualizarCurso } from '../../services/api';
import { Save, ArrowLeft, BookOpen, Upload, Link, X } from 'lucide-react';

const AdminCursoFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [resumo, setResumo] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [preco, setPreco] = useState('');
  const [cargaHoraria, setCargaHoraria] = useState('');
  const [nivel, setNivel] = useState('INICIANTE');
  const [categoria, setCategoria] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingDados, setLoadingDados] = useState(!!id);

  useEffect(() => {
    if (!id || !token) return;
    fetchCursoPorSlug(id as string)
      .then((data) => {
        const c = data.curso;
        setTitulo(c.titulo);
        setDescricao(c.descricao);
        setResumo(c.resumo || '');
        setImagemUrl(c.imagem || '');
        setPreco(c.preco?.toString() || '');
        setCargaHoraria(c.cargaHoraria?.toString() || '');
        setNivel(c.nivel);
        setCategoria(c.categoria || '');
      })
      .catch(() => toast.error('Erro ao carregar curso'))
      .finally(() => setTimeout(() => setLoadingDados(false), 0));
  }, [id, token]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
      toast.error('Apenas imagens JPG são permitidas.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 2MB.');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('imagem', file);
      const resposta = await fetch('http://localhost:3001/api/upload/imagem', {
        method: 'POST',
        body: formData,
      });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro);
      setImagemUrl(dados.url);
      toast.success('Imagem enviada!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar imagem.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!titulo.trim() || !descricao.trim()) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    if (!token) return;
    setSalvando(true);
    try {
      const dados = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        resumo: resumo.trim() || undefined,
        imagem: imagemUrl || undefined,
        preco: preco ? parseFloat(preco) : null,
        cargaHoraria: cargaHoraria ? parseInt(cargaHoraria) : undefined,
        nivel,
        categoria: categoria.trim() || undefined,
      };
      if (id) {
        await atualizarCurso(Number(id), dados, token);
        toast.success('Curso atualizado!');
      } else {
        await criarCurso(dados, token);
        toast.success('Curso criado!');
      }
      navigate('/admin/cursos');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar curso');
    } finally {
      setSalvando(false);
    }
  }

  if (loadingDados) return <SkeletonCard />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-8">
      <button onClick={() => navigate('/admin/cursos')} className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500">
        <ArrowLeft size={16} /> Voltar para cursos
      </button>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BookOpen size={28} className="text-primary-500" />
          {id ? 'Editar Curso' : 'Novo Curso'}
        </h1>
      </div>
      <GlassPanel className="p-8!" glow>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Título *" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Fundamentos do Concreto Armado" required />

          {/* Imagem do Curso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Imagem do curso (JPG)</label>
            {imagemUrl && (
              <div className="relative mb-3 w-full h-40 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img src={imagemUrl} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setImagemUrl('')} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                  <X size={14} />
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:border-primary-500 transition-colors text-sm text-gray-500 dark:text-gray-400">
                <Upload size={16} />
                {uploading ? 'Enviando...' : 'Upload JPG'}
                <input type="file" accept="image/jpeg,image/jpg" onChange={handleUpload} className="hidden" disabled={uploading} />
              </label>
              <Input icon={Link} value={imagemUrl} onChange={(e) => setImagemUrl(e.target.value)} placeholder="Ou cole uma URL externa" />
            </div>
          </div>

          <Input label="Resumo" value={resumo} onChange={(e) => setResumo(e.target.value)} placeholder="Breve descrição (até 200 caracteres)" maxLength={200} />
          <Input label="Descrição completa *" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição detalhada (HTML permitido)" required />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Preço (R$)" type="number" step="0.01" min="0" value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="0 = Gratuito" />
            <Input label="Carga horária (horas)" type="number" min="1" value={cargaHoraria} onChange={(e) => setCargaHoraria(e.target.value)} placeholder="Ex: 40" />
            <Select
              label="Nível"
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
              options={[
                { value: 'INICIANTE', label: 'Iniciante' },
                { value: 'INTERMEDIARIO', label: 'Intermediário' },
                { value: 'AVANCADO', label: 'Avançado' },
              ]}
            />
            <Input label="Categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Ex: Vigas, Pilares" />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" variant="primary" icon={Save} loading={salvando || uploading} disabled={salvando || uploading}>
              {salvando ? 'Salvando...' : 'Salvar Curso'}
            </Button>
          </div>
        </form>
      </GlassPanel>
    </motion.div>
  );
};

export default AdminCursoFormPage;