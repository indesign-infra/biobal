import { component$ } from "@builder.io/qwik";
import { LuInstagram } from "@qwikest/icons/lucide";
import { Section } from "../ui/section";
import { Container } from "../ui/container";
import { site } from "~/lib/site";
import { type SectionContent, orDefault } from "~/lib/content";

export type IgPost = {
  id: string;
  mediaUrl: string;
  permalink: string;
  caption: string | null;
};

type InstagramFeedProps = { posts: IgPost[]; content?: SectionContent };

export const InstagramFeed = component$<InstagramFeedProps>(
  ({ posts, content }) => {
    if (!posts || posts.length === 0) return null;

    return (
      <Section id="instagram" tone="surface">
        <Container>
          <div
            data-reveal
            class="flex flex-col items-center justify-between gap-5 sm:flex-row"
          >
            <div>
              <p class="bb-eyebrow text-accent-600 mb-2 text-sm font-semibold tracking-[0.14em] uppercase">
                {orDefault(content?.eyebrow, "Comunidad · Novedades")}
              </p>
              <h2 class="font-display text-primary-900 text-3xl font-semibold sm:text-4xl">
                {site.instagram.handle}
              </h2>
            </div>
            <a
              href={site.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              class="bg-primary-900 hover:bg-accent-600 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-colors"
            >
              <LuInstagram class="h-4 w-4" />
              Seguinos
            </a>
          </div>

          <div class="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {posts.map((post, i) => (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                data-reveal="scale"
                style={{ "--reveal-delay": `${Math.min(i, 6) * 50}ms` }}
                class="group ring-line relative block aspect-square overflow-hidden rounded-xl bg-slate-200 ring-1"
              >
                <img
                  src={post.mediaUrl}
                  alt={post.caption || "Publicación de BioBal en Instagram"}
                  loading="lazy"
                  decoding="async"
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div class="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <LuInstagram class="h-8 w-8 text-white" />
                </div>
              </a>
            ))}
          </div>
        </Container>
      </Section>
    );
  },
);
