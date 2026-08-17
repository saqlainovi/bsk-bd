export interface PageSection {
  title: string;
  content: string[];
  image?: string;
  period?: string;
  is_former?: boolean;
  designation?: string;
}

export interface KeyFact {
  label: string;
  value: string;
}

export interface GalleryItem {
  image: string;
  caption_bn: string;
  caption_en: string;
}

export interface ExtraSection {
  title_bn: string;
  title_en: string;
  content_bn: string[];
  content_en: string[];
  image?: string;
  image_align?: 'left' | 'right' | 'center' | 'none';
  image_width?: string;
}

export interface ExcellenceStat {
  value: string;
  label_bn: string;
  label_en: string;
  subtext_bn?: string;
  subtext_en?: string;
}

export interface ExcellenceHighlight {
  id: string;
  title_bn: string;
  title_en: string;
  desc_bn: string;
  desc_en: string;
  image?: string;
  icon?: string;
}

export interface ExcellenceLevel {
  id: string;
  level_bn: string;
  level_en: string;
  target_group_bn: string;
  target_group_en: string;
  books_count: string;
  desc_bn: string;
  desc_en: string;
  reward_bn: string;
  reward_en: string;
}

export interface ExcellenceDownload {
  id: string;
  title_bn: string;
  title_en: string;
  file_size: string;
  file_url: string;
  category_bn?: string;
  category_en?: string;
}

export interface ExcellenceCoordinator {
  name_bn: string;
  name_en: string;
  designation_bn: string;
  designation_en: string;
  phone: string;
  email: string;
  office_bn: string;
  office_en: string;
  avatar?: string;
}

export interface ParsedPage {
  id: string;
  title_bn: string;
  title_en: string;
  html_title: string;
  sections: PageSection[];
  key_facts?: KeyFact[];
  
  // Custom BSK About (home) page fields
  intro_text_bn?: string;
  intro_text_en?: string;
  intro_image?: string;
  intro_image_align?: 'left' | 'right' | 'center' | 'none';
  intro_image_width?: string;
  
  mission_gallery?: GalleryItem[];
  history_gallery?: GalleryItem[];
  achievements_gallery?: GalleryItem[];

  history_image?: string;
  history_image_align?: 'left' | 'right' | 'center' | 'none';
  history_image_width?: string;

  achievements_image?: string;
  achievements_image_align?: 'left' | 'right' | 'center' | 'none';
  achievements_image_width?: string;

  extra_sections?: ExtraSection[];

  // Nationwide Excellence Program custom fields
  badge_bn?: string;
  badge_en?: string;
  subtitle_bn?: string;
  subtitle_en?: string;
  hero_image?: string;
  stats?: ExcellenceStat[];
  highlights?: ExcellenceHighlight[];
  levels?: ExcellenceLevel[];
  excellence_gallery?: GalleryItem[];
  side_mini_gallery?: GalleryItem[];
  downloads?: ExcellenceDownload[];
  coordinator?: ExcellenceCoordinator;

  // Custom Founder fields
  founder_name_bn?: string;
  founder_name_en?: string;
  founder_avatar?: string;
  founder_bio_bn?: string;
  founder_bio_en?: string;
  founder_badges?: { label_bn: string; label_en: string }[];
  founder_magsaysay_title_bn?: string;
  founder_magsaysay_title_en?: string;
  founder_magsaysay_text_bn?: string;
  founder_magsaysay_text_en?: string;
  founder_unesco_title_bn?: string;
  founder_unesco_title_en?: string;
  founder_unesco_text_bn?: string;
  founder_unesco_text_en?: string;
  founder_quotes?: { text_bn: string; text_en: string }[];
}

export interface Quote {
  text_bn: string;
  text_en: string;
  author_bn: string;
  author_en: string;
}

export type Language = 'bn' | 'en';
