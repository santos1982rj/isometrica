// frontend/src/components/ui/AnimatedChart.tsx
import { motion } from 'framer-motion';

interface ChartProps {
  data: { label: string; value: number }[];
}

const AnimatedChart: React.FC<ChartProps> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  return (
    <div className="flex items-end justify-between gap-2 h-64">
      {data.map((item, index) => (
        <div key={item.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(item.value / maxValue) * 100}%` }}
            transition={{ duration: 1, delay: index * 0.1, ease: "backOut" }}
            className="w-full bg-gradient-to-t from-primary-400 to-primary-600 dark:from-primary-600 dark:to-primary-400 rounded-t-xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
          <span className="text-xs text-gray-500">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default AnimatedChart;