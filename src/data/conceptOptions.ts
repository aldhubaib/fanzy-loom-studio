// Genre images
import genreNoir from "@/assets/genres/noir.jpg";
import genreScifi from "@/assets/genres/scifi.jpg";
import genreDrama from "@/assets/genres/drama.jpg";
import genreHorror from "@/assets/genres/horror.jpg";
import genreComedy from "@/assets/genres/comedy.jpg";
import genreAction from "@/assets/genres/action.jpg";
import genreFantasy from "@/assets/genres/fantasy.jpg";
import genreThriller from "@/assets/genres/thriller.jpg";
import genreWestern from "@/assets/genres/western.jpg";
import genreCyberpunk from "@/assets/genres/cyberpunk.jpg";
import genreDocumentary from "@/assets/genres/documentary.jpg";
import genreAnimation from "@/assets/genres/animation.jpg";

// Tone images
import toneDark from "@/assets/tones/dark.jpg";
import toneLight from "@/assets/tones/light.jpg";
import toneTense from "@/assets/tones/tense.jpg";
import toneEmotional from "@/assets/tones/emotional.jpg";
import toneFunny from "@/assets/tones/funny.jpg";
import toneEpic from "@/assets/tones/epic.jpg";
import toneIntimate from "@/assets/tones/intimate.jpg";
import toneSurreal from "@/assets/tones/surreal.jpg";

// Setting images
import settingCity from "@/assets/settings/modern-city.jpg";
import settingHistorical from "@/assets/settings/historical.jpg";
import settingRural from "@/assets/settings/rural.jpg";
import settingSpace from "@/assets/settings/space.jpg";
import settingFantasy from "@/assets/settings/fantasy-world.jpg";
import settingDesert from "@/assets/settings/desert.jpg";
import settingUnderwater from "@/assets/settings/underwater.jpg";
import settingArctic from "@/assets/settings/arctic.jpg";

export const genres = [
  { label: "Noir", img: genreNoir },
  { label: "Sci-Fi", img: genreScifi },
  { label: "Drama", img: genreDrama },
  { label: "Horror", img: genreHorror },
  { label: "Comedy", img: genreComedy },
  { label: "Action", img: genreAction },
  { label: "Fantasy", img: genreFantasy },
  { label: "Thriller", img: genreThriller },
  { label: "Western", img: genreWestern },
  { label: "Cyberpunk", img: genreCyberpunk },
  { label: "Documentary", img: genreDocumentary },
  { label: "Animation", img: genreAnimation },
];

export const tones = [
  { label: "Dark", img: toneDark },
  { label: "Light", img: toneLight },
  { label: "Tense", img: toneTense },
  { label: "Emotional", img: toneEmotional },
  { label: "Funny", img: toneFunny },
  { label: "Epic", img: toneEpic },
  { label: "Intimate", img: toneIntimate },
  { label: "Surreal", img: toneSurreal },
];

export const settings = [
  { label: "Modern City", img: settingCity },
  { label: "Historical", img: settingHistorical },
  { label: "Rural", img: settingRural },
  { label: "Space", img: settingSpace },
  { label: "Fantasy World", img: settingFantasy },
  { label: "Desert", img: settingDesert },
  { label: "Underwater", img: settingUnderwater },
  { label: "Arctic", img: settingArctic },
];

export const durations = [
  { label: "Short", detail: "~5 min", emoji: "⚡" },
  { label: "Medium", detail: "~15 min", emoji: "🎬" },
  { label: "Feature", detail: "~45 min", emoji: "🎥" },
];

export const audiences = [
  { label: "General", detail: "All ages", emoji: "👨‍👩‍👧‍👦" },
  { label: "Young Adult", detail: "13+", emoji: "🎓" },
  { label: "Mature", detail: "18+", emoji: "🔞" },
  { label: "Kids", detail: "Ages 4-12", emoji: "🧸" },
];

export const formats = [
  { label: "Film", detail: "Single story", emoji: "🎞️" },
  { label: "Series", detail: "Multiple episodes", emoji: "📺" },
  { label: "Short", detail: "Under 10 min", emoji: "⚡" },
  { label: "Music Video", detail: "Visual + music", emoji: "🎵" },
];

export const aspectRatios = [
  { label: "16:9", detail: "Widescreen — YouTube, TV", emoji: "🖥️" },
  { label: "2.39:1", detail: "Anamorphic — Cinema", emoji: "🎬" },
  { label: "1.85:1", detail: "Flat — Theatrical", emoji: "📽️" },
  { label: "4:3", detail: "Classic — Retro TV", emoji: "📺" },
  { label: "9:16", detail: "Vertical — TikTok, Reels", emoji: "📱" },
  { label: "1:1", detail: "Square — Instagram", emoji: "⬜" },
];
