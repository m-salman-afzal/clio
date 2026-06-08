export type TAirbyteMeta = {
  changes: unknown[];
  sync_id: number;
};

export type TProductSeo = {
  description: string | null;
  title: string;
};

export type TProductOption = {
  id: number;
  name: string;
  position: number;
  product_id: number;
  values: string[];
};

export type TProductVariantRef = {
  id: number;
};

export type TProductImageRef = {
  id: number;
};

export type TMoneyAmount = {
  amount: number;
  currency_code: string;
};

export type TPriceRange = {
  max_variant_price: TMoneyAmount;
  min_variant_price: TMoneyAmount;
};

export type TFeaturedImage = {
  alt_text: string | null;
  height: number;
  id: string;
  url: string;
  width: number;
};

export type TFeaturedMediaPreview = {
  image: {
    alt_text: string;
    id: string;
  };
  status: string;
};

export type TFeaturedMedia = {
  alt: string;
  id: string;
  media_content_type: string;
  media_errors: unknown[];
  media_warnings: unknown[];
  preview: TFeaturedMediaPreview;
  status: string;
};

export type TMetafield = {
  namespace: string;
  value: string;
};

export type TProductMetafields = Record<string, TMetafield>;

export type THasOnlyDefaultVariant = boolean;
export type THasOutOfStockVariants = boolean;
export type TIsGiftCard = boolean;
export type TTracksInventory = boolean;
export type TMediaCount = number;
export type TTotalInventory = number;
export type TTotalVariants = number;

/** Raw product row as returned from CSV / Airbyte sync (JSON fields are stringified). */
export type TProduct = {
  _AIRBYTE_RAW_ID: string;
  _AIRBYTE_EXTRACTED_AT: string;
  _AIRBYTE_META: string;
  _AIRBYTE_GENERATION_ID: string;
  ID: string;
  SEO: string;
  TAGS: string;
  IMAGE: string;
  TITLE: string;
  HANDLE: string;
  IMAGES: string;
  STATUS: string;
  VENDOR: string;
  OPTIONS: string;
  FEEDBACK: string;
  SHOP_URL: string;
  VARIANTS: string;
  BODY_HTML: string;
  CREATED_AT: string;
  DELETED_AT: string;
  UPDATED_AT: string;
  DESCRIPTION: string;
  MEDIA_COUNT: string;
  IS_GIFT_CARD: string;
  PRODUCT_TYPE: string;
  PUBLISHED_AT: string;
  FEATURED_IMAGE: string;
  FEATURED_MEDIA: string;
  PRICE_RANGE_V2: string;
  TOTAL_VARIANTS: string;
  DELETED_MESSAGE: string;
  PUBLISHED_SCOPE: string;
  TEMPLATE_SUFFIX: string;
  TOTAL_INVENTORY: string;
  DESCRIPTION_HTML: string;
  ONLINE_STORE_URL: string;
  TRACKS_INVENTORY: string;
  LEGACY_RESOURCE_ID: string;
  DELETED_DESCRIPTION: string;
  ADMIN_GRAPHQL_API_ID: string;
  REQUIRES_SELLIN_PLAN: string;
  HAS_ONLY_DEFAULT_VARIANT: string;
  ONLINE_STORE_PREVIEW_URL: string;
  HAS_OUT_OF_STOCK_VARIANTS: string;
  PRICE_RANGE: string;
  METAFIELDS: string;
};

export type TProductColumn = keyof TProduct;

/** Product with parsed JSON fields. */
export type TProductParsed = Omit<
  TProduct,
  | "_AIRBYTE_META"
  | "SEO"
  | "IMAGES"
  | "OPTIONS"
  | "VARIANTS"
  | "FEATURED_IMAGE"
  | "FEATURED_MEDIA"
  | "PRICE_RANGE_V2"
  | "PRICE_RANGE"
  | "METAFIELDS"
  | "HAS_ONLY_DEFAULT_VARIANT"
  | "HAS_OUT_OF_STOCK_VARIANTS"
  | "IS_GIFT_CARD"
  | "MEDIA_COUNT"
  | "TOTAL_VARIANTS"
  | "TOTAL_INVENTORY"
> & {
  _AIRBYTE_META: TAirbyteMeta;
  SEO: TProductSeo;
  IMAGES: TProductImageRef[];
  OPTIONS: TProductOption[];
  VARIANTS: TProductVariantRef[];
  FEATURED_IMAGE: TFeaturedImage | null;
  FEATURED_MEDIA: TFeaturedMedia | null;
  PRICE_RANGE_V2: TPriceRange;
  PRICE_RANGE: TPriceRange;
  METAFIELDS: TProductMetafields;
  HAS_ONLY_DEFAULT_VARIANT: THasOnlyDefaultVariant;
  HAS_OUT_OF_STOCK_VARIANTS: THasOutOfStockVariants;
  IS_GIFT_CARD: TIsGiftCard;
  MEDIA_COUNT: TMediaCount;
  TOTAL_VARIANTS: TTotalVariants;
  TOTAL_INVENTORY: TTotalInventory;
};

export type TProductAvailability = "all" | "in_stock" | "out_of_stock";

export type TProductSearchParams = {
  pageNumber: number;
  pageSize: number;
  q: string;
  vendor: string;
  minPrice: number | null;
  maxPrice: number | null;
  availability: TProductAvailability;
};
