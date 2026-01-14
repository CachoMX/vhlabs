import { Badge } from '@/components/ui';

interface AudienceTagsProps {
  audiences: string[];
}

export function AudienceTags({ audiences }: AudienceTagsProps) {
  if (!audiences || audiences.length === 0) {
    return <span className="text-sm text-gray-400">No audiences</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {audiences.map((audience) => (
        <Badge key={audience} variant="secondary" size="sm">
          {formatAudienceName(audience)}
        </Badge>
      ))}
    </div>
  );
}

function formatAudienceName(slug: string): string {
  return slug
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
