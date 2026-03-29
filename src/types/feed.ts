export type FeedItemType = 'link' | 'note';

export type FeedItem = {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  collection: string;
  savedAgo: string;
  type: FeedItemType;
};
