/**
 * @file UnitConverter.tsx
 * @description Conversor de unidades de engenharia civil integrado à plataforma.
 * 
 * Suporta: comprimento, área, volume, massa, força, pressão, ângulo e temperatura.
 * Inclui acesso rápido via sidebar e atalho Ctrl+Shift+U.
 * 
 * @example
 * <UnitConverter />
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/atoms/Button';
import { Input } from '../ui/atoms/Input';
import { Select } from '../ui/atoms/Select';
import { ArrowUpDown, Copy, X, Ruler } from 'lucide-react';
import { toast } from 'sonner';

/* ─── Tipos ─────────────────────────────────────────── */
type UnitCategory = 'comprimento' | 'area' | 'volume' | 'massa' | 'força' | 'pressão' | 'ângulo' | 'temperatura';

interface UnitDefinition {
  value: string;
  label: string;
  factor: number; // fator de conversão para a unidade base
}

/* ─── Constantes ────────────────────────────────────── */
const CATEGORIES: { value: UnitCategory; label: string }[] = [
  { value: 'comprimento', label: 'Comprimento' },
  { value: 'area', label: 'Área' },
  { value: 'volume', label: 'Volume' },
  { value: 'massa', label: 'Massa' },
  { value: 'força', label: 'Força' },
  { value: 'pressão', label: 'Pressão' },
  { value: 'ângulo', label: 'Ângulo' },
  { value: 'temperatura', label: 'Temperatura' },
];

const UNITS: Record<UnitCategory, UnitDefinition[]> = {
  comprimento: [
    { value: 'mm', label: 'Milímetros (mm)', factor: 0.001 },
    { value: 'cm', label: 'Centímetros (cm)', factor: 0.01 },
    { value: 'm', label: 'Metros (m)', factor: 1 },
    { value: 'km', label: 'Quilômetros (km)', factor: 1000 },
    { value: 'in', label: 'Polegadas (in)', factor: 0.0254 },
    { value: 'ft', label: 'Pés (ft)', factor: 0.3048 },
  ],
  area: [
    { value: 'mm2', label: 'Milímetros² (mm²)', factor: 0.000001 },
    { value: 'cm2', label: 'Centímetros² (cm²)', factor: 0.0001 },
    { value: 'm2', label: 'Metros² (m²)', factor: 1 },
    { value: 'ha', label: 'Hectares (ha)', factor: 10000 },
    { value: 'km2', label: 'Quilômetros² (km²)', factor: 1000000 },
  ],
  volume: [
    { value: 'ml', label: 'Mililitros (ml)', factor: 0.000001 },
    { value: 'l', label: 'Litros (l)', factor: 0.001 },
    { value: 'm3', label: 'Metros³ (m³)', factor: 1 },
    { value: 'gal', label: 'Galões (gal)', factor: 0.00378541 },
  ],
  massa: [
    { value: 'g', label: 'Gramas (g)', factor: 0.001 },
    { value: 'kg', label: 'Quilogramas (kg)', factor: 1 },
    { value: 't', label: 'Toneladas (t)', factor: 1000 },
    { value: 'lb', label: 'Libras (lb)', factor: 0.453592 },
  ],
  força: [
    { value: 'n', label: 'Newtons (N)', factor: 1 },
    { value: 'kn', label: 'Quilonewtons (kN)', factor: 1000 },
    { value: 'kgf', label: 'Quilograma-força (kgf)', factor: 9.80665 },
    { value: 'tf', label: 'Tonelada-força (tf)', factor: 9806.65 },
  ],
  pressão: [
    { value: 'pa', label: 'Pascal (Pa)', factor: 1 },
    { value: 'kpa', label: 'Quilopascal (kPa)', factor: 1000 },
    { value: 'mpa', label: 'Megapascal (MPa)', factor: 1000000 },
    { value: 'atm', label: 'Atmosfera (atm)', factor: 101325 },
    { value: 'bar', label: 'Bar (bar)', factor: 100000 },
    { value: 'kgfcm2', label: 'kgf/cm²', factor: 98066.5 },
  ],
  ângulo: [
    { value: 'deg', label: 'Graus (°)', factor: 1 },
    { value: 'rad', label: 'Radianos (rad)', factor: 57.2957795 },
    { value: 'grad', label: 'Grados (grad)', factor: 0.9 },
  ],
  temperatura: [
    { value: 'c', label: 'Celsius (°C)', factor: 1 },
    { value: 'f', label: 'Fahrenheit (°F)', factor: 1 },
    { value: 'k', label: 'Kelvin (K)', factor: 1 },
  ],
};

/* ─── Componente ────────────────────────────────────── */
const UnitConverter: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [category, setCategory] = useState<UnitCategory>('comprimento');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('cm');
  const [inputValue, setInputValue] = useState('1');
  const [result, setResult] = useState<string | null>(null);

  const convert = useCallback(() => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) { setResult(null); return; }

    const units = UNITS[category];
    const from = units.find(u => u.value === fromUnit);
    const to = units.find(u => u.value === toUnit);
    if (!from || !to) { setResult(null); return; }

    let converted: number;

    // Temperatura requer tratamento especial
    if (category === 'temperatura') {
      let celsius = 0;
      if (fromUnit === 'c') celsius = value;
      else if (fromUnit === 'f') celsius = (value - 32) * 5 / 9;
      else if (fromUnit === 'k') celsius = value - 273.15;

      if (toUnit === 'c') converted = celsius;
      else if (toUnit === 'f') converted = celsius * 9 / 5 + 32;
      else if (toUnit === 'k') converted = celsius + 273.15;
      else converted = 0;
    } else {
      // Demais categorias: valor * fator_origem / fator_destino
      converted = (value * from.factor) / to.factor;
    }

    setResult(converted.toLocaleString('pt-BR', { maximumFractionDigits: 6 }));
  }, [category, fromUnit, toUnit, inputValue]);

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    toast.success('Valor copiado!');
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Ruler size={20} className="text-primary-500" />
                Conversor de Unidades
              </h2>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <Select
                label="Categoria"
                value={category}
                onChange={e => { setCategory(e.target.value as UnitCategory); setResult(null); }}
                options={CATEGORIES}
              />

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Select
                    label="De"
                    value={fromUnit}
                    onChange={e => setFromUnit(e.target.value)}
                    options={UNITS[category]}
                  />
                </div>
                <button onClick={swapUnits} className="p-2 mb-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500" title="Inverter">
                  <ArrowUpDown size={16} />
                </button>
                <div className="flex-1">
                  <Select
                    label="Para"
                    value={toUnit}
                    onChange={e => setToUnit(e.target.value)}
                    options={UNITS[category]}
                  />
                </div>
              </div>

              <Input
                label="Valor"
                type="number"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Digite o valor"
              />

              <Button variant="primary" onClick={convert} className="w-full">Converter</Button>

              {result !== null && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Resultado</p>
                    <p className="text-xl font-bold text-primary-600 dark:text-primary-400">{result}</p>
                  </div>
                  <Button variant="ghost" size="sm" icon={Copy} onClick={copyResult}>Copiar</Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UnitConverter;