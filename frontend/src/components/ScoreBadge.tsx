interface ScoreBadgeProps {
  score: number;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
  let badgeColor = '';
  let badgeText = '';
  
  if (score > 70) {
    badgeColor = 'bg-[var(--badge-green-bg)] text-[var(--badge-green-text)]';
    badgeText = 'Strong';
  } else if (score > 49) {
    badgeColor = 'bg-[var(--badge-yellow-bg)] text-[var(--badge-yellow-text)]';
    badgeText = 'Good Start';
  } else {
    badgeColor = 'bg-[var(--badge-red-bg)] text-[var(--badge-red-text)]';
    badgeText = 'Needs Work';
  }

  return (
    <div className={`px-2 md:px-3 py-1 rounded-full ${badgeColor}`}>
      <p className="text-xs md:text-sm font-medium text-center">{badgeText}</p>
    </div>
  );
};

export default ScoreBadge;