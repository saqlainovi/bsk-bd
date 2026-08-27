export interface AnnouncementBarSettings {
  enabled: boolean;
  text_bn: string;
  text_en: string;
  button_text_bn?: string;
  button_text_en?: string;
  link?: string;
  visibility?: 'all' | 'desktop' | 'mobile';
}

export interface NavItem {
  id: string;
  label_bn: string;
  label_en: string;
  url: string;
  is_external?: boolean;
  children?: NavItem[];
}

export interface NavbarSettings {
  logo_url?: string;
  tagline_bn?: string;
  tagline_en?: string;
  nav_items?: NavItem[];
}

export interface FooterSettings {
  org_desc_bn?: string;
  org_desc_en?: string;
  address_bn?: string;
  address_en?: string;
  phones?: string[];
  email?: string;
  emergency_contact?: string;
  facebook_url?: string;
  youtube_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  pinterest_url?: string;
  copyright_bn?: string;
  copyright_en?: string;
  footer_links?: { label_bn: string; label_en: string; tab: string }[];
}

export interface GoogleMapSettings {
  embed_url?: string;
  map_url?: string;
  latitude?: number;
  longitude?: number;
  title_bn?: string;
  title_en?: string;
  address_bn?: string;
  address_en?: string;
}

export interface SEOMetadata {
  meta_title_bn?: string;
  meta_title_en?: string;
  meta_description_bn?: string;
  meta_description_en?: string;
  keywords?: string[];
  og_image?: string;
}

export interface CourseItem {
  id: string;
  titleBn: string;
  titleEn: string;
  category: string;
  descBn?: string;
  descEn?: string;
  feeBn?: string;
  feeEn?: string;
  durationBn?: string;
  durationEn?: string;
  instructorBn?: string;
  instructorEn?: string;
}

export interface OutletItem {
  id: string;
  name_bn: string;
  name_en: string;
  address_bn: string;
  address_en: string;
  phones: string[];
  hours_bn?: string;
  hours_en?: string;
  image?: string;
  map_url?: string;
}

export interface AuditoriumItem {
  id: string;
  name_bn: string;
  name_en: string;
  capacity_bn: string;
  capacity_en: string;
  floor_bn: string;
  floor_en: string;
  rate_bn: string;
  rate_en: string;
  specs_bn?: string[];
  specs_en?: string[];
  image?: string;
  booking_phone?: string;
}

export interface CafeMenuItem {
  id: string;
  name_bn: string;
  name_en: string;
  category_bn: string;
  category_en: string;
  price_bn: string;
  price_en: string;
  desc_bn?: string;
  desc_en?: string;
  image?: string;
  available?: boolean;
}

export interface DonationAccountItem {
  id: string;
  type: 'bank' | 'mobile' | 'qr';
  title_bn: string;
  title_en: string;
  bank_name_bn?: string;
  bank_name_en?: string;
  branch_bn?: string;
  branch_en?: string;
  account_name_bn?: string;
  account_name_en?: string;
  account_number: string;
  routing_number?: string;
  merchant_number?: string;
  qr_code_image?: string;
  instructions_bn?: string;
  instructions_en?: string;
}

export interface VanScheduleItem {
  id: string;
  district_bn: string;
  district_en: string;
  location_bn: string;
  location_en: string;
  day_bn: string;
  day_en: string;
  time_bn: string;
  time_en: string;
  contact_phone?: string;
}

export interface CoordinatorItem {
  name_bn: string;
  name_en: string;
  designation_bn: string;
  designation_en: string;
  phone: string;
  email?: string;
  office_bn?: string;
  office_en?: string;
  avatar?: string;
}

export interface PageSection {
  title: string;
  content: string[];
  content_en?: string[];
  image?: string;
  period?: string;
  is_former?: boolean;
  designation?: string;
  [key: string]: any;
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
  category?: string;
  hero_desc_bn?: string;
  hero_desc_en?: string;
  created_at?: string;
  updated_at?: string;
  sections: PageSection[];
  key_facts?: KeyFact[];
  gallery?: GalleryItem[];
  
  // Who We Are section custom fields (home page)
  who_we_are_title_bn?: string;
  who_we_are_title_en?: string;
  who_we_are_subtitle_bn?: string;
  who_we_are_subtitle_en?: string;
  who_we_are_paragraphs_bn?: string[];
  who_we_are_paragraphs_en?: string[];
  who_we_are_image?: string;
  who_we_are_image_align?: 'left' | 'right' | 'center' | 'none';
  who_we_are_features?: {
    icon?: string;
    title_bn: string;
    title_en: string;
    desc_bn: string;
    desc_en: string;
  }[];

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
  founder_title_bn?: string;
  founder_title_en?: string;
  mediaContactData?: any;
  subjects?: any[];
  total_volumes_bn?: string;
  total_volumes_en?: string;
  total_subjects_bn?: string;
  total_subjects_en?: string;
  total_price_bn?: string;
  total_price_en?: string;
  official_website_url?: string;

  // Publications & Bookshop custom fields
  catalog_url?: string;
  series_section_title_bn?: string;
  series_section_title_en?: string;
  series_section_desc_bn?: string;
  series_section_desc_en?: string;
  publication_series?: any[];
  catalogs?: any[];
  catalogs_title_bn?: string;
  catalogs_title_en?: string;
  contact_title_bn?: string;
  contact_title_en?: string;
  contact_org_bn?: string;
  contact_org_en?: string;
  contact_address_bn?: string;
  contact_address_en?: string;
  contact_phones?: string;
  contact_mobiles?: string;
  contact_email?: string;
  inquiry_title_bn?: string;
  inquiry_title_en?: string;
  inquiry_desc_bn?: string;
  inquiry_desc_en?: string;

  // Global settings fields
  announcement_bar?: AnnouncementBarSettings;
  navbar_settings?: NavbarSettings;
  footer_settings?: FooterSettings;
  google_map?: GoogleMapSettings;
  seo_metadata?: SEOMetadata;

  // Specialized collections
  courses?: CourseItem[];
  outlets?: OutletItem[];
  auditoriums?: AuditoriumItem[];
  cafe_menu?: CafeMenuItem[];
  donation_accounts?: DonationAccountItem[];
  van_schedules?: VanScheduleItem[];
  coordinators?: CoordinatorItem[];

  [key: string]: any;
}

export interface Quote {
  text_bn: string;
  text_en: string;
  author_bn: string;
  author_en: string;
}

export type Language = 'bn' | 'en';

export interface EducationRecord {
  exam: string;
  groupSubject: string;
  boardUniversity: string;
  passingYear: string;
  resultGpa: string;
}

export interface ExperienceRecord {
  company: string;
  designation: string;
  fromYear: string;
  toYear: string;
  responsibilities?: string;
}

export interface ReferenceRecord {
  name: string;
  designation: string;
  phone: string;
  email?: string;
  relation: string;
}

export interface JobApplication {
  id: string;
  trackingId: string;
  circularId: string;
  position_bn: string;
  position_en: string;
  dept_bn?: string;
  dept_en?: string;
  circularRefNo?: string;

  // Personal Info
  name_bn: string;
  name_en: string;
  father_name_bn: string;
  father_name_en?: string;
  mother_name_bn: string;
  mother_name_en?: string;
  spouse_name?: string;
  nid_number: string;
  birth_reg_number?: string;
  dob: string;
  age_years?: string;
  age_months?: string;
  age_days?: string;
  birth_district: string;
  nationality: string;
  religion: string;
  gender: 'male' | 'female' | 'other' | string;
  marital_status: 'single' | 'married' | 'other' | string;
  quota: string;

  // Contact Info
  present_village_road: string;
  present_post_office: string;
  present_post_code: string;
  present_upazila: string;
  present_district: string;

  permanent_village_road: string;
  permanent_post_office: string;
  permanent_post_code: string;
  permanent_upazila: string;
  permanent_district: string;
  same_as_present?: boolean;

  phone: string;
  emergency_phone?: string;
  email: string;

  // Education, Experience & Skills
  educations: EducationRecord[];
  experiences: ExperienceRecord[];
  computer_skills?: string;
  language_skills?: string;
  other_skills?: string;

  // References
  references: ReferenceRecord[];

  // Attachments
  photo_url?: string;
  signature_url?: string;
  resume_url?: string;
  resume_name?: string;
  resume_type?: string;

  // Declaration
  declaration_accepted: boolean;
  applicant_place?: string;

  // Legacy compatibility fields
  name?: string;
  coverLetter?: string;
  resumeUrl?: string;
  resumeType?: string;
  resumeName?: string;
  jobTitleBn?: string;
  jobTitleEn?: string;

  // Administrative Review
  status?: 'new' | 'shortlisted' | 'interview' | 'selected' | 'rejected' | string;
  admin_notes?: string;
  reviewed_at?: any;
  createdAt: any;
  updatedAt?: any;
}

export interface RecruitmentCircular {
  id: string;
  circular_no?: string;
  title_bn: string;
  title_en: string;
  position_bn: string;
  position_en: string;
  dept_bn?: string;
  dept_en?: string;
  vacancies_bn?: string;
  vacancies_en?: string;
  vacancy?: string;
  salary_scale_bn?: string;
  salary_scale_en?: string;
  age_limit_bn?: string;
  age_limit_en?: string;
  education_req_bn?: string;
  education_req_en?: string;
  experience_req_bn?: string;
  experience_req_en?: string;
  terms_bn?: string;
  terms_en?: string;
  deadline_bn?: string;
  deadline_en?: string;
  deadline?: string;
  location_bn?: string;
  location_en?: string;
  desc_bn?: string;
  desc_en?: string;
  description_bn?: string;
  description_en?: string;
  requirements_bn?: string;
  requirements_en?: string;
  status: 'active' | 'expired' | string;
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
  applyUrl?: string;
  applyFileUrl?: string;
  applyFileName?: string;
  createdAt?: any;
  updatedAt?: any;
  [key: string]: any;
}

// Specialized Pages Interfaces
export interface AlorCourseItem {
  id: number | string;
  titleBn: string;
  titleEn: string;
  category: string;
  feeBn?: string;
  durationBn?: string;
  descriptionBn?: string;
  descriptionEn?: string;
  instructorBn?: string;
  image?: string;
}

export interface AlorBookItem {
  id: number | string;
  year: number;
  titleBn: string;
  titleEn: string;
  authorBn: string;
  authorEn: string;
  cover: string;
}

export interface MobileLibraryVehicle {
  id: string;
  titleBn: string;
  titleEn: string;
  capacityBn: string;
  capacityEn: string;
  coverageBn: string;
  coverageEn: string;
  descBn: string;
  descEn: string;
  image: string;
}

export interface MobileLibraryRoute {
  id: string;
  division: string;
  districtBn: string;
  districtEn: string;
  upazilaBn?: string;
  upazilaEn?: string;
  spotBn: string;
  spotEn: string;
  dayBn: string;
  dayEn: string;
  timeBn: string;
  timeEn: string;
  busTypeBn?: string;
  busTypeEn?: string;
}

export interface BangalirChintaSubject {
  title: string;
  en: string;
  vols: string;
  volsEn: string;
  editor: string;
  editorEn: string;
  desc: string;
  descEn: string;
  coverColor?: string;
  accentColor?: string;
}

export interface BangalirChintaVolume {
  id: number | string;
  volNum: number | string;
  titleBn: string;
  titleEn: string;
  publisherBn?: string;
  publisherEn?: string;
  yearBn?: string;
  yearEn?: string;
  priceBn?: string;
  priceEn?: string;
  coverUrl?: string;
}

export interface PrimaryTeacherBook {
  id: string;
  titleBn: string;
  titleEn: string;
  authorBn: string;
  authorEn: string;
  cover: string;
  descBn: string;
  descEn: string;
}

export interface PrimaryTeacherManual {
  id: string;
  titleBn: string;
  titleEn: string;
  fileUrl: string;
  fileSizeBn?: string;
  fileSizeEn?: string;
  publishDateBn?: string;
}

export interface PrimaryTeacherCoordinator {
  id: string;
  nameBn: string;
  nameEn: string;
  designationBn: string;
  designationEn: string;
  phone: string;
  regionBn: string;
  regionEn: string;
  image?: string;
}

export interface NationwideExcellenceLevel {
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
  syllabusUrl?: string;
}

export interface NationwideExcellenceOfficer {
  id: string;
  nameBn: string;
  nameEn: string;
  designationBn: string;
  designationEn: string;
  districtBn: string;
  districtEn: string;
  phone: string;
  email?: string;
}

export interface BookShopOutlet {
  id: string;
  nameBn: string;
  nameEn: string;
  addressBn: string;
  addressEn: string;
  phone: string;
  hoursBn: string;
  hoursEn: string;
  mapUrl?: string;
  image: string;
}

export interface BookShopCatalog {
  id: string;
  titleBn: string;
  titleEn: string;
  fileSizeBn: string;
  fileSizeEn: string;
  descBn: string;
  descEn: string;
  fileUrl?: string;
}

export interface AuditoriumRoom {
  id: string;
  roomNo: string;
  floorBn: string;
  floorEn: string;
  titleBn: string;
  titleEn: string;
  category: 'auditorium' | 'classroom' | 'gallery' | 'conference';
  capacityBn: string;
  capacityEn: string;
  hasAcOption?: boolean;
  singleShiftNonAc: number;
  singleShiftAc: number;
  doubleShiftNonAc: number;
  doubleShiftAc: number;
  soundSystemCost: number;
  multimediaCost: number;
  projectorCost: number;
  furnitureBn: string;
  furnitureEn: string;
  bannerSizeBn: string;
  bannerSizeEn: string;
  image: string;
  descriptionBn: string;
  descriptionEn: string;
}

export interface CafeMenuItem {
  id: string;
  category: 'beverages' | 'snacks' | 'bakery' | 'juices' | string;
  nameBn: string;
  nameEn: string;
  price: string;
  descriptionBn?: string;
  descriptionEn?: string;
  image?: string;
  available?: boolean;
}

export interface DonationBankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  routingNumber: string;
  swiftCode?: string;
}

export interface DonationMobileBanking {
  bkashMerchant: string;
  nagadMerchant: string;
  rocketMerchant: string;
  qrCodeUrl?: string;
}

export interface BuildingFloor {
  floorNo: number;
  floorBn: string;
  floorEn: string;
  titleBn: string;
  titleEn: string;
  featuresBn: string[];
  featuresEn: string[];
  image: string;
  actionRoute?: string;
}

export interface BookFairSchedule {
  id: string;
  venueBn: string;
  venueEn: string;
  districtBn: string;
  districtEn: string;
  dateRangeBn: string;
  dateRangeEn: string;
  hoursBn: string;
  hoursEn: string;
  statusBn?: string;
  statusEn?: string;
}

export type WebsitePage = ParsedPage;
export type JobCircular = RecruitmentCircular;
export type HeroSlide = any;
export type RecentActivity = any;
export type GlobalSettings = any;



