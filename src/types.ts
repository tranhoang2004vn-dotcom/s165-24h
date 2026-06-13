/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SongRecommendation {
  title: string;
  artist: string;
  mood: string;
  reason: string;
  lyricSnippet: string;
  caption: string;
  accentColor: string;
  layoutStyle: "vinyl_disk" | "classic_lyrics" | "neon_wave" | "minimalist_album";
  fontStyle: "serif" | "mono" | "sans" | "display";
  previewUrl?: string | null;
  albumCoverUrl?: string | null;
  spotifyUrl?: string | null;
}

export interface AnalysisResponse {
  success: boolean;
  message?: string;
  isDemo: boolean;
  imageAnalysis?: {
    atmosphere: string;
    dominantColors: string[];
    detectedObjects: string[];
    vibeRating: string;
    detectedWeather?: string;
  };
  recommendations: SongRecommendation[];
}
