interface Props {
  recommendation: string;
}

export default function AIRecommendationCard({
  recommendation,
}: Props) {
  return (
    <div className="rounded-lg border p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">
        AI Recommendation
      </h2>

      <p className="whitespace-pre-line text-sm">
        {recommendation}
      </p>
    </div>
  );
}