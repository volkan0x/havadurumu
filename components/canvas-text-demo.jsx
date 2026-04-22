"use client"

import { cn } from "@/lib/utils"
import { CanvasText } from "@/components/ui/canvas-text"

export default function CanvasTextDemo() {
  return (
    <div className="flex min-h-40 items-center justify-center p-2 sm:p-4">
      <h2
        className={cn(
          "group relative mx-auto mt-4 max-w-3xl text-center text-2xl leading-tight font-bold tracking-tight text-balance text-slate-100 sm:text-4xl md:text-5xl xl:text-6xl",
        )}
      >
        15 günlük {" "}
        <CanvasText
          text="Hava Durumu"
          backgroundClassName="bg-blue-600 dark:bg-blue-700"
          colors={[
            "rgba(0, 153, 255, 1)",
            "rgba(0, 153, 255, 0.9)",
            "rgba(0, 153, 255, 0.8)",
            "rgba(0, 153, 255, 0.7)",
            "rgba(0, 153, 255, 0.6)",
            "rgba(0, 153, 255, 0.5)",
            "rgba(0, 153, 255, 0.4)",
            "rgba(0, 153, 255, 0.3)",
            "rgba(0, 153, 255, 0.2)",
            "rgba(0, 153, 255, 0.1)",
          ]}
          lineGap={4}
          animationDuration={20}
        />
        <span className="block text-slate-100">
          tahminlerini inceleyin,
          <span className="block">yağış haritalarını tek ekranda takip edin.</span>
        </span>
      </h2>
    </div>
  )
}
