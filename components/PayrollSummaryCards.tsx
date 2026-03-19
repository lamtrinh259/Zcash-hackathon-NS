type Card = {
  label: string;
  value: string;
  note: string;
};

export function PayrollSummaryCards({ cards }: { cards: Card[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="panel p-6">
          <p className="text-sm text-ink/60">{card.label}</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{card.value}</p>
          <p className="mt-2 text-sm text-ink/65">{card.note}</p>
        </div>
      ))}
    </div>
  );
}
