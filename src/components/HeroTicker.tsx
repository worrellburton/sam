import Image from "next/image";
import { Icon } from "./icons";

// Scrolling credentials ticker under the hero. Rendered as a static
// server component — all content is known at build time.
//
// Extracted from src/app/page.tsx so the homepage stays focused on
// layout and the item definitions can be reused elsewhere if needed.

type TickerItem = {
  icon: React.ReactNode;
  text: string;
  em?: string;
};

const tickerItems: TickerItem[] = [
  {
    icon: (
      <Image
        src="https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/nyj.png&h=40&w=40"
        alt="New York Jets"
        width={32}
        height={32}
      />
    ),
    text: "New York Jets Team Physician",
    em: "NFL",
  },
  {
    icon: (
      <Image
        src="https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/nyi.png&h=40&w=40"
        alt="New York Islanders"
        width={32}
        height={32}
      />
    ),
    text: "New York Islanders Team Physician",
    em: "NHL",
  },
  {
    icon: <Icon.Shield width={28} height={28} stroke="#fff" />,
    text: "Board Certified",
    em: "Orthopedic Surgery",
  },
  {
    icon: <Icon.Star width={28} height={28} stroke="#e8792b" />,
    text: "4.8 \u2605 Rating",
    em: "1,466+ Reviews",
  },
  {
    icon: <Icon.Hospital width={28} height={28} stroke="#fff" />,
    text: "Lenox Hill Hospital",
  },
  {
    icon: <Icon.Hospital width={28} height={28} stroke="#fff" />,
    text: "Cleveland Clinic Trained",
  },
  {
    icon: <Icon.Globe width={28} height={28} stroke="#fff" />,
    text: "International Fellowship",
    em: "Switzerland \u2022 Netherlands \u2022 Italy",
  },
  {
    icon: <Icon.Clipboard width={28} height={28} stroke="#fff" />,
    text: "Magna Cum Laude",
    em: "Ohio State University",
  },
];

export function HeroTicker() {
  return (
    <div className="ticker-bar">
      <div className="ticker-track">
        {[1, 2].map((set) =>
          tickerItems.map((item, i) => (
            <div className="ticker-item" key={`${set}-${i}`}>
              {item.icon}
              <span>
                {item.text} {item.em && <em>{item.em}</em>}
              </span>
            </div>
          )),
        )}
      </div>
    </div>
  );
}
