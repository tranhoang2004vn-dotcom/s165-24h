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
  };
  recommendations: SongRecommendation[];
}
