import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import cron from 'node-cron';
import logger from '../utils/logger';
import { ChainInfo, AssetList, VersionInfo, ChainData, CacheData } from '../types';

class DataSyncService {
  private cacheData: CacheData = {};
  private readonly dataDir = path.join(process.cwd(), 'data');
  private readonly currentDir = path.join(this.dataDir, 'current');
  private readonly repositoryUrl = 'https://github.com/cosmos/chain-registry.git';
  private readonly ignoredFolders = [
    '.github',
    '_IBC',
    '_memo_keys', 
    '_non-cosmos',
    '_scripts',
    '_template'
  ];

  constructor() {
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.currentDir)) {
      fs.mkdirSync(this.currentDir, { recursive: true });
    }
  }

  async syncData(): Promise<void> {
    try {
      logger.info('Starting data sync from chain-registry repository');
      
      const tempDir = path.join(this.dataDir, 'temp');
      
      // Clean temp directory if exists
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }

      // Clone repository to temp directory
      logger.info('Cloning repository...');
      execSync(`git clone ${this.repositoryUrl} ${tempDir}`, { stdio: 'pipe' });

      // Copy valid chain folders to current directory
      await this.copyValidChains(tempDir);

      // Clean up temp directory
      fs.rmSync(tempDir, { recursive: true, force: true });

      // Reload cache
      await this.loadDataToCache();

      logger.info('Data sync completed successfully');
    } catch (error) {
      logger.error('Data sync failed:', error);
      throw error;
    }
  }

  private async copyValidChains(sourceDir: string): Promise<void> {
    const items = fs.readdirSync(sourceDir);
    
    for (const item of items) {
      // Skip ignored folders
      if (this.ignoredFolders.includes(item)) {
        continue;
      }

      const sourcePath = path.join(sourceDir, item);
      const stat = fs.statSync(sourcePath);

      if (stat.isDirectory()) {
        const chainJsonPath = path.join(sourcePath, 'chain.json');
        const assetListPath = path.join(sourcePath, 'assetlist.json');

        // Check if required files exist
        if (fs.existsSync(chainJsonPath) && fs.existsSync(assetListPath)) {
          const destPath = path.join(this.currentDir, item);
          
          // Remove existing directory if exists
          if (fs.existsSync(destPath)) {
            fs.rmSync(destPath, { recursive: true, force: true });
          }

          // Copy directory
          fs.cpSync(sourcePath, destPath, { recursive: true });
          logger.info(`Copied chain data: ${item}`);
        } else {
          logger.warn(`Skipping ${item}: missing required files`);
        }
      }
    }
  }

  async loadDataToCache(): Promise<void> {
    try {
      logger.info('Loading chain data to cache');
      this.cacheData = {};

      if (!fs.existsSync(this.currentDir)) {
        logger.warn('Current data directory does not exist');
        return;
      }

      const chainFolders = fs.readdirSync(this.currentDir);

      for (const chainFolder of chainFolders) {
        const chainPath = path.join(this.currentDir, chainFolder);
        const stat = fs.statSync(chainPath);

        if (stat.isDirectory()) {
          try {
            const chainData = await this.loadChainData(chainPath, chainFolder);
            if (chainData) {
              this.cacheData[chainFolder] = chainData;
            }
          } catch (error) {
            logger.error(`Failed to load chain data for ${chainFolder}:`, error);
          }
        }
      }

      logger.info(`Loaded ${Object.keys(this.cacheData).length} chains to cache`);
    } catch (error) {
      logger.error('Failed to load data to cache:', error);
      throw error;
    }
  }

  private async loadChainData(chainPath: string, chainName: string): Promise<ChainData | null> {
    const chainJsonPath = path.join(chainPath, 'chain.json');
    const assetListPath = path.join(chainPath, 'assetlist.json');
    const versionsPath = path.join(chainPath, 'versions.json');

    if (!fs.existsSync(chainJsonPath) || !fs.existsSync(assetListPath)) {
      logger.warn(`Missing required files for chain: ${chainName}`);
      return null;
    }

    try {
      const chainInfo: ChainInfo = JSON.parse(fs.readFileSync(chainJsonPath, 'utf-8'));
      const assetList: AssetList = JSON.parse(fs.readFileSync(assetListPath, 'utf-8'));
      
      let versionInfo: VersionInfo | undefined;
      if (fs.existsSync(versionsPath)) {
        versionInfo = JSON.parse(fs.readFileSync(versionsPath, 'utf-8'));
      }

      const lastModified = fs.statSync(chainJsonPath).mtime;

      return {
        chainInfo,
        assetList,
        versionInfo,
        lastModified
      };
    } catch (error) {
      logger.error(`Failed to parse JSON files for chain ${chainName}:`, error);
      return null;
    }
  }

  getCachedData(): CacheData {
    return this.cacheData;
  }

  getChainData(chainName: string): ChainData | undefined {
    return this.cacheData[chainName];
  }

  getAllChainNames(): string[] {
    return Object.keys(this.cacheData);
  }

  async initialize(): Promise<void> {
    try {
      // Check if we have existing data
      if (fs.existsSync(this.currentDir) && fs.readdirSync(this.currentDir).length > 0) {
        logger.info('Loading existing data from cache');
        await this.loadDataToCache();
      } else {
        logger.info('No existing data found, performing initial sync');
        await this.syncData();
      }

      // Setup daily sync schedule (at 2 AM every day)
      cron.schedule('0 2 * * *', async () => {
        logger.info('Running scheduled data sync');
        try {
          await this.syncData();
        } catch (error) {
          logger.error('Scheduled sync failed:', error);
        }
      });

      logger.info('Data sync service initialized with daily schedule');
    } catch (error) {
      logger.error('Failed to initialize data sync service:', error);
      throw error;
    }
  }
}

export default DataSyncService;
