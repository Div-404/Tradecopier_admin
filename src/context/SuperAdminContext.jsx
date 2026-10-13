import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialBrokers, initialSubscriptionPackages, initialTransactions } from '../mock/superAdminData';
import { apiGetAdmProfiles, apiGetAdmUserPackage, apiGetAllAdmUserPackages, mapApiProfileToBroker, apiGetClientIpAddress } from '../services/api';

const SuperAdminContext = createContext(null);

export function SuperAdminProvider({ children }) {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('superadmin_auth');
    return saved === 'true';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('superadmin_user');
    return savedUser ? JSON.parse(savedUser) : {
      name: "Alexander Vance",
      email: "superadmin@tradecopier.io",
      role: "Platform SuperAdmin",
      avatar: "AV"
    };
  });

  const OFFICIAL_7_PACKAGE_NAMES = [
    "Internal Trade Copier",
    "Cross-Broker Trade Copier",
    "MAM – Multi-Account Manager",
    "PAMM – Portfolio Manager",
    "LP Bridge",
    "Broker Data Shifter",
    "Bulk Trade Manager"
  ];

  const DATA_VERSION = 'v29_real_profile_india_JX5577EE11';

  // Brokers State
  const [brokers, setBrokers] = useState(() => {
    const savedVer = localStorage.getItem('superadmin_data_ver');
    if (savedVer !== DATA_VERSION) {
      localStorage.removeItem('superadmin_brokers');
      localStorage.setItem('superadmin_data_ver', DATA_VERSION);
      return initialBrokers;
    }
    const saved = localStorage.getItem('superadmin_brokers');
    if (!saved) return initialBrokers;
    try {
      return JSON.parse(saved);
    } catch {
      return initialBrokers;
    }
  });

  // Subscription Packages State (Pure Dynamic Data - No Static Mocks Mixed In)
  const [packages, setPackages] = useState(() => {
    const saved = localStorage.getItem('superadmin_packages');
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  // Transactions State
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('superadmin_transactions');
    if (!saved) return initialTransactions;
    try {
      return JSON.parse(saved);
    } catch {
      return initialTransactions;
    }
  });

  // Client IP State from https://insurex.life:3001/kyc/getIpAddress
  const [clientIp, setClientIp] = useState(null);

  // Fetch client IP address
  const fetchClientIp = async () => {
    try {
      const ip = await apiGetClientIpAddress();
      if (ip) {
        setClientIp(ip);
        // Ensure brokers without an IP address show this client IP
        setBrokers((prevBrokers) =>
          prevBrokers.map((b) => {
            if (!b.ipAddress) {
              return {
                ...b,
                ipAddress: ip,
                serverIp: b.serverIp || `${ip}:443`,
              };
            }
            return b;
          })
        );
        return ip;
      }
    } catch (err) {
      console.warn("fetchClientIp error:", err);
    }
    return null;
  };

  // API Profiles Loading Function (Pure Dynamic Data - No Static Mocks Mixed In)
  const fetchProfilesFromApi = async () => {
    try {
      const [data, fetchedIp] = await Promise.all([
        apiGetAdmProfiles(1, 50),
        clientIp ? Promise.resolve(clientIp) : apiGetClientIpAddress(),
      ]);
      const activeIp = fetchedIp || clientIp;
      if (activeIp && !clientIp) {
        setClientIp(activeIp);
      }
      if (data && Array.isArray(data.lstProfile) && data.lstProfile.length > 0) {
        const apiBrokers = data.lstProfile.map((prof) => mapApiProfileToBroker(prof, activeIp));
        // Pure dynamic data replacement: remove mock static brokers completely!
        setBrokers(apiBrokers);
        return data.lstProfile;
      }
    } catch (err) {
      console.error("GET_ADM_PROFILES API error:", err);
    }
    return [];
  };

  // On-demand API Packages Loading Function (When [] mark as no package found)
  const fetchPackagesFromApi = async () => {
    try {
      const apiPkgs = await apiGetAllAdmUserPackages();
      if (Array.isArray(apiPkgs)) {
        setPackages(apiPkgs);
        return apiPkgs;
      }
    } catch {
      // Silently catch package fetch errors
    }
    return [];
  };

  // Fetch API profiles, client IP & packages on mount
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      fetchClientIp();
      fetchProfilesFromApi();
      fetchPackagesFromApi();
    }
    return () => { mounted = false; };
  }, []);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('superadmin_auth', isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('superadmin_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('superadmin_brokers', JSON.stringify(brokers));
  }, [brokers]);

  useEffect(() => {
    localStorage.setItem('superadmin_packages', JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem('superadmin_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Auth Functions
  const login = (email, password) => {
    const user = {
      name: email.includes('@') ? email.split('@')[0].replace('.', ' ').toUpperCase() : "Platform SuperAdmin",
      email: email || "superadmin@tradecopier.io",
      role: "Master Administrator",
      avatar: email ? email.substring(0, 2).toUpperCase() : "SA"
    };
    setCurrentUser(user);
    setIsAuthenticated(true);
    showToast(`Welcome back, ${user.name}!`);
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    showToast('Logged out successfully from SuperAdmin Console.', 'info');
  };

  // Broker Handlers
  const addBroker = (newBrokerData) => {
    const pastelColors = [
      { bg: "#EDFAE6", color: "#166534" },
      { bg: "#EFF6FF", color: "#1D4ED8" },
      { bg: "#FAF5FF", color: "#6B21A8" },
      { bg: "#ECFEFF", color: "#0E7490" },
      { bg: "#FFFBEB", color: "#B45309" },
      { bg: "#EEF2FF", color: "#4338CA" }
    ];
    const pickedColor = pastelColors[Math.floor(Math.random() * pastelColors.length)];

    const countryMap = {
      "australia": "🇦🇺",
      "united kingdom": "🇬🇧",
      "uk": "🇬🇧",
      "cyprus": "🇨🇾",
      "seychelles": "🇸🇨",
      "sweden": "🇸🇪",
      "spain": "🇪🇸",
      "uae": "🇦🇪",
      "dubai": "🇦🇪",
      "belize": "🇧🇿"
    };
    const cLower = (newBrokerData.country || '').toLowerCase();
    const flag = countryMap[cLower] || "🌐";

    const nextIdNum = 100000 + brokers.length + 1;
    const nextManagerId = newBrokerData.managerId || nextIdNum.toString();

    const newBroker = {
      id: `brk-${nextManagerId}`,
      managerId: nextManagerId,
      name: newBrokerData.name,
      contactPerson: newBrokerData.contactPerson || "Lead Representative",
      email: newBrokerData.email || `admin@${newBrokerData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      phone: newBrokerData.phone || "+1 555 0192",
      country: newBrokerData.country || "United Kingdom",
      flag: flag,
      avatarBg: pickedColor.bg,
      avatarColor: pickedColor.color,
      serverName: newBrokerData.serverName || `${newBrokerData.name.replace(/\s+/g, '')}-Live01`,
      serverIp: newBrokerData.serverIp || "198.51.100.10:443",
      type: newBrokerData.type || "LIVE",
      accounts: Number(newBrokerData.accounts) || 120,
      platform: newBrokerData.platform || "MetaTrader 5",
      license: newBrokerData.license || "FSA Registered Broker",
      planId: newBrokerData.planId || "plan-cross",
      planName: newBrokerData.planName || "Cross-Broker Trade Copier",
      status: newBrokerData.status || "Connected",
      connectedOn: newBrokerData.connectedOn || (() => {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const mm = pad(now.getMonth() + 1);
        const dd = pad(now.getDate());
        const yyyy = now.getFullYear();
        let hours = now.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        const minutes = pad(now.getMinutes());
        return `${mm}/${dd}/${yyyy} ${pad(hours)}:${minutes} ${ampm}`;
      })(),
      lastSync: "Just now",
      notes: newBrokerData.notes || "New broker platform registered via SuperAdmin console."
    };

    setBrokers(prev => [newBroker, ...prev]);
    showToast(`Broker platform "${newBroker.name}" registered successfully.`);
  };

  // Toggle Broker Connection (Disconnect / Reconnect)
  const toggleBrokerConnection = (brokerId) => {
    let brokerName = "Broker";
    let newStatus = "Connected";
    setBrokers(prev => prev.map(b => {
      if (b.id === brokerId) {
        brokerName = b.name;
        newStatus = (b.status === 'Connected' || b.status === 'Approved') ? 'Disconnected' : 'Connected';
        return {
          ...b,
          status: newStatus,
          lastSync: 'Just now'
        };
      }
      return b;
    }));
    if (newStatus === 'Connected') {
      showToast(`Broker "${brokerName}" reconnected successfully!`, 'success');
    } else {
      showToast(`Broker "${brokerName}" disconnected.`, 'info');
    }
  };

  // Update Broker Details
  const updateBroker = (brokerId, updatedFields) => {
    setBrokers(prev => prev.map(b => {
      if (b.id === brokerId) {
        return {
          ...b,
          ...updatedFields,
          lastSync: 'Just now'
        };
      }
      return b;
    }));
    showToast('Broker platform updated successfully!', 'success');
  };

  // Approve Broker Registration
  const approveBroker = (brokerId) => {
    let brokerName = "Broker";
    setBrokers(prev => prev.map(b => {
      if (b.id === brokerId) {
        brokerName = b.name;
        return {
          ...b,
          status: 'Connected',
          lastSync: 'Just now'
        };
      }
      return b;
    }));
    showToast(`Broker "${brokerName}" has been CONNECTED successfully!`, 'success');
  };

  // Cancel Broker Registration
  const cancelBroker = (brokerId) => {
    let brokerName = "Broker";
    setBrokers(prev => prev.map(b => {
      if (b.id === brokerId) {
        brokerName = b.name;
        return {
          ...b,
          status: 'Disconnected',
          lastSync: 'Just now'
        };
      }
      return b;
    }));
    showToast(`Broker "${brokerName}" has been DISCONNECTED.`, 'info');
  };

  const updateBrokerStatus = (brokerId, newStatus) => {
    setBrokers(prev => prev.map(b => {
      if (b.id === brokerId) {
        return {
          ...b,
          status: newStatus,
          lastSync: 'Just now'
        };
      }
      return b;
    }));
    showToast(`Broker status updated to ${newStatus}`);
  };

  const updateBrokerPlan = (brokerId, newPlanId, newPlanName) => {
    setBrokers(prev => prev.map(b => {
      if (b.id === brokerId) {
        return {
          ...b,
          planId: newPlanId,
          planName: newPlanName
        };
      }
      return b;
    }));
    showToast(`Subscription plan updated to "${newPlanName}"`);
  };

  // Subscription Package Handlers
  const addSubscriptionPackage = (pkgData) => {
    const oPkg = pkgData.oPkg || pkgData;
    const pkgName = oPkg.Pkg || pkgData.name || "New Package";
    const typeId = Number(oPkg.Type || 1);

    const typeSubtitleMap = {
      1: "Within Broker (MTM)",
      2: "Any-to-Any Broker",
      3: "Fund Management (File format)",
      4: "Account to MT Group",
      5: "Broker Data Shifter",
      6: "Coverage Account",
      7: "MAM – Multi-Account Manager",
      8: "PAMM – Portfolio Manager"
    };

    const newPkg = {
      id: `plan-${Date.now().toString().slice(-4)}`,
      name: pkgName,
      subtitle: typeSubtitleMap[typeId] || pkgData.subtitle || "Broker Module",
      badge: oPkg.Information || pkgData.badge || "Tier",
      description: oPkg.Admin_Msg || pkgData.description || "Custom enterprise copier service tier.",
      monthlyPrice: Number(oPkg.Amount ?? pkgData.monthlyPrice) || 999,
      annualPrice: Number(pkgData.annualPrice) || ((Number(oPkg.Amount ?? pkgData.monthlyPrice) || 999) * 10),
      maxMasters: String(oPkg.Master ?? pkgData.maxMasters ?? "5"),
      maxFollowers: String(oPkg.Slave ?? pkgData.maxFollowers ?? "9"),
      latencySla: pkgData.latencySla || "< 15ms Ultra-Fast",
      monthlyVolumeLimit: pkgData.monthlyVolumeLimit || "Unlimited Copied Volume",
      features: Array.isArray(pkgData.features) ? pkgData.features : [
        `Master Brokers allowed: ${oPkg.Master ?? 5}`,
        `Investor/Slave accounts: ${oPkg.Slave ?? 9}`,
        `Trade Proportion: ${Number(oPkg.TradeProp) === 2 ? 'Enabled (2)' : 'Disabled (1)'}`,
        `Risk Manager: ${Number(oPkg.RiskManager) === 2 ? 'Enabled (2)' : 'Disabled (1)'}`,
        `Duration: ${oPkg.Duration_Days ?? 30} Days`
      ],
      status: pkgData.status || "Active",
      subscribersCount: 0,
      highlight: Boolean(pkgData.highlight || (oPkg.Information && oPkg.Information.toLowerCase().includes('recom'))),
      rawPayload: {
        Key: pkgData.Key || "",
        oPkg: {
          Pkg: pkgName,
          Master: Number(oPkg.Master ?? 5),
          Slave: Number(oPkg.Slave ?? 9),
          Type: typeId,
          TradeProp: Number(oPkg.TradeProp ?? 2),
          RiskManager: Number(oPkg.RiskManager ?? 2),
          Amount: Number(oPkg.Amount ?? 1000),
          Duration_Days: Number(oPkg.Duration_Days ?? 30),
          Information: oPkg.Information || "",
          Admin_Msg: oPkg.Admin_Msg || ""
        }
      }
    };

    setPackages(prev => [...prev, newPkg]);
    showToast(`Subscription package "${newPkg.name}" created successfully!`);
  };

  const togglePackageStatus = (pkgId) => {
    setPackages(prev => prev.map(p => {
      if (p.id === pkgId) {
        const nextStatus = p.status === 'Active' ? 'Inactive' : 'Active';
        return { ...p, status: nextStatus };
      }
      return p;
    }));
    showToast(`Package status toggled.`);
  };

  const deletePackage = (pkgId) => {
    setPackages(prev => prev.filter(p => p.id !== pkgId));
    showToast('Package removed successfully.', 'info');
  };

  // Reset to initial demo data
  const resetDemoData = () => {
    setBrokers(initialBrokers);
    setPackages(initialSubscriptionPackages);
    setTransactions(initialTransactions);
    showToast('Reset to original sample data.');
  };

  return (
    <SuperAdminContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        login,
        logout,
        brokers,
        addBroker,
        updateBroker,
        toggleBrokerConnection,
        approveBroker,
        cancelBroker,
        updateBrokerStatus,
        updateBrokerPlan,
        packages,
        addSubscriptionPackage,
        togglePackageStatus,
        deletePackage,
        transactions,
        toastMessage,
        toastType,
        showToast,
        resetDemoData,
        fetchProfilesFromApi,
        fetchPackagesFromApi,
        clientIp,
        fetchClientIp
      }}
    >
      {children}
    </SuperAdminContext.Provider>
  );
}

export function useSuperAdmin() {
  const context = useContext(SuperAdminContext);
  if (!context) {
    throw new Error('useSuperAdmin must be used within a SuperAdminProvider');
  }
  return context;
}
