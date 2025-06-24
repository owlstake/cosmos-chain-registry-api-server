import { Request, Response } from 'express';
import DataSyncService from '../services/dataSyncService';
import logger from '../utils/logger';
import { ApiResponse, ChainLiteInfo } from '../types';

class ChainController {
  private dataSyncService: DataSyncService;

  constructor(dataSyncService: DataSyncService) {
    this.dataSyncService = dataSyncService;
  }

  getAllChains = async (req: Request, res: Response): Promise<void> => {
    try {
      const chains = this.dataSyncService.getAllChainNames();
      const response: ApiResponse<string[]> = {
        success: true,
        data: chains,
        timestamp: new Date().toISOString()
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Error getting all chains:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  getChainDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { chainName } = req.params;
      const chainData = this.dataSyncService.getChainData(chainName);

      if (!chainData) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Chain not found',
          timestamp: new Date().toISOString()
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof chainData.chainInfo> = {
        success: true,
        data: chainData.chainInfo,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting chain details:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  getChainLite = async (req: Request, res: Response): Promise<void> => {
    try {
      const { chainName } = req.params;
      const chainData = this.dataSyncService.getChainData(chainName);

      if (!chainData) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Chain not found',
          timestamp: new Date().toISOString()
        };
        res.status(404).json(response);
        return;
      }

      const chainInfo = chainData.chainInfo;
      const primaryAsset = chainData.assetList.assets[0];

      const liteInfo: ChainLiteInfo = {
        name: chainInfo.chain_name,
        pretty_name: chainInfo.pretty_name,
        network_type: chainInfo.network_type,
        website: chainInfo.website,
        daemon_name: chainInfo.daemon_name,
        chain_id: chainInfo.chain_id,
        node_home: chainInfo.node_home,
        denom: primaryAsset?.base || 'unknown',
        git_repo: chainInfo.codebase?.git_repo,
        recommended_version: chainInfo.codebase?.recommended_version,
        last_modified: chainData.lastModified.toISOString()
      };

      const response: ApiResponse<ChainLiteInfo> = {
        success: true,
        data: liteInfo,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting chain lite info:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  getChainAssets = async (req: Request, res: Response): Promise<void> => {
    try {
      const { chainName } = req.params;
      const chainData = this.dataSyncService.getChainData(chainName);

      if (!chainData) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Chain not found',
          timestamp: new Date().toISOString()
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof chainData.assetList> = {
        success: true,
        data: chainData.assetList,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting chain assets:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  getChainEndpointsRpc = async (req: Request, res: Response): Promise<void> => {
    try {
      const { chainName } = req.params;
      const chainData = this.dataSyncService.getChainData(chainName);

      if (!chainData) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Chain not found',
          timestamp: new Date().toISOString()
        };
        res.status(404).json(response);
        return;
      }

      const rpcEndpoints = chainData.chainInfo.apis?.rpc || [];
      const response: ApiResponse<typeof rpcEndpoints> = {
        success: true,
        data: rpcEndpoints,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting RPC endpoints:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  getChainEndpointsRest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { chainName } = req.params;
      const chainData = this.dataSyncService.getChainData(chainName);

      if (!chainData) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Chain not found',
          timestamp: new Date().toISOString()
        };
        res.status(404).json(response);
        return;
      }

      const restEndpoints = chainData.chainInfo.apis?.rest || [];
      const response: ApiResponse<typeof restEndpoints> = {
        success: true,
        data: restEndpoints,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting REST endpoints:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  getChainEndpointsGrpc = async (req: Request, res: Response): Promise<void> => {
    try {
      const { chainName } = req.params;
      const chainData = this.dataSyncService.getChainData(chainName);

      if (!chainData) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Chain not found',
          timestamp: new Date().toISOString()
        };
        res.status(404).json(response);
        return;
      }

      const grpcEndpoints = chainData.chainInfo.apis?.grpc || [];
      const response: ApiResponse<typeof grpcEndpoints> = {
        success: true,
        data: grpcEndpoints,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting gRPC endpoints:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  getChainPeers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { chainName } = req.params;
      const chainData = this.dataSyncService.getChainData(chainName);

      if (!chainData) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Chain not found',
          timestamp: new Date().toISOString()
        };
        res.status(404).json(response);
        return;
      }

      const peers = chainData.chainInfo.peers?.persistent_peers || [];
      const response: ApiResponse<typeof peers> = {
        success: true,
        data: peers,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting chain peers:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  getChainSeeds = async (req: Request, res: Response): Promise<void> => {
    try {
      const { chainName } = req.params;
      const chainData = this.dataSyncService.getChainData(chainName);

      if (!chainData) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Chain not found',
          timestamp: new Date().toISOString()
        };
        res.status(404).json(response);
        return;
      }

      const seeds = chainData.chainInfo.peers?.seeds || [];
      const response: ApiResponse<typeof seeds> = {
        success: true,
        data: seeds,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error getting chain seeds:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };

  triggerSync = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('Manual sync triggered');
      
      // Start sync in background
      this.dataSyncService.syncData().then(() => {
        logger.info('Manual sync completed successfully');
      }).catch((error) => {
        logger.error('Manual sync failed:', error);
      });

      const response: ApiResponse<{ message: string }> = {
        success: true,
        data: { message: 'Sync started in background' },
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Error triggering sync:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };
}

export default ChainController;
