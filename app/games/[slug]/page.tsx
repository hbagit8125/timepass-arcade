import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GameIcon } from "@/components/GameIcon";
import { GameShell } from "@/components/GameShell";
import { GAMES, getGame } from "@/games/registry";

export function generateStaticParams() {
  return GAMES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata(props: PageProps<"/games/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const game = getGame(slug);
  return game ? { title: game.name, description: game.tagline } : {};
}

export default async function GamePage(props: PageProps<"/games/[slug]">) {
  const { slug } = await props.params;
  const game = getGame(slug);
  if (!game) notFound();

  if (!game.playable) {
    return (
      <div data-cat={game.category} className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-16 text-center">
        <div className="grid size-20 place-items-center rounded-3xl border border-dashed border-(--cat) text-(--cat-ink)">
          <GameIcon name={game.icon} className="size-9" />
        </div>
        <h1 className="mt-6 font-display text-4xl font-bold tracking-tight">{game.name} is coming soon</h1>
        <p className="mt-3 text-muted">{game.tagline}</p>
        <Link href="/" className="mt-8 inline-flex h-12 items-center rounded-full bg-ink px-6 font-semibold text-bg">
          See games you can play now
        </Link>
      </div>
    );
  }

  return <GameShell slug={game.slug} />;
}
