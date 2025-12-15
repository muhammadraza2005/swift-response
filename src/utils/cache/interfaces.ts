import { IEmergencyRequest } from '@/types/models';

export interface IEmergencyRequestCache {
    get(id: string): Promise<IEmergencyRequest | undefined>;
    set(id: string, request: IEmergencyRequest): Promise<void>;
    getMany(ids: string[]): Promise<Map<string, IEmergencyRequest>>;
    update(id: string, updater: (request: IEmergencyRequest) => IEmergencyRequest): Promise<boolean>;
    delete(id: string): Promise<boolean>;
    clear(): Promise<void>;
    getStats(): Promise<{
        size: number;
        hits: number;
        misses: number;
        updates: number;
        hitRate: number;
    }>;
    getAllEntries(): Promise<IEmergencyRequest[]>;
    hasData(): Promise<boolean>;
}
