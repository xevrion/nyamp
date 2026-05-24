import { invoke, isTauri } from "@tauri-apps/api/core";

export interface PlayerState {
  trackPath: string | null;
  isPlaying: boolean;
  positionSecs: number;
  volume: number;
}

export async function playerPlay(path: string): Promise<void> {
  await invoke("player_play", { path });
}

export async function playerPause(): Promise<void> {
  await invoke("player_pause");
}

export async function playerResume(): Promise<void> {
  await invoke("player_resume");
}

export async function playerStop(): Promise<void> {
  await invoke("player_stop");
}

export async function playerSeek(seconds: number): Promise<void> {
  await invoke("player_seek", { seconds });
}

export async function playerSetVolume(volume: number): Promise<void> {
  await invoke("player_set_volume", { volume });
}

export async function playerGetState(): Promise<PlayerState | null> {
  if (!isTauri()) return null;
  return invoke<PlayerState>("player_get_state");
}
