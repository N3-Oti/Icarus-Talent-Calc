import { GAME_VERSION } from '../constants/gameVersion';
import { cleanTalentPoints } from './exportImport';

const STORAGE_KEY = 'icarus-builds';

export interface SavedBuild {
    name: string;
    gameVersion: string;
    talentPoints: Record<string, Record<string, number>>;
    savedAt: string; // ISO 8601
}

export type SavedBuildsMap = Record<string, SavedBuild>;

export function loadAllBuilds(): SavedBuildsMap {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

export function saveBuild(
    name: string,
    talentPoints: Record<string, Record<string, number>>
): SavedBuildsMap {
    const builds = loadAllBuilds();
    builds[name] = {
        name,
        gameVersion: GAME_VERSION,
        talentPoints: cleanTalentPoints(talentPoints),
        savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(builds));
    return builds;
}

export function deleteBuild(name: string): SavedBuildsMap {
    const builds = loadAllBuilds();
    delete builds[name];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(builds));
    return builds;
}

export function renameBuild(oldName: string, newName: string): SavedBuildsMap {
    const builds = loadAllBuilds();
    if (!builds[oldName] || oldName === newName) return builds;
    builds[newName] = { ...builds[oldName], name: newName };
    delete builds[oldName];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(builds));
    return builds;
}
