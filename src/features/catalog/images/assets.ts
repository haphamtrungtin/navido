import inventory from '../../../../docs/asset-inventory.json';
export const menuImageAssets = inventory.assets
  .filter((a) => a.group === 'menu')
  .map((a) => a.proposedPublicPath);
export function isMenuImageAsset(path: string) {
  return menuImageAssets.includes(path);
}
