"use client";
import { motion } from 'framer-motion';

export default function AnimatedList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((it, i) => (
        <motion.li key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-3 rounded-lg bg-white/80 border border-gray-100">
          {it}
        </motion.li>
      ))}
    </ul>
  );
}
