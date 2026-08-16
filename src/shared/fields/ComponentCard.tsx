interface ComponentCardProps {
  title: string | null;
  children: React.ReactNode;
  className?: string; // Additional custom classes for styling
  desc?: string; // Description text
  actions?: React.ReactNode; // Actions to be displayed in the card header
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
  actions,
}) => {
  return (
    <div
      className={`rounded-2xl border border-base-300 bg-base-100 ${className}`}
    >
      {/* Card Header */}
      <div className="px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-medium text-base-content">{title}</h3>
            {desc && (
              <p className="mt-1 text-sm text-base-content/60">{desc}</p>
            )}
          </div>
          {actions}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-1 md:p-4 border-t border-base-300">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;
