"use client";

/**
 * Slide transitions slice the flat colour card into vertical strips that cascade in one column at a time — the new card sweeps up while the old sweeps away, offset by a per-strip stagger. Auto-advances; arrows and dots take over on click.
 */

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// Screenshots are shown in the requested onboarding-to-workspace flow.
const SLIDES = [
  { image: "/create%20account.png", title: "Create account", tag: "01 · Get started" },
  { image: "/workspace.png", title: "Workspace", tag: "02 · Set up your space" },
  { image: "/dashboard%20laptop.png", title: "Dashboard", tag: "03 · Track your work" },
  { image: "/team.png", title: "Team", tag: "04 · Bring everyone together" },
  { image: "/invition%20gmail.png", title: "Invite by email", tag: "05 · Invite your team" },
  { image: "/Assign%20task.png", title: "Assign task", tag: "06 · Share the work" },
  { image: "/filter%20by%20member.png", title: "Filter by member", tag: "07 · Find team tasks" },
  { image: "/notifications.png", title: "Notifications", tag: "08 · Stay up to date" },
  { image: "/switch%20between%20worksapces.png", title: "Switch workspaces", tag: "09 · Move between spaces" },
];

const STRIPS = 8;
const EASE = [0.65, 0, 0.35, 1] as const;

const stripVariants = (s: number) => ({
  enter: (dir: number) => ({ y: dir > 0 ? "102%" : "-102%" }),
  center: {
    y: "0%",
    transition: { duration: 0.7, ease: EASE, delay: s * 0.055 },
  },
  exit: (dir: number) => ({
    y: dir > 0 ? "-102%" : "102%",
    transition: { duration: 0.7, ease: EASE, delay: s * 0.055 },
  }),
});

const SlicedRevealCarousel = () => {
  const [[index, dir], setState] = useState<[number, number]>([0, 1]);

  const paginate = useCallback((d: number) => {
    setState(([i]) => [(i + d + SLIDES.length) % SLIDES.length, d]);
  }, []);

  useEffect(() => {
    const id = setInterval(() => paginate(1), 4200);
    return () => clearInterval(id);
  }, [index, paginate]);

  const slide = SLIDES[index];

  return (
    <div className="relative left-1/2 flex w-screen -translate-x-1/2 items-center justify-center overflow-hidden py-3 sm:py-6">
      <div className="relative aspect-[1366/633] w-full overflow-hidden border-y border-emerald-100 bg-[#f7faf8] shadow-[0_20px_55px_-36px_rgba(6,78,59,0.5)] sm:w-[min(1100px,92%)] sm:rounded-2xl sm:border">
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={index}
            className="absolute inset-0 flex"
            custom={dir}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {Array.from({ length: STRIPS }).map((_, s) => (
              <div key={s} className="h-full flex-1 overflow-hidden">
                {/* each strip is a window onto one card-wide image, shifted left by s strips,
                    so the screenshot runs unbroken across the strips once they settle */}
                <motion.div
                  className="h-full"
                  custom={dir}
                  variants={stripVariants(s)}
                  style={{
                    width: `${STRIPS * 100}%`,
                    marginLeft: `${-s * 100}%`,
                    backgroundColor: "#f7faf8",
                    backgroundImage: `linear-gradient(to top, rgba(6, 78, 59, 0.12), transparent 48%), url("${slide.image}")`,
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "contain",
                  }}
                />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-1 left-1">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={index}
              initial={{ y: 24, opacity: 0 }}
              animate={{
                y: 0,
                opacity: 1,
                transition: { duration: 0.6, ease: EASE, delay: 0.35 },
              }}
              exit={{ y: -18, opacity: 0, transition: { duration: 0.3 } }}
              className="rounded-lg border border-emerald-100 bg-white/55 px-1.5 py-1 text-slate-900 shadow-lg backdrop-blur-sm sm:rounded-lg sm:px-3 sm:py-2"
            >
              <p className="text-[7px] font-semibold uppercase tracking-[0.12em] text-emerald-800 sm:text-[10px] sm:tracking-[0.3em]">
                {slide.tag}
              </p>
              <h3 className="mt-0.5 text-xs font-semibold tracking-tight sm:mt-1 sm:text-3xl">
                {slide.title}
              </h3>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute bottom-2 right-2 flex items-center gap-1 sm:bottom-6 sm:right-7 sm:gap-2">
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => paginate(-1)}
            className="grid size-6 place-items-center rounded-full bg-emerald-700 text-white transition-colors hover:bg-emerald-800 sm:size-9"
          >
            <ChevronLeft className="size-3 sm:size-4" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => paginate(1)}
            className="grid size-6 place-items-center rounded-full bg-emerald-700 text-white transition-colors hover:bg-emerald-800 sm:size-9"
          >
            <ChevronRight className="size-3 sm:size-4" />
          </button>
        </div>

        {/* <div className="absolute left-0 top-0 flex gap-1 rounded-full border border-emerald-100 bg-white/95 px-1.5 py-1 shadow-sm sm:left-5 sm:top-4 sm:gap-1.5 sm:px-2 sm:py-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.title}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => paginate(i - index)}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === index ? "w-5 bg-emerald-700 sm:w-8" : "w-1.5 bg-emerald-200 hover:bg-emerald-400 sm:w-3"
              }`}
            />
          ))}
        </div> */}
      </div>
    </div>
  );
};

export default SlicedRevealCarousel;
