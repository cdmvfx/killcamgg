export const RankBadge = ({ score }: { score: number }) => {
  if (score < 20) {
    return <span className="rounded-full bg-neutral-600 px-2">Scrub</span>;
  } else if (score < 40) {
    return <span className="rounded-full bg-neutral-600 px-2">Noob</span>;
  } else if (score < 50) {
    return <span className="rounded-full bg-neutral-600 px-2">Rookie</span>;
  } else if (score < 100) {
    return <span className="rounded-full bg-neutral-600 px-2">Cracked</span>;
  } else if (score < 200) {
    return <span className="rounded-full bg-neutral-600 px-2">Goated</span>;
  }
  return <></>;
};
