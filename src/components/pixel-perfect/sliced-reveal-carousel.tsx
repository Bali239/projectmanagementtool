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
    <div className="relative flex w-full items-center justify-center overflow-hidden py-8">
      <div className="relative aspect-[1366/633] w-[min(1100px,92%)] overflow-hidden rounded-2xl bg-white">
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
                    backgroundColor: "#fff",
                    backgroundImage: `linear-gradient(to top, rgba(2, 6, 23, 0.25), transparent 48%), url("${slide.image}")`,
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "contain",
                  }}
                />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-6 left-7">
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
              className="rounded-lg border border-white/20 bg-slate-950/75 px-3 py-2 text-white shadow-lg backdrop-blur-sm"
            >
              <p className="text-[10px] uppercase tracking-[0.3em] opacity-60">
                {slide.tag}
              </p>
              <h3 className="mt-1 text-3xl font-semibold tracking-tight">
                {slide.title}
              </h3>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute bottom-6 right-7 flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => paginate(-1)}
            className="grid size-9 place-items-center rounded-full bg-[#151515] text-white transition-colors hover:bg-white hover:text-black"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => paginate(1)}
            className="grid size-9 place-items-center rounded-full bg-[#151515] text-white transition-colors hover:bg-white hover:text-black"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="absolute left-5 top-4 flex gap-1.5 rounded-full bg-[#151515] px-2 py-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.title}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => paginate(i - index)}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === index ? "w-8 bg-white" : "w-3 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SlicedRevealCarousel;
