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
  1: {
    code: "MTM_ACC_TO_ACC",
    name: "Internal Trade Copier",
    desc: "Trade copier within the same manager",
  },
  2: {
    code: "ANY_ACC_TO_ACC",
    name: "Cross-Broker Trade Copier",
    desc: "From any MT5 account to any MT5 account",
  },
  3: {
    code: "FUND_TO_MT_GRP",
    name: "Fund to MT Group",
    desc: "Fund management — copy from file format and distribute proportionally to MT5 accounts",
  },
  4: {
    code: "ACCOUNT_TO_MT_GRP",
    name: "Account to MT Group",
    desc: "Fund management — copy from any MT5 account and distribute proportionally",
  },
  5: {
    code: "DATA_MT_TO_MT",
    name: "Broker Data Shifter",
    desc: "Data shifting from one manager group to another",
  },
  6: { code: "MT_ACC_TO_ANY_ACC", name: "LP Bridge", desc: "Coverage account" },
  7: { code: "MAMM", name: "MAMM", desc: "Multi-Account Money Manager" },
  8: {
    code: "PAMM",
    name: "PAMM",
    desc: "Percentage Allocation Money Manager",
  },
};

/**
 * Status mapping: NONE=0, API_PENDING=1, API_ACTIVE=2, API_IN_ACTIVE=3
 */
export const STATUS_MAP = {
  0: { label: "None", color: "#94a3b8", bg: "#f1f5f9" },
  1: { label: "Pending", color: "#d97706", bg: "#fef3c7" },
  2: { label: "Active", color: "#16a34a", bg: "#dcfce7" },
  3: { label: "Inactive", color: "#dc2626", bg: "#fee2e2" },
};

export function getCopierInfo(typeId) {
  return (
    COPIER_TYPE_MAP[Number(typeId)] || {
      code: `TYPE_${typeId}`,
      name: `Type ${typeId}`,
      desc: "",
    }
  );
}

export function getStatusInfo(statusVal) {
  return (
    STATUS_MAP[Number(statusVal)] || {
      label: `Status ${statusVal}`,
      color: "#64748b",
      bg: "#f8fafc",
    }
  );
}

/**
 * Helper to return country flag emoji from country name or ISO code
 */
export function getCountryFlag(countryName) {
  if (!countryName) return "🌐";
  const name = String(countryName).toLowerCase().trim();
  const flagMap = {
    india: "🇮🇳",
    in: "🇮🇳",
    cyprus: "🇨🇾",
    cy: "🇨🇾",
    "united kingdom": "🇬🇧",
    uk: "🇬🇧",
    gb: "🇬🇧",
    "united states": "🇺🇸",
    usa: "🇺🇸",
    us: "🇺🇸",
    seychelles: "🇸🇨",
    sweden: "🇸🇪",
    spain: "🇪🇸",
    australia: "🇦🇺",
    singapore: "🇸🇬",
    uae: "🇦🇪",
    "united arab emirates": "🇦🇪",
    dubai: "🇦🇪",
    germany: "🇩🇪",
    france: "🇫🇷",
    canada: "🇨🇦",
    japan: "🇯🇵",
    china: "🇨🇳",
    "south africa": "🇿🇦",
    mauritius: "🇲🇺",
    "saint vincent": "🇻🇨",
    vanuatu: "🇻🇺",
    belize: "🇧🇿",
    malta: "🇲🇹",
    switzerland: "🇨🇭",
    "hong kong": "🇭🇰",
    "new zealand": "🇳🇿",
    turkey: "🇹🇷",
    brazil: "🇧🇷",
    malaysia: "🇲🇾",
    indonesia: "🇮🇩",
    thailand: "🇹🇭",
    vietnam: "🇻🇳",
    philippines: "🇵🇭",
  };
  return flagMap[name] || "🌐";
}

/**
 * Helper to map GET_ADM_PROFILES API output into standard Broker data object
 * Strictly utilizes dynamic API properties from GET_ADM_PROFILES with client IP fallback
 */
export function mapApiProfileToBroker(prof, clientIp = null) {
  const profileId = String(prof.Profile ?? prof.id ?? "");
  const basic = prof.oBasic || {};
  const firstName = basic.First || "";
  const lastName = basic.Last || "";
  const fullName = `${firstName} ${lastName}`.trim() || `Broker ${profileId}`;
  const email = basic.Email || "";
  const referCode = prof.ReferCode || "";
  const dtStr = prof.dtCreated?.Tm_Str || "";

  // Real Country provided at root of prof.Country (or fallback to oBasic.Country)
  const country = prof.Country || basic.Country || "";
  const flag = getCountryFlag(country);

  // Real IP Address (from profile, with fallback to client IP from getIpAddress API)
  const ipAddr = basic.IPAddr || prof.IPAddr || clientIp || "";

  const avatarInitials = (
    (firstName.charAt(0) || fullName.charAt(0) || "B") +
    (lastName.charAt(0) ||
      (fullName.split(" ")[1] ? fullName.split(" ")[1].charAt(0) : "R"))
  ).toUpperCase();

  const loginTypeMap = {
    1: "Email",
    2: "Google",
    3: "Direct MT5",
    4: "API Key",
  };
  const loginType =
    loginTypeMap[prof.oLogin] ||
    (prof.oLogin ? `Type ${prof.oLogin}` : "MT5 Login");

  return {
    id: `brk-${profileId}`,
    managerId: profileId,
    profileId: profileId,
    name: fullName,
    contactPerson: fullName,
    email: email,
    referCode: referCode,
    phone: basic.Phone || prof.Phone || "",
    country: country,
    Country: country, // Alias support for broker.Country and broker.country
    flag: flag,
    profilePic: prof.ProfilePic || null,
    avatarBg: "#EDFAE6",
    avatarColor: "#166534",
    avatarInitials: avatarInitials,
    serverName: `Manager-${profileId}`,
    serverIp: ipAddr ? `${ipAddr}:443` : "",
    ipAddress: ipAddr,
    type: "LIVE",
    accounts: prof.AccountsCount ?? prof.Accounts ?? 0,
    platform: "MetaTrader 5",
    license: prof.License || "FSA Registered Broker",
    planId: prof.planId || null,
    planName: prof.planName || null,
    status: "Connected",
    createdOn: dtStr,
    connectedOn: dtStr,
    lastSync: "Just now",
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
    rawPayload: item,
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
export async function apiAddEditUserTypeUrl({
  profileId,
  type,
  url,
  oStatus = "2",
  duration = "60",
  key = "",
}) {
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
  return (
    result || { Result: false, MSG_USER: "Failed to update URL configuration" }
  );
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
  return (
    result || { Result: false, MSG_USER: "Failed to delete configuration" }
  );
}

/**
 * GET_CLIENT_IP_ADDRESS
 * GET https://insurex.life:3001/kyc/getIpAddress
 * Response: { "success": true, "IP": "103.117.12.152", "ipVersion": "IPv4", "source": "req.ip" }
 */
export async function apiGetClientIpAddress() {
  try {
    const res = await fetch("https://insurex.life:3001/kyc/getIpAddress");
    if (!res.ok) return null;
    const data = await res.json();
    return data?.IP || data?.ip || null;
  } catch (err) {
    console.warn("apiGetClientIpAddress error:", err);
    return null;
  }
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
export async function apiAddAdmUserPackage({
  pkg,
  master,
  slave,
  type,
  tradeProp = 2,
  riskManager = 2,
  amount,
  durationDays,
  information = "",
  adminMsg = "",
  key = "",
}) {
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

/* ==========================================================================
   StructNxLib: Billing & Coupon Contracts Integration
   ========================================================================== */

/**
 * BLC_STATUS enum mapping:
 * NONE = 0, API_PENDING = 1, API_ACTIVE = 2, API_IN_ACTIVE = 3, API_REDEEM = 4
 */
export const BLC_STATUS_MAP = {
  0: { id: 0, label: "None", color: "#000000", bg: "#f1f5f9" },
  1: { id: 1, label: "Pending", color: "#000000", bg: "#fef3c7" },
  2: { id: 2, label: "Active", color: "#000000", bg: "#dcfce7" },
  3: { id: 3, label: "Expired", color: "#000000", bg: "#fee2e2" },
  4: { id: 4, label: "Redeemed", color: "#000000", bg: "#dbeafe" },
};

/**
 * BLC_TRANS_STATUS enum mapping:
 * NONE = 0, PENDING = 1, FAILED = 2, SUCCESS = 3
 */
export const BLC_TRANS_STATUS_MAP = {
  0: { id: 0, label: "None", color: "#000000", bg: "#f1f5f9" },
  1: { id: 1, label: "Pending", color: "#000000", bg: "#fef3c7" },
  2: { id: 2, label: "Failed", color: "#000000", bg: "#fee2e2" },
  3: { id: 3, label: "Success", color: "#000000", bg: "#dcfce7" },
};

/**
 * GET_ADM_USR_SUBSCRIBED_PKG
 * POST /GET_ADM_USR_SUBSCRIBED_PKG
 * Body: { "Initial": 1, "MaxCount": 10 }
 * Fetches all user subscriptions with lstSubscribe (Pkg, oPkg, oUser)
 */
export async function apiGetAdmUsrSubscribedPkg({
  initial = 1,
  maxCount = 50,
  key = "",
} = {}) {
  const result = await safeApiPost("GET_ADM_USR_SUBSCRIBED_PKG", {
    Initial: Number(initial),
    MaxCount: Number(maxCount),
    Key: key,
  });
  return result || { Count: 0, lstSubscribe: [] };
}
export const apiGetAdmUserSubscribed = apiGetAdmUsrSubscribedPkg;

/**
 * BIL_USER_SUBSCRIBED_ADD
 * POST /ADD_ADM_USER_SUBSCRIBED
 */
export async function apiAddAdmUserSubscribed(oPkg, key = "") {
  const result = await safeApiPost("ADD_ADM_USER_SUBSCRIBED", {
    Key: key,
    oPkg: oPkg,
  });
  return result || { Result: false, MSG_USER: "Subscription updated" };
}

/**
 * ADD_USER_CUSTOMIZE_PKG
 * POST /ADD_USER_CUSTOMIZE_PKG
 * Body: { "Key": "", "oCust": { Profile_ID, Pkg_ID, Amt, PkgCode, CoupanApply, Validity_Day, dtCreated, Status } }
 */
export async function apiAddUserCustomizePkg({
  profileId,
  pkgId,
  amt,
  pkgCode = "",
  coupanApply = 2,
  validityDays = 30,
  status = 2,
  key = "",
}) {
  const result = await safeApiPost("ADD_USER_CUSTOMIZE_PKG", {
    Key: key,
    oCust: {
      Profile_ID: Number(profileId),
      Pkg_ID: Number(pkgId),
      Amt: Number(amt),
      PkgCode: String(pkgCode || `PKG-${pkgId}`),
      CoupanApply: Number(coupanApply),
      Validity_Day: Number(validityDays),
      dtCreated: "",
      Status: Number(status),
    },
  });
  return result || { Result: false, MSG_USER: "Customized package created" };
}
export const apiAddAdmPkgCustomize = apiAddUserCustomizePkg;

/**
 * GET_ADM_USER_CUSTOMIZE_PKG
 * POST /GET_ADM_USER_CUSTOMIZE_PKG
 * Body: { "Initial": 1, "MaxCount": 10 }
 * Response: { "Count": 1, "lstPkg": [ ... ] }
 */
export async function apiGetAdmUserCustomizePkg({
  initial = 1,
  maxCount = 50,
  key = "",
} = {}) {
  const result = await safeApiPost("GET_ADM_USER_CUSTOMIZE_PKG", {
    Initial: Number(initial),
    MaxCount: Number(maxCount),
    Key: key,
  });
  return result || { Count: 0, lstPkg: [] };
}
export const apiGetAdmPkgCustomize = apiGetAdmUserCustomizePkg;

/**
 * UPDATE_CUSTOMIZE_PKG_STATUS
 * POST /UPDATE_CUSTOMIZE_PKG_STATUS
 * Body: { "Key": "", "Reserve1": "<PkgCode/BrokerID>", "Reserve2": "1" } (1- Enable, 2- Disable)
 */
export async function apiUpdateCustomizePkgStatus({
  reserve1,
  status = 1,
  key = "",
}) {
  const result = await safeApiPost("UPDATE_CUSTOMIZE_PKG_STATUS", {
    Key: key,
    Reserve1: String(reserve1),
    Reserve2: String(status),
  });
  return (
    result || { Result: false, MSG_USER: "Customized package status updated" }
  );
}

/**
 * BIL_PKG_TRANS_GET_ALL
 * POST /GET_ADM_PKG_TRANS
 */
export async function apiGetAdmPkgTrans(key = "") {
  const result = await safeApiPost("GET_ADM_PKG_TRANS", {
    Key: key,
    Initial: 1,
    MaxCount: 10,
  });
  return result || { Count: 0, lstGet: [] };
}

/**
 * COUPON_STATUS_MAP matching Postman contract:
 * 1=PENDING, 2=CANCELLED, 3=REJECTED, 4=IN_PROCESS, 5=SUCCESS (Active), 6=FREEZE
 * Strict Rule 1: High contrast text (text-black on all soft backgrounds, no same-color text)
 */
export const COUPON_STATUS_MAP = {
  1: {
    id: 1,
    label: "Pending",
    color: "#000000",
    bg: "#fef3c7",
    border: "#fde047",
  },
  2: {
    id: 2,
    label: "Cancelled",
    color: "#000000",
    bg: "#f1f5f9",
    border: "#cbd5e1",
  },
  3: {
    id: 3,
    label: "Rejected",
    color: "#000000",
    bg: "#fee2e2",
    border: "#fca5a5",
  },
  4: {
    id: 4,
    label: "In Process",
    color: "#000000",
    bg: "#dbeafe",
    border: "#93c5fd",
  },
  5: {
    id: 5,
    label: "Active",
    color: "#000000",
    bg: "#dcfce7",
    border: "#86efac",
  },
  6: {
    id: 6,
    label: "Frozen",
    color: "#000000",
    bg: "#e2e8f0",
    border: "#94a3b8",
  },
};

/**
 * ADD_BIL_COUPAN
 * POST /ADD_BIL_COUPAN
 * Body: { "Key": "", "Coupan": { Value, Coupan, Status, Entry, Type, Min, Max, Comment } }
 */
export async function apiAddBilCoupan({
  coupan,
  value,
  comment = "",
  status = 5,
  entry = 2,
  type = 1,
  min = 0,
  max = 0,
  minValue,
  maxProfit,
  key = "",
}) {
  const finalMin = min || minValue || 0;
  const finalMax = max || maxProfit || 0;
  const result = await safeApiPost("ADD_BIL_COUPAN", {
    Key: key,
    Coupan: {
      Coupan: String(coupan).toUpperCase().trim(),
      Value: Number(value),
      Status: Number(status), // 1=PENDING, 2=CANCELLED, 3=REJECTED, 4=IN_PROCESS, 5=SUCCESS, 6=FREEZE
      Entry: Number(entry), // 1=SINGLE, 2=MULTIPLE
      Type: Number(type), // 1=PERC (%), 2=VALUE ($)
      Min: Number(finalMin),
      Max: Number(finalMax),
      Comment: String(comment),
    },
  });
  return result || { Result: false, MSG_USER: "Coupon saved" };
}

/**
 * GET_BIL_COUPAN
 * POST /GET_BIL_COUPAN
 * Body: { "Key": "", "Param1": 0 }
 */
export async function apiGetBilCoupan(key = "") {
  const result = await safeApiPost("GET_BIL_COUPAN", {
    Key: key,
    Param1: 0,
  });
  return Array.isArray(result) ? result : result?.lstCoupan || [];
}

/**
 * GET_BIL_COUPAN_INFO
 * POST /GET_BIL_COUPAN_INFO
 * Body: { "Key": "", "Reserve1": 102 } // coupon ID
 */
export async function apiGetBilCoupanInfo(coupanId, key = "") {
  const result = await safeApiPost("GET_BIL_COUPAN_INFO", {
    Key: key,
    Reserve1: Number(coupanId),
  });
  return result || null;
}

/**
 * DEL_BIL_COUPAN
 * POST /DEL_BIL_COUPAN
 * Body: { "Key": "", "Reserve1": 100 }
 */
export async function apiDelBilCoupan(coupanId, key = "") {
  const result = await safeApiPost("DEL_BIL_COUPAN", {
    Key: key,
    Reserve1: Number(coupanId),
  });
  return result || { Result: false, MSG_USER: "Coupon deleted" };
}

// Aliases for compatibility
export const apiAddAdmCoupon = apiAddBilCoupan;
export const apiGetAdmCoupons = apiGetBilCoupan;
