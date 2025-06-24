// Chain information interfaces
export interface ChainInfo {
  $schema?: string;
  chain_name: string;
  chain_type?: string;
  chain_id: string;
  pretty_name: string;
  status: string;
  network_type: string;
  website?: string;
  bech32_prefix: string;
  daemon_name: string;
  node_home: string;
  key_algos?: string[];
  slip44: number;
  fees?: {
    fee_tokens: Array<{
      denom: string;
      fixed_min_gas_price?: number;
      low_gas_price?: number;
      average_gas_price?: number;
      high_gas_price?: number;
    }>;
  };
  staking?: {
    staking_tokens: Array<{
      denom: string;
    }>;
  };
  codebase?: {
    git_repo?: string;
    recommended_version?: string;
    compatible_versions?: string[];
    consensus?: {
      type?: string;
      version?: string;
      repo?: string;
      tag?: string;
    };
    genesis?: {
      genesis_url?: string;
    };
    sdk?: {
      type?: string;
      repo?: string;
      version?: string;
      tag?: string;
    };
    ibc?: {
      type?: string;
      version?: string;
    };
  };
  logo_URIs?: {
    png?: string;
    svg?: string;
  };
  description?: string;
  peers?: {
    seeds?: Array<{
      id: string;
      address: string;
      provider?: string;
    }>;
    persistent_peers?: Array<{
      id: string;
      address: string;
      provider?: string;
    }>;
  };
  apis?: {
    rpc?: Array<{
      address?: string;
      provider?: string;
    }>;
    rest?: Array<{
      address?: string;
      provider?: string;
    }>;
    grpc?: Array<{
      address?: string;
      provider?: string;
    }>;
  };
  explorers?: Array<{
    kind?: string;
    url?: string;
    tx_page?: string;
    account_page?: string;
  }>;
  images?: Array<{
    png?: string;
    svg?: string;
    theme?: {
      primary_color_hex?: string;
    };
  }>;
}

// Asset information interfaces
export interface AssetList {
  $schema?: string;
  chain_name: string;
  assets: Asset[];
}

export interface Asset {
  description?: string;
  extended_description?: string;
  denom_units: Array<{
    denom: string;
    exponent: number;
  }>;
  base: string;
  name: string;
  display: string;
  symbol: string;
  coingecko_id?: string;
  logo_URIs?: {
    png?: string;
    svg?: string;
  };
  images?: Array<{
    png?: string;
    svg?: string;
    theme?: {
      primary_color_hex?: string;
    };
  }>;
  socials?: {
    website?: string;
    twitter?: string;
  };
  type_asset?: string;
}

// Version information interfaces
export interface VersionInfo {
  $schema?: string;
  chain_name: string;
  versions: Array<{
    name: string;
    height?: number;
    recommended_version: string;
    compatible_versions: string[];
    consensus?: {
      type?: string;
      version?: string;
      repo?: string;
      tag?: string;
    };
    sdk?: {
      type?: string;
      repo?: string;
      version?: string;
      tag?: string;
    };
    ibc?: {
      type?: string;
      version?: string;
    };
    previous_version_name?: string;
    next_version_name?: string;
  }>;
}

// API Response interfaces
export interface ChainLiteInfo {
  name: string;
  pretty_name: string;
  network_type: string;
  website?: string;
  daemon_name: string;
  chain_id: string;
  node_home: string;
  denom: string;
  git_repo?: string;
  recommended_version?: string;
  last_modified?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// Internal cache interfaces
export interface ChainData {
  chainInfo: ChainInfo;
  assetList: AssetList;
  versionInfo?: VersionInfo;
  lastModified: Date;
}

export interface CacheData {
  [chainName: string]: ChainData;
}
