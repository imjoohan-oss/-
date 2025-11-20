import { AppData } from '../types';

// Constants for Google API
const DISCOVERY_DOCS = [
    "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
    "https://sheets.googleapis.com/$discovery/rest?version=v4"
];
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/spreadsheets';
const SPREADSHEET_NAME = '우체국택배_배송량_데이터';
const MAX_RETRIES = 3;

// Global declarations for Google's libraries
declare global {
  interface Window {
    gapi: any;
    google: any;
    tokenClient: any;
  }
}

// Module-level state
let tokenClient: any;
let spreadsheetId: string | null = null;
let initializationPromise: Promise<void> | null = null;

/**
 * Dynamically loads the required Google API scripts.
 * @returns A promise that resolves when both scripts are loaded.
 */
function loadGoogleScripts(): Promise<void> {
    return new Promise((resolve, reject) => {
        const SCRIPT_GAPI = 'https://apis.google.com/js/api.js';
        const SCRIPT_GIS = 'https://accounts.google.com/gsi/client';
        let loadedScripts = 0;
        const totalScripts = 2;

        const onScriptLoad = () => {
            loadedScripts++;
            if (loadedScripts === totalScripts) {
                resolve();
            }
        };

        const gapiScript = document.createElement('script');
        gapiScript.src = SCRIPT_GAPI;
        gapiScript.async = true;
        gapiScript.defer = true;
        gapiScript.onload = onScriptLoad;
        gapiScript.onerror = () => reject(new Error('Failed to load Google API script (api.js).'));
        document.body.appendChild(gapiScript);

        const gisScript = document.createElement('script');
        gisScript.src = SCRIPT_GIS;
        gisScript.async = true;
        gisScript.defer = true;
        gisScript.onload = onScriptLoad;
        gisScript.onerror = () => reject(new Error('Failed to load Google Identity Services script (gsi/client).'));
        document.body.appendChild(gisScript);
    });
}

/**
 * Intelligently extracts a human-readable message from various error formats.
 * @param error The error object, which can be of any type.
 * @returns A string representing the error message.
 */
function getErrorMessage(error: any): string {
  if (!error) return 'An unknown error occurred.';
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error.result?.error?.message) return error.result.error.message;
  if (error.error && error.details) return `${error.error}: ${error.details}`;
  if (error.type === 'popup_closed') return 'Sign-in process was cancelled by the user.';
  try {
    return JSON.stringify(error);
  } catch {
    return 'An unexpected error occurred. Check the browser console.';
  }
}

/**
 * Initializes the Google API client and Identity Services.
 * This should be called once when the app starts.
 */
export function initialize(signInCallback: () => void): Promise<void> {
    if (initializationPromise) {
        return initializationPromise;
    }

    initializationPromise = (async () => {
        try {
            // Step 1: Check for CLIENT_ID early for a clear error message.
            if (!process.env.CLIENT_ID) {
                throw new Error("Configuration error: CLIENT_ID is missing. Google Sheets sync cannot be initialized.");
            }

            // Step 2: Dynamically load the necessary Google scripts.
            await loadGoogleScripts();

            // Step 3: Load the gapi client library.
            await new Promise<void>((resolve, reject) => {
                window.gapi.load('client', {
                    callback: resolve,
                    onerror: () => reject(new Error('Failed to load gapi client library.')),
                });
            });

            // Step 4: Initialize the gapi client for Sheets and Drive APIs.
            await window.gapi.client.init({
                discoveryDocs: DISCOVERY_DOCS,
            });

            // Step 5: Initialize the Google Identity Services (GIS) token client.
            tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: process.env.CLIENT_ID,
                scope: SCOPES,
                callback: (tokenResponse: any) => {
                    if (tokenResponse && tokenResponse.access_token) {
                        window.gapi.client.setToken(tokenResponse);
                        signInCallback();
                    } else if (tokenResponse.error) {
                        console.error('Token response error:', tokenResponse);
                    }
                },
            });
        } catch (error) {
            initializationPromise = null; // Allow re-initialization on failure.
            const errorMessage = getErrorMessage(error);
            console.error('Google API Initialization failed:', { originalError: error });
            throw new Error(errorMessage);
        }
    })();

    return initializationPromise;
}

export const getIsSignedIn = () => !!window.gapi?.client?.getToken();

export function signIn(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!tokenClient) {
            return reject(new Error("Authentication client is not initialized."));
        }
        tokenClient.requestAccessToken({ prompt: getIsSignedIn() ? '' : 'consent' });
        resolve();
    });
}

export function signOut() {
    const token = window.gapi?.client?.getToken();
    if (token !== null) {
        window.google?.accounts?.oauth2.revoke(token.access_token, () => {
            window.gapi.client.setToken(null);
            spreadsheetId = null;
        });
    }
}

async function withRetry<T>(apiCall: () => Promise<T>): Promise<T> {
  let lastError: any = null;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await apiCall();
    } catch (error: any) {
      lastError = error;
      
      if (error?.status === 401 || error?.result?.error?.status === 'UNAUTHENTICATED') {
        console.error("Authentication error. Signing out.", error);
        signOut();
        throw error;
      }
      
      if (i === MAX_RETRIES - 1) {
        console.error(`API call failed after ${MAX_RETRIES} attempts.`, error);
        break;
      }
      
      const delay = Math.pow(2, i) * 1000;
      console.log(`API call failed. Retrying in ${delay}ms... (Attempt ${i + 2}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

async function findSpreadsheet(): Promise<string> {
    if (spreadsheetId) {
        return spreadsheetId;
    }
    if (!getIsSignedIn()) {
        throw new Error("Not signed in. Cannot find the spreadsheet.");
    }
    
    const response = await window.gapi.client.drive.files.list({
        q: `mimeType='application/vnd.google-apps.spreadsheet' and name='${SPREADSHEET_NAME}' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive',
    });

    if (response.result.files && response.result.files.length > 0) {
        spreadsheetId = response.result.files[0].id!;
        return spreadsheetId;
    } else {
        throw new Error(`Spreadsheet named "${SPREADSHEET_NAME}" not found. Please follow the instructions to create it manually.`);
    }
}


export async function loadData(): Promise<AppData | null> {
    return withRetry(async () => {
        const currentSpreadsheetId = await findSpreadsheet();
        if (!currentSpreadsheetId) return null;

        const response = await window.gapi.client.sheets.spreadsheets.values.batchGet({
            spreadsheetId: currentSpreadsheetId,
            ranges: ['dailyCounts!A2:B', 'monthlyGoals!A2:B', 'holidays!A2:A'],
        });

        const values = response.result.valueRanges || [];
        const dailyCountsData = values[0]?.values || [];
        const monthlyGoalsData = values[1]?.values || [];
        const holidaysData = values[2]?.values || [];

        const appData: AppData = {
            dailyCounts: dailyCountsData.reduce((acc, row) => {
                if(row[0] && row[1]) acc[row[0]] = Number(row[1]);
                return acc;
            }, {} as { [date: string]: number }),
            monthlyGoals: monthlyGoalsData.reduce((acc, row) => {
                if(row[0] && row[1]) acc[row[0]] = Number(row[1]);
                return acc;
            }, {} as { [month: string]: number }),
            holidays: holidaysData.map(row => row[0]).filter(Boolean),
        };
        
        return appData;
    });
}

export async function saveData(data: AppData): Promise<void> {
    await withRetry(async () => {
        const currentSpreadsheetId = await findSpreadsheet();
        
        // Step 1: Clear existing data
        await window.gapi.client.sheets.spreadsheets.values.batchClear({
            spreadsheetId: currentSpreadsheetId,
            resource: {
                ranges: ['dailyCounts!A2:B', 'monthlyGoals!A2:B', 'holidays!A2:A'],
            }
        });
        
        // Step 2: Prepare new data
        const dailyCountsValues = Object.entries(data.dailyCounts).map(([date, count]) => [date, count]);
        const monthlyGoalsValues = Object.entries(data.monthlyGoals).map(([month, goal]) => [month, goal]);
        const holidaysValues = data.holidays.map(date => [date]);

        const dataToWrite = [];
        if(dailyCountsValues.length > 0) {
            dataToWrite.push({ range: 'dailyCounts!A2', values: dailyCountsValues });
        }
        if(monthlyGoalsValues.length > 0) {
            dataToWrite.push({ range: 'monthlyGoals!A2', values: monthlyGoalsValues });
        }
        if(holidaysValues.length > 0) {
            dataToWrite.push({ range: 'holidays!A2', values: holidaysValues });
        }

        if(dataToWrite.length === 0) return;

        // Step 3: Write new data
        await window.gapi.client.sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: currentSpreadsheetId,
            resource: {
                valueInputOption: 'USER_ENTERED',
                data: dataToWrite,
            }
        });
    });
}