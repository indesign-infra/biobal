import { component$, useSignal, $ } from "@builder.io/qwik";
import { LuPlay, LuVolume2, LuVolumeX } from "@qwikest/icons/lucide";
import { Section } from "../ui/section";
import { Container } from "../ui/container";
import { SectionTitle } from "../ui/section-title";
import { type SectionContent, orDefault } from "~/lib/content";

export type ReelVideo = {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string | null;
};

type ReelsProps = { videos: ReelVideo[]; content?: SectionContent };

export const Reels = component$<ReelsProps>(({ videos, content }) => {
  if (!videos || videos.length === 0) return null;

  return (
    <Section id="reels" tone="primary" class="overflow-hidden">
      <Container>
        <div data-reveal>
          <SectionTitle
            align="center"
            eyebrow={orDefault(content?.eyebrow, "BioBal en video")}
            title={orDefault(content?.title, "Conocé los espacios por dentro")}
            tone="light"
          />
        </div>
        <div class="mt-12 flex flex-wrap items-start justify-center gap-8">
          {videos.map((v, i) => (
            <ReelCard key={v.id} video={v} idx={i} />
          ))}
        </div>
      </Container>
    </Section>
  );
});

const ReelCard = component$<{ video: ReelVideo; idx?: number }>(
  ({ video, idx = 0 }) => {
    const ref = useSignal<HTMLVideoElement>();
    const isPlaying = useSignal(false);
    const isMuted = useSignal(true);

    const togglePlay = $(() => {
      const el = ref.value;
      if (!el) return;
      if (el.paused) el.play().catch(() => {});
      else el.pause();
    });

    const toggleMute = $((ev: Event) => {
      ev.stopPropagation();
      const el = ref.value;
      if (!el) return;
      el.muted = !el.muted;
      isMuted.value = el.muted;
    });

    return (
      <div
        data-reveal
        style={{ "--reveal-delay": `${idx * 90}ms` }}
        class="group relative w-full max-w-[270px] cursor-pointer select-none"
        onClick$={togglePlay}
      >
        <div class="bg-accent-500/20 absolute -inset-2 -z-10 rounded-3xl opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
        <div
          class="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl"
          style={{ aspectRatio: "9/16" }}
        >
          <video
            ref={ref}
            src={video.videoUrl}
            poster={video.thumbnailUrl || undefined}
            preload="metadata"
            class="h-full w-full object-cover"
            playsInline
            loop
            muted={isMuted.value}
            onPlay$={() => (isPlaying.value = true)}
            onPause$={() => (isPlaying.value = false)}
          />

          <div
            class={[
              "pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25 transition-opacity duration-300",
              isPlaying.value ? "opacity-0" : "opacity-100",
            ]}
          >
            <div class="flex h-16 w-16 items-center justify-center rounded-full border border-white/35 bg-white/20 text-white shadow-lg backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
              <LuPlay class="h-7 w-7 translate-x-0.5" />
            </div>
          </div>

          <button
            type="button"
            onClick$={toggleMute}
            class="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
            title={isMuted.value ? "Activar sonido" : "Silenciar"}
          >
            {isMuted.value ? (
              <LuVolumeX class="h-4 w-4" />
            ) : (
              <LuVolume2 class="h-4 w-4" />
            )}
          </button>

          <div class="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col justify-end bg-linear-to-t from-black/90 via-black/30 to-transparent p-4 pt-14">
            <h3 class="font-display line-clamp-2 text-sm leading-tight font-semibold text-white">
              {video.title}
            </h3>
          </div>
        </div>
      </div>
    );
  },
);
