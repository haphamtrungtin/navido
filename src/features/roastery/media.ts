import type { RoasteryMediaAsset, RoasteryMediaKey } from './domain/types';

const roasteryMedia: Record<RoasteryMediaKey, RoasteryMediaAsset> = {
  'roaster-machine': {
    src: '/images/navido/coffee/navido_coffee_table_setting_01.jpg',
    altKey: 'roasterMachine',
    replacementKey: 'roaster-machine',
    replacementStatus: 'temporary',
  },
  'roasting-process': {
    src: '/images/navido/space/navido_space_warm_coffee_taste_corner_01.webp',
    altKey: 'roastingProcess',
    replacementKey: 'roasting-process',
    replacementStatus: 'temporary',
  },
  'roasting-team': {
    src: '/images/navido/space/navido_space_ground_floor_seating_01.jpeg',
    altKey: 'roastingTeam',
    replacementKey: 'roasting-team',
    replacementStatus: 'temporary',
  },
  packaging: {
    src: '/images/navido/menu/navido_menu_goi_ca_phe_hat_lam_dong_viet_nam_200g_01.avif',
    altKey: 'packaging',
    replacementKey: 'packaging',
    replacementStatus: 'temporary',
  },
};

export function getRoasteryMedia(key: RoasteryMediaKey): RoasteryMediaAsset {
  return roasteryMedia[key];
}
