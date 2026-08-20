"use client";

import { useEffect, useRef, useState } from "react";

const films = [
  { src: "/media/13803509_1920_1080_30fps.m4v", poster: "/posters/13803509_1920_1080_30fps.jpg" },
  { src: "/media/7707324-hd_1920_1080_25fps.m4v", poster: "/posters/7707324-hd_1920_1080_25fps.jpg" },
  { src: "/media/6959287-uhd_3840_2160_25fps.m4v", poster: "/posters/6959287-uhd_3840_2160_25fps.jpg" },
];

const DISPLAY_TIME = 7000;
const CROSSFADE_TIME = 1800;

export default function CinematicHero() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const videosRef = useRef<Array<HTMLVideoElement | null>>([]);
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState([true, false, false]);

  useEffect(() => {
    const root = rootRef.current;
    const videos = videosRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let current = 0;
    let heroVisible = true;
    let cycleTimer: number | undefined;
    let pauseTimer: number | undefined;
    let cancelled = false;

    const canRun = () => heroVisible && document.visibilityState === "visible";
    const clearTimers = () => {
      window.clearTimeout(cycleTimer);
      window.clearTimeout(pauseTimer);
    };
    const pauseAll = () => videos.forEach((video) => video?.pause());
    const loadRemaining = () => setLoaded([true, true, true]);

    const schedule = () => {
      window.clearTimeout(cycleTimer);
      if (!canRun() || cancelled) return;
      cycleTimer = window.setTimeout(advance, DISPLAY_TIME);
    };

    const advance = () => {
      if (!canRun() || cancelled) return;
      const next = (current + 1) % films.length;
      const incoming = videos[next];
      const outgoing = videos[current];
      if (!incoming || incoming.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        cycleTimer = window.setTimeout(advance, 500);
        return;
      }
      incoming.currentTime = 0;
      incoming.play().then(() => {
        if (cancelled || !canRun()) return;
        setActive(next);
        window.clearTimeout(pauseTimer);
        pauseTimer = window.setTimeout(() => outgoing?.pause(), CROSSFADE_TIME);
        current = next;
        schedule();
      }).catch(() => schedule());
    };

    const resume = () => {
      if (!canRun()) return;
      videos[current]?.play().catch(() => undefined);
      schedule();
    };

    const first = videos[0];
    const stable = () => {
      window.setTimeout(loadRemaining, 700);
      resume();
    };
    if (first?.readyState && first.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) stable();
    else first?.addEventListener("canplay", stable, { once: true });
    first?.play().catch(() => undefined);

    const heroObserver = new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      if (heroVisible) resume();
      else {
        clearTimers();
        pauseAll();
      }
    }, { threshold: 0.08 });
    heroObserver.observe(root);

    const handleVisibility = () => {
      if (document.hidden) {
        clearTimers();
        pauseAll();
      } else resume();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      clearTimers();
      pauseAll();
      heroObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      first?.removeEventListener("canplay", stable);
    };
  }, []);

  return (
    <div ref={rootRef} className="cinematic-films" aria-hidden="true">
      {films.map((film, index) => (
        <video
          ref={(element) => { videosRef.current[index] = element; }}
          key={film.src}
          className={`cinematic-film ${active === index ? "is-active" : ""}`}
          poster={film.poster}
          muted
          playsInline
          preload={index === 0 || loaded[index] ? "auto" : "none"}
          src={loaded[index] ? film.src : undefined}
        />
      ))}
    </div>
  );
}
