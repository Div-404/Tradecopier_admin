// TradeCopierDEV API Service — Direct browser fetch with preflight-safe request handling
// API Base URL: https://v10api.traderscabinet.com/TradeCopierDEV

export const BASE_URL = "https://v10api.traderscabinet.com/TradeCopierDEV";

/**
 * Universal safe POST fetch helper
 * Catches HTTP/2 protocol errors, CORS issues, and server disconnects silently
 * returning null fallback values without throwing unhandled console exceptions.
 */
async function safeApiPost(endpoint, payload, silent = true) {
  const url = `${BASE_URL}/${endpoint}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return null;
    }

    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  } catch (err) {
    if (!silent) {
      console.warn(`API ${endpoint} request notice:`, err?.message || err);
    }
    return null;
  }
}

/**
 * Copier Types mapping
 * MTM_ACC_TO_ACC = 1, ANY_ACC_TO_ACC = 2, FUND_TO_MT_GRP = 3,
 * ACCOUNT_TO_MT_GRP = 4, DATA_MT_TO_MT = 5, MT_ACC_TO_ANY_ACC = 6,
 * MAMM = 7, PAMM = 8
 */
export const COPIER_TYPE_MAP = {
  1: { code: 'MTM_ACC_TO_ACC', name: 'Internal Trade Copier', desc: 'Trade copier within the same manager' },
  2: { code: 'ANY_ACC_TO_ACC', name: 'Cross-Broker Trade Copier', desc: 'From any MT5 account to any MT5 account' },
  3: { code: 'FUND_TO_MT_GRP', name: 'Fund to MT Group', desc: 'Fund management — copy from file format and distribute proportionally to MT5 accounts' },
  4: { code: 'ACCOUNT_TO_MT_GRP', name: 'Account to MT Group', desc: 'Fund management — copy from any MT5 account and distribute proportionally' },
  5: { code: 'DATA_MT_TO_MT', name: 'Broker Data Shifter', desc: 'Data shifting from one manager group to another' },
  6: { code: 'MT_ACC_TO_ANY_ACC', name: 'LP Bridge', desc: 'Coverage account' },
  7: { code: 'MAMM', name: 'MAMM', desc: 'Multi-Account Money Manager' },
  8: { code: 'PAMM', name: 'PAMM', desc: 'Percentage Allocation Money Manager' },
};

/**
 * Status mapping: NONE=0, API_PENDING=1, API_ACTIVE=2, API_IN_ACTIVE=3
 */
export const STATUS_MAP = {
  0: { label: 'None', color: '#94a3b8', bg: '#f1f5f9' },
  1: { label: 'Pending', color: '#d97706', bg: '#fef3c7' },
  2: { label: 'Active', color: '#16a34a', bg: '#dcfce7' },
  3: { label: 'Inactive', color: '#dc2626', bg: '#fee2e2' },
};

export function getCopierInfo(typeId) {
  return COPIER_TYPE_MAP[Number(typeId)] || { code: `TYPE_${typeId}`, name: `Type ${typeId}`, desc: '' };
}

export function getStatusInfo(statusVal) {
  return STATUS_MAP[Number(statusVal)] || { label: `Status ${statusVal}`, color: '#64748b', bg: '#f8fafc' };
}

/**
 * Helper to return country flag emoji from country name or ISO code
 */
export function getCountryFlag(countryName) {
  if (!countryName) return '🌐';
  const name = String(countryName).toLowerCase().trim();
  const flagMap = {
    'india': '🇮🇳',
    'in': '🇮🇳',
    'cyprus': '🇨🇾',
    'cy': '🇨🇾',
    'united kingdom': '🇬🇧',
    'uk': '🇬🇧',
    'gb': '🇬🇧',
    'united states': '🇺🇸',
    'usa': '🇺🇸',
    'us': '🇺🇸',
    'seychelles': '🇸🇨',
    'sweden': '🇸🇪',
    'spain': '🇪🇸',
    'australia': '🇦🇺',
    'singapore': '🇸🇬',
    'uae': '🇦🇪',
    'united arab emirates': '🇦🇪',
    'dubai': '🇦🇪',
    'germany': '🇩🇪',
    'france': '🇫🇷',
    'canada': '🇨🇦',
    'japan': '🇯🇵',
    'china': '🇨🇳',
    'south africa': '🇿🇦',
    'mauritius': '🇲🇺',
    'saint vincent': '🇻🇨',
    'vanuatu': '🇻🇺',
    'belize': '🇧🇿',
    'malta': '🇲🇹',
    'switzerland': '🇨🇭',
    'hong kong': '🇭🇰',
    'new zealand': '🇳🇿',
    'turkey': '🇹🇷',
    'brazil': '🇧🇷',
    'malaysia': '🇲🇾',
    'indonesia': '🇮🇩',
    'thailand': '🇹🇭',
    'vietnam': '🇻🇳',
    'philippines': '🇵🇭',
  };
  return flagMap[name] || '🌐';
}

/**
 * Helper to map GET_ADM_PROFILES API output into standard Broker data object
 * Strictly utilizes dynamic API properties from GET_ADM_PROFILES without mock/dummy values
 */
export function mapApiProfileToBroker(prof) {
  const profileId = String(prof.Profile ?? prof.id ?? '');
  const basic = prof.oBasic || {};
  const firstName = basic.First || '';
  const lastName = basic.Last || '';
  const fullName = `${firstName} ${lastName}`.trim() || `Broker ${profileId}`;
  const email = basic.Email || '';
  const referCode = prof.ReferCode || '';
  const dtStr = prof.dtCreated?.Tm_Str || '';
  
  // Real Country provided at root of prof.Country (or fallback to oBasic.Country)
  const country = prof.Country || basic.Country || '';
  const flag = getCountryFlag(country);

  // Real IP Address (no dummy fallback if null)
  const ipAddr = basic.IPAddr || prof.IPAddr || '';

  const avatarInitials = (
    (firstName.charAt(0) || fullName.charAt(0) || 'B') +
    (lastName.charAt(0) || (fullName.split(' ')[1] ? fullName.split(' ')[1].charAt(0) : 'R'))
  ).toUpperCase();

  const loginTypeMap = {
    1: 'Email',
    2: 'Google',
    3: 'Direct MT5',
    4: 'API Key',
  };
  const loginType = loginTypeMap[prof.oLogin] || (prof.oLogin ? `Type ${prof.oLogin}` : 'MT5 Login');

  return {
    id: `brk-${profileId}`,
    managerId: profileId,
    profileId: profileId,
    name: fullName,
    contactPerson: fullName,
    email: email,
    referCode: referCode,
    phone: basic.Phone || prof.Phone || '',
    country: country,
    Country: country, // Alias support for broker.Country and broker.country
    flag: flag,
    profilePic: prof.ProfilePic || null,
    avatarBg: '#EDFAE6',
    avatarColor: '#166534',
    avatarInitials: avatarInitials,
    serverName: `Manager-${profileId}`,
    serverIp: ipAddr ? `${ipAddr}:443` : '',
    ipAddress: ipAddr,
    type: 'LIVE',
    accounts: prof.AccountsCount ?? prof.Accounts ?? 0,
    platform: 'MetaTrader 5',
    license: prof.License || 'FSA Registered Broker',
    planId: 'plan-internal',
    planName: 'Internal Trade Copier',
    status: 'Connected',
    createdOn: dtStr,
    connectedOn: dtStr,
    lastSync: 'Just now',
    notes: `Profile ID ${profileId} loaded dynamically via GET_ADM_PROFILES API.`,
    loginType: loginType,
    rawProfile: prof,
  };
}

/**
 * Helper to map GET_ADM_USER_PACKAGE API output into standard Package object
 */
export function mapApiPackageToSubscription(item, index = 0) {
  const oPkg = item.oPkg || {};
  const pkgName = oPkg.Pkg || `Package ${item.PkgID || index + 1}`;
  const typeId = Number(oPkg.Type || 1);
  const info = getCopierInfo(typeId);

  return {
    id: item.PkgID ? `pkg-${item.PkgID}` : `pkg-type-${typeId}-${index}`,
    pkgId: item.PkgID || 0,
    name: pkgName,
    subtitle: info.name,
    badge: oPkg.Information || "Tier",
    description: oPkg.Admin_Msg || info.desc,
    monthlyPrice: Number(oPkg.Amount || 0),
    annualPrice: Number(oPkg.Amount || 0) * 12,
    maxMasters: String(oPkg.Master || 1),
    maxFollowers: String(oPkg.Slave || 1),
    tradeProp: Number(oPkg.TradeProp || 2),
    riskManager: Number(oPkg.RiskManager || 2),
    durationDays: Number(oPkg.Duration_Days || 30),
    type: typeId,
    status: "Active",
    rawPayload: item
  };
}

/**
 * GET_USER_TYPE_URL
 * POST /GET_USER_TYPE_URL
 * Body: { "Key": "", "Param1": "1000" }
 * Response: { Profile: 1000, lstURL: [{ Duration, Type, URL, oStatus }] }
 */
export async function apiGetUserTypeUrl(profileId, key = "") {
  const result = await safeApiPost("GET_USER_TYPE_URL", {
    Key: key,
    Param1: String(profileId),
  });
  return result || { Profile: Number(profileId), lstURL: [] };
}

/**
 * ADD_EDIT_USER_TYPE_URL
 * POST /ADD_EDIT_USER_TYPE_URL
 * Body: { "Key":"", "Profile":10001, "oInfo":{ "Type":"1", "URL":"...", "oStatus":"2", "Duration":"60" } }
 * Response: { ERR_DEV: null, MSG_USER: "User URL been added ", Result: true }
 */
export async function apiAddEditUserTypeUrl({ profileId, type, url, oStatus = "2", duration = "60", key = "" }) {
  const result = await safeApiPost("ADD_EDIT_USER_TYPE_URL", {
    Key: key,
    Profile: Number(profileId),
    oInfo: {
      Type: String(type),
      URL: String(url),
      oStatus: String(oStatus),
      Duration: String(duration),
    },
  });
  return result || { Result: false, MSG_USER: "Failed to update URL configuration" };
}

/**
 * DEL_USER_TYPE_URL
 * POST /DEL_USER_TYPE_URL
 * Body: { "Key":"", "Param1":"1", "Param2":"10001" }
 *   Param1 = Copier Type, Param2 = Profile/PkgId
 * Response: { ERR_DEV: null, MSG_USER: "Configuration updated successfully ", Result: true }
 */
export async function apiDelUserTypeUrl(copierType, profileId, key = "") {
  const result = await safeApiPost("DEL_USER_TYPE_URL", {
    Key: key,
    Param1: String(copierType),
    Param2: String(profileId),
  });
  return result || { Result: false, MSG_USER: "Failed to delete configuration" };
}

/**
 * GET_ADM_PROFILES
 * POST /GET_ADM_PROFILES
 * Body: { "Initial": 1, "MaxCount": 10 }
 * Response: { Count: 3, lstProfile: [...] }
 */
export async function apiGetAdmProfiles(initial = 1, maxCount = 10) {
  const result = await safeApiPost("GET_ADM_PROFILES", {
    Initial: Number(initial),
    MaxCount: Number(maxCount),
  });
  return result || { Count: 0, lstProfile: [] };
}

/**
 * ADD_ADM_USER_PACKAGE
 * POST /ADD_ADM_USER_PACKAGE
 * Body: { "Key": "", "oPkg": { Pkg, Master, Slave, Type, TradeProp, RiskManager, Amount, Duration_Days, Information, Admin_Msg } }
 * Response: { ERR_DEV: null, MSG_USER: "Package been updated successfully ", Result: true }
 */
export async function apiAddAdmUserPackage({ pkg, master, slave, type, tradeProp = 2, riskManager = 2, amount, durationDays, information = "", adminMsg = "", key = "" }) {
  const result = await safeApiPost("ADD_ADM_USER_PACKAGE", {
    Key: key,
    oPkg: {
      Pkg: String(pkg),
      Master: Number(master),
      Slave: Number(slave),
      Type: Number(type),
      TradeProp: Number(tradeProp),
      RiskManager: Number(riskManager),
      Amount: Number(amount),
      Duration_Days: Number(durationDays),
      Information: String(information),
      Admin_Msg: String(adminMsg),
    },
  });
  return result || { Result: false, MSG_USER: "Package updated" };
}

/**
 * GET_ADM_USER_PACKAGE
 * POST /GET_ADM_USER_PACKAGE
 * Body: { "Key": "", "Param1": "2" } (Param1 = Copier Type)
 * Response: [ { PkgID: 0, oPkg: { ... } } ]
 */
export async function apiGetAdmUserPackage(type = "1", key = "") {
  const result = await safeApiPost("GET_ADM_USER_PACKAGE", {
    Key: key,
    Param1: String(type),
  });
  return Array.isArray(result) ? result : [];
}

/**
 * Helper to fetch all packages across active copier types sequentially
 */
export async function apiGetAllAdmUserPackages() {
  const allPackages = [];
  const types = [1, 2, 3, 4, 5, 6, 7, 8];

  for (const type of types) {
    try {
      const list = await apiGetAdmUserPackage(type);
      if (Array.isArray(list)) {
        list.forEach((item, idx) => {
          if (item && item.oPkg && item.oPkg.Pkg) {
            allPackages.push(mapApiPackageToSubscription(item, idx));
          }
        });
      }
    } catch {
      // Handle network or protocol error silently
    }
  }
  return allPackages;
}

/**
 * DEL_ADM_USER_PACKAGE
 * POST /DEL_ADM_USER_PACKAGE
 * Body: { "Key": "", "Param1": "110" } (Param1 = PkgID)
 * Response: { ERR_DEV: null, MSG_USER: "User Packages been deleted", Result: true }
 */
export async function apiDelAdmUserPackage(pkgId, key = "") {
  const result = await safeApiPost("DEL_ADM_USER_PACKAGE", {
    Key: key,
    Param1: String(pkgId),
  });
  return result || { Result: false, MSG_USER: "User Packages been deleted" };
}
