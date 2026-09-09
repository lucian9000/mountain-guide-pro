import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
const output = path.resolve('public/experience');
await mkdir(output, { recursive: true });
const source = 'C:/SummitFit/Updated_Media';
const assets = {
  sunset: 'Lion_s Head Sunset.jpg', cliff: 'Kasteelspoort Table Mountain.jpg',
  plateau: 'Platteklip Gorge(1).JPG', forest: 'Skeleton Gorge.jpg',
  venster: 'India Venster.JPEG', helderberg: 'Helderberg Dome.jpg',
  peaks: 'Table Mountain.jpg', sunrise: 'Table Mountain Sunrise.JPEG',
};
for (const [name, file] of Object.entries(assets)) {
  await sharp(path.join(source, file)).rotate().resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true }).webp({ quality: 83 }).toFile(path.join(output, `${name}.webp`));
}
console.log(`Prepared ${Object.keys(assets).length} local photographs.`);
