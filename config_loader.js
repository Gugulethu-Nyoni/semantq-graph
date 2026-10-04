import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs/promises';
import dotenv from 'dotenv';

// Load .env file FIRST
dotenv.config();

// Get the directory of this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to config file in the same directory
const configPath = path.join(__dirname, 'server.config.js');
const configUrl = pathToFileURL(configPath).href;

// Cache with file stats for smart invalidation
let cachedConfig = null;
let configStats = null;

/**
 * Loads the Semantq configuration from the same directory.
 * @returns {Promise<object>} The loaded configuration object.
 */
async function loadServerConfig() {
  try {
    await fs.access(configPath, fs.constants.R_OK);
    
    // Use a timestamp to bypass the ESM import cache if the file has changed
    const timestamp = Date.now();
    const freshConfigUrl = `${configUrl}?t=${timestamp}`;
    
    const importedModule = await import(freshConfigUrl);
    
    // Extract the default export correctly
    const rawConfig = importedModule.default || importedModule;
    
    // Transform config for adapter compatibility
    const config = { ...rawConfig };
    
    if (rawConfig.database && rawConfig.database.connections) {
      // Determine which database to use - MUST be set via .env
      const envDefaultDb = process.env.DB_DEFAULT;
      
      if (!envDefaultDb) {
        throw new Error('DB_DEFAULT is not set in .env file. Please specify which database to use (mysql, postgres, sqlite, etc.)');
      }
      
      const selectedConnection = rawConfig.database.connections[envDefaultDb];
      
      if (!selectedConnection) {
        const availableConnections = Object.keys(rawConfig.database.connections).join(', ');
        throw new Error(`Connection '${envDefaultDb}' not found in server.config.js. Available connections: ${availableConnections}`);
      }
      
      // Create a flattened database config that the adapter expects
      config.database = {
        adapter: selectedConnection.adapter,
        config: selectedConnection.config,
        _original: rawConfig.database
      };
    } else {
      throw new Error('Invalid database configuration: missing connections object in server.config.js');
    }
    
    console.log('[Config Loader] Config loaded successfully:', {
      hasDatabase: !!config.database,
      adapter: config.database?.adapter,
      host: config.database?.config?.host,
      hasLogistics: !!config.logistics,
      hasEmail: !!config.email,
      emailFrom: config.email?.email_from,
    });
    
    return config;
  } catch (err) {
    const errorMessage = `[Config Loader] Failed to load config from: ${configPath} – ${err.message}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * Check if config file has been modified since last load
 */
async function hasConfigChanged() {
  try {
    const stats = await fs.stat(configPath);
    
    if (!configStats) {
      configStats = stats;
      return true;
    }
    
    const hasChanged = stats.mtime.getTime() !== configStats.mtime.getTime();
    if (hasChanged) {
      configStats = stats;
    }
    return hasChanged;
  } catch (err) {
    return true;
  }
}

/**
 * Main default export for server.js
 */
export default async () => {
  const configChanged = await hasConfigChanged();
  
  if (cachedConfig && !configChanged) {
    return cachedConfig;
  }
  
  // Reload config if it changed or doesn't exist
  cachedConfig = await loadServerConfig();
  return cachedConfig;
};