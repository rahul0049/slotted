const DEFAULT_EVENT_IMAGE =
  'https://res.cloudinary.com/kxklvndp/image/upload/f_auto,q_auto/MCG_Melbourne_nejycy';
const DEFAULT_EVENT_BANNER =
  'https://res.cloudinary.com/kxklvndp/image/upload/f_auto,q_auto/MCG_Melbourne_nejycy';
const DEFAULT_STADIUM_LAYOUT = '/defaults/stadium-layout-default.svg';

const pickFirst = (...values) => values.find((value) => typeof value === 'string' && value.trim());

export const getProviderImage = (provider) =>
  pickFirst(
    provider?.metadata?.image_url,
    provider?.metadata?.imageUrl,
    provider?.metadata?.poster_url,
    provider?.metadata?.posterUrl,
    provider?.metadata?.thumbnail_url,
    provider?.metadata?.thumbnailUrl,
    DEFAULT_EVENT_IMAGE
  );

export const getProviderBanner = (provider) =>
  pickFirst(
    provider?.metadata?.banner_url,
    provider?.metadata?.bannerUrl,
    provider?.metadata?.banner,
    provider?.metadata?.hero_url,
    provider?.metadata?.heroUrl,
    getProviderImage(provider),
    DEFAULT_EVENT_BANNER
  );

export const getStadiumLayout = (provider) =>
  pickFirst(
    provider?.metadata?.stadium_layout_url,
    provider?.metadata?.stadiumLayoutUrl,
    provider?.metadata?.layout_image_url,
    provider?.metadata?.layoutImageUrl,
    provider?.metadata?.venue_map_url,
    provider?.metadata?.venueMapUrl,
    null
  );

export const mediaFallbacks = {
  DEFAULT_EVENT_IMAGE,
  DEFAULT_EVENT_BANNER,
  DEFAULT_STADIUM_LAYOUT,
};
