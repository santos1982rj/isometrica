'use client'

import { motion } from 'framer-motion'
import { Medal } from 'lucide-react'

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

interface RankingListProps {
  ranking: any[]
}

export function RankingList({ ranking }: RankingListProps) {
  return (
    <motion.div variants={itemAnim} className="bento-card rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-md bg-isometrica-primary/10">
          <Medal className="size-3.5 text-isometrica-primary" />
        </div>
        <h3 className="text-sm font-semibold">Ranking</h3>
      </div>
      <div className="flex flex-col gap-3">
        {ranking.map((user) => (
          <div
            key={user.pos}
            className={`flex items-center gap-3 rounded-lg p-2.5 transition-colors ${
              user.isMe ? 'bg-isometrica-accent/5 ring-1 ring-isometrica-accent/20' : 'hover:bg-muted'
            }`}
          >
            <span className="flex w-5 justify-center">
              {user.pos === 1 ? <Medal className="size-5 text-yellow-500" /> :
               user.pos === 2 ? <Medal className="size-5 text-slate-400" /> :
               user.pos === 3 ? <Medal className="size-5 text-amber-700" /> :
               <span className="text-sm font-bold text-muted-foreground">{user.pos}</span>}
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-isometrica-accent to-orange-400 text-xs font-bold text-white">
              {user.name[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight">{user.name}</p>
              <p className="text-[10px] text-muted-foreground">Nível {user.level}</p>
            </div>
            <span className="text-xs font-bold tabular-nums text-muted-foreground">
              {user.xp.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
