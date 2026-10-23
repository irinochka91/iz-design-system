// Types for the hand-written DTCG reader, so scripts/check-contrast.ts and the tests type-check.
import type { ThemeDef } from '../../tokens/themes.config.ts';

export interface ColorValue { colorSpace: 'srgb'; components: number[]; hex: string }
export interface UnitValue { value: number; unit: string }
export type TokenValue = ColorValue | UnitValue | number | string | string[] | number[];

export interface Token { type: string; value: TokenValue | string; description?: string; file: string; overrides?: string }
export interface ResolvedToken { type: string; value: TokenValue; description?: string; file: string; resolvedFrom?: string }
export type TokenMap = Map<string, Token>;
export interface LoadedTheme { all: TokenMap; primitiveNames: Set<string>; semanticNames: Set<string>; themeNames: Set<string> }

export const TOKENS_DIR: string;
export const THEMES: string[];
export const THEME_DEFS: readonly ThemeDef[];
export const TYPES: Set<string>;
export function themeById(id: string): ThemeDef;
export function themeChain(id: string): readonly ThemeDef[];
export function loadLayer(dir: string): TokenMap;
export function loadTheme(theme?: string): LoadedTheme;
export function isAlias(v: unknown): v is string;
export function aliasTarget(v: string): string;
export function resolve(all: TokenMap, name: string, seen?: string[]): ResolvedToken;
export function cssName(name: string): string;
export function toCss(type: string, value: TokenValue): string;
