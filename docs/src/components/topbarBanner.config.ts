type BannerZone = {
    zoneId: string;
    contentId: string;
    fallbackBgColor?: string;
  };
export const TOP_BAR_BANNER = {
  rotateIntervalMs: 4000,
  hiddenPaths: ['/react-native-screens/docs'] as string[],
  zones: [
    {
      zoneId: 'enriched-topbar-1',
      contentId: 'ea15c4216158c4097b65fe6504a4b3b7',
      fallbackBgColor: '#b5e1f1',
    },
    {
      zoneId: 'enriched-topbar-2',
      contentId: 'ea15c4216158c4097b65fe6504a4b3b7',
      fallbackBgColor: '#b5e1f1',
    },
    {
      zoneId: 'enriched-topbar-3',
      contentId: 'ea15c4216158c4097b65fe6504a4b3b7',
      fallbackBgColor: '#b5e1f1',
    },
  ] satisfies BannerZone[],
};