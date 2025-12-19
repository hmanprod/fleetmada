"use client";

interface CacheEntry<T> {
  data: T | string; // Accepte les données originales ou compressées
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  accessCount: number;
  lastAccess: number;
}

interface CacheOptions {
  ttl?: number; // Default TTL in milliseconds
  maxSize?: number; // Maximum number of entries
  enableCompression?: boolean;
  enableStatistics?: boolean;
}

interface CacheStatistics {
  hits: number;
  misses: number;
  hitRate: number;
  totalRequests: number;
  averageAccessTime: number;
  mostAccessed: Array<{ key: string; accessCount: number }>;
  oldestEntries: Array<{ key: string; timestamp: number }>;
}

class InspectionCacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private options: Required<CacheOptions>;
  private statistics: CacheStatistics;
  private compressionEnabled: boolean = false;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize || 1000,
      enableCompression: options.enableCompression || false,
      enableStatistics: options.enableStatistics !== false
    };

    this.statistics = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalRequests: 0,
      averageAccessTime: 0,
      mostAccessed: [],
      oldestEntries: []
    };

    this.compressionEnabled = this.options.enableCompression;
  }

  // Générer une clé de cache
  private generateCacheKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, any>);

    return `${prefix}:${JSON.stringify(sortedParams)}`;
  }

  // Vérifier si une entrée est expirée
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  // Nettoyer les entrées expirées
  private cleanupExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Éliminer les entrées les moins récemment utilisées (LRU)
  private evictLRU(count: number = 1): void {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].lastAccess - b[1].lastAccess);

    for (let i = 0; i < Math.min(count, entries.length); i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  // Compression simple des données
  private compress(data: any): string {
    if (!this.compressionEnabled) return JSON.stringify(data);
    
    try {
      // Compression simple avec JSON.stringify puis base64
      // Dans un vrai projet, on utiliserait une librairie comme pako
      const jsonString = JSON.stringify(data);
      return btoa(jsonString);
    } catch (error) {
      console.warn('Compression failed, storing uncompressed:', error);
      return JSON.stringify(data);
    }
  }

  // Décompression des données
  private decompress(compressedData: string): any {
    if (!this.compressionEnabled) {
      try {
        return JSON.parse(compressedData);
      } catch (error) {
        throw new Error('Failed to parse uncompressed data');
      }
    }

    try {
      // Décompression simple
      const jsonString = atob(compressedData);
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn('Decompression failed, trying uncompressed parse:', error);
      try {
        return JSON.parse(compressedData);
      } catch (parseError) {
        throw new Error('Failed to parse data');
      }
    }
  }

  // Obtenir une valeur du cache
  get<T>(key: string): T | null {
    const startTime = performance.now();
    
    this.statistics.totalRequests++;

    // Nettoyer les entrées expirées
    this.cleanupExpired();

    const entry = this.cache.get(key);

    if (!entry) {
      this.statistics.misses++;
      this.updateStatistics();
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.statistics.misses++;
      this.updateStatistics();
      return null;
    }

    // Mettre à jour les statistiques d'accès
    entry.accessCount++;
    entry.lastAccess = Date.now();

    this.statistics.hits++;
    this.updateStatistics();

    try {
      return this.decompress(entry.data);
    } catch (error) {
      console.error('Failed to decompress cached data:', error);
      this.cache.delete(key);
      this.statistics.misses++;
      return null;
    }
  }

  // Définir une valeur dans le cache
  set<T>(key: string, data: T, customTtl?: number): void {
    // Vérifier la taille du cache
    if (this.cache.size >= this.options.maxSize) {
      // Éliminer 10% des entrées les plus anciennes
      this.evictLRU(Math.ceil(this.options.maxSize * 0.1));
    }

    const entry: CacheEntry<T> = {
      data: this.compress(data),
      timestamp: Date.now(),
      ttl: customTtl || this.options.ttl,
      accessCount: 1,
      lastAccess: Date.now()
    };

    this.cache.set(key, entry);
  }

  // Supprimer une clé du cache
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Vider le cache
  clear(): void {
    this.cache.clear();
  }

  // Obtenir les statistiques
  getStatistics(): CacheStatistics {
    this.updateStatistics();
    return { ...this.statistics };
  }

  // Mettre à jour les statistiques
  private updateStatistics(): void {
    if (!this.options.enableStatistics) return;

    this.statistics.hitRate = this.statistics.totalRequests > 0 
      ? (this.statistics.hits / this.statistics.totalRequests) * 100 
      : 0;

    // Calculer le temps moyen d'accès (simulation)
    this.statistics.averageAccessTime = this.statistics.hits > 0 
      ? Math.random() * 10 + 1 // Simulation du temps d'accès
      : 0;

    // Top des entrées les plus accédées
    this.statistics.mostAccessed = Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, accessCount: entry.accessCount }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 10);

    // Entrées les plus anciennes
    this.statistics.oldestEntries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, timestamp: entry.timestamp }))
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, 10);
  }

  // Précharger des données
  async preload(
    key: string,
    loader: () => Promise<any>,
    ttl?: number
  ): Promise<any> {
    // Vérifier si les données sont déjà en cache
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    try {
      // Charger les données
      const data = await loader();
      
      // Mettre en cache
      this.set(key, data, ttl);
      
      return data;
    } catch (error) {
      console.error('Failed to preload data:', error);
      throw error;
    }
  }

  // Cache intelligent pour les inspections
  cacheInspectionDetails(id: string, data: any, ttl?: number): void {
    const key = `inspection:${id}`;
    this.set(key, data, ttl);
  }

  getInspectionDetails<T>(id: string): T | null {
    const key = `inspection:${id}`;
    return this.get<T>(key);
  }

  cacheInspectionList(params: Record<string, any>, data: any, ttl?: number): void {
    const key = this.generateCacheKey('inspections:list', params);
    this.set(key, data, ttl);
  }

  getInspectionList<T>(params: Record<string, any>): T | null {
    const key = this.generateCacheKey('inspections:list', params);
    return this.get<T>(key);
  }

  cacheDashboardData(data: any, ttl?: number): void {
    const key = 'dashboard:inspections';
    this.set(key, data, ttl);
  }

  getDashboardData<T>(): T | null {
    const key = 'dashboard:inspections';
    return this.get<T>(key);
  }

  cacheInspectionTemplates(data: any, ttl?: number): void {
    const key = 'inspection:templates';
    this.set(key, data, ttl);
  }

  getInspectionTemplates<T>(): T | null {
    const key = 'inspection:templates';
    return this.get<T>(key);
  }

  // Invalidation intelligente du cache
  invalidateInspection(id: string): void {
    // Invalider les détails de l'inspection
    this.delete(`inspection:${id}`);
    
    // Invalider les listes qui pourraient contenir cette inspection
    const keysToInvalidate: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith('inspections:list:')) {
        keysToInvalidate.push(key);
      }
    }
    
    keysToInvalidate.forEach(key => this.delete(key));
    
    // Invalider le dashboard
    this.delete('dashboard:inspections');
  }

  invalidateAll(): void {
    this.clear();
  }

  // Préchargement intelligent
  async preloadInspectionData(id: string): Promise<void> {
    const tasks = [
      () => this.getInspectionDetails(id),
      () => this.preload(
        `inspection:${id}`,
        async () => {
          // Ici on chargerait depuis l'API
          const response = await fetch(`/api/inspections/${id}`);
          return response.json();
        }
      )
    ];

    await Promise.allSettled(tasks);
  }

  // Nettoyage périodique
  startCleanupInterval(intervalMs: number = 60000): NodeJS.Timeout {
    return setInterval(() => {
      this.cleanupExpired();
    }, intervalMs);
  }
}

// Instance singleton
export const inspectionCache = new InspectionCacheService({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 2000, // 2000 entrées
  enableCompression: true,
  enableStatistics: true
});

// Hook React pour utiliser le cache
export function useInspectionCache() {
  return {
    cache: inspectionCache,
    
    // Méthodes spécialisées pour les inspections
    getInspection: (id: string) => inspectionCache.getInspectionDetails(id),
    setInspection: (id: string, data: any, ttl?: number) => 
      inspectionCache.cacheInspectionDetails(id, data, ttl),
    
    getInspectionList: (params: Record<string, any>) => 
      inspectionCache.getInspectionList(params),
    setInspectionList: (params: Record<string, any>, data: any, ttl?: number) => 
      inspectionCache.cacheInspectionList(params, data, ttl),
    
    getDashboard: () => inspectionCache.getDashboardData(),
    setDashboard: (data: any, ttl?: number) => 
      inspectionCache.cacheDashboardData(data, ttl),
    
    invalidateInspection: (id: string) => inspectionCache.invalidateInspection(id),
    getStats: () => inspectionCache.getStatistics()
  };
}

export default InspectionCacheService;