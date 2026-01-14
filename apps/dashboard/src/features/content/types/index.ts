import type { Database } from '@/types/database.types';
import type { ContentStatus, ContentPriority } from '@/types';

type Content = Database['public']['Tables']['contents']['Row'];
type Hook = Database['public']['Tables']['hooks']['Row'];
type Distribution = Database['public']['Tables']['distributions']['Row'];

export interface ContentFilters {
  status?: ContentStatus;
  priority?: ContentPriority;
  audience?: string;
}

export interface ContentWithStats extends Content {
  hook_count?: number;
  distribution_count?: number;
  response_count?: number;
}

export interface ContentDetailData {
  content: Content;
  hooks: Hook[];
  distributions: Distribution[];
}
