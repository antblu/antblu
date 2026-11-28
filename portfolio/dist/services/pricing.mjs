export const pricing = {
  standard: { low: 2000, high: 3750 },
  ha: { low: 8000, high: 15000, plus: true },
  simple: { low: 500, high: 1500 },
  intermediate: { low: 1500, high: 3000 },
  complex: { low: 3000, high: 10000, plus: true },
  ai: { low: 1500, high: 4000 },
  training: { low: 750, high: 2000 },
  landing: { low: 625 },
  website: { low: 2500 },
  store: { low: 2500 },
  commerce: { low: 10000 }
};

export const tiers = { standard: 'Standard → single host', ha: 'HA → redundant cluster' };

export const hosting = {
  hardware: { name: 'Customer-owned hardware', low: 20, high: 150, note: 'Illustrative operating allowance for power and connectivity, excluding equipment purchases, backups and labor.' },
  vps: { name: 'Cloud VPS', low: 30, high: 300, note: 'Illustrative compute allowance. Storage, backups, networking and additional servers change the bill.' },
  managed: { name: 'Managed Kubernetes', low: 150, high: 800, note: 'Illustrative cluster allowance. Node groups, regional control planes, load balancers and storage vary.' }
};

// Editable planning allowances in USD. These are not published provider rates.
export const hostingProfiles = {
  hardware: [{ name: 'On-premises allowance', hardwareInitial: 1400, serverMonthly: 25, storageRate: 0, backupRate: 0.02, controlPlaneMonthly: 0, networkMonthly: 0 }],
  vps: [
    { name: 'Hetzner Cloud allowance', hardwareInitial: 0, serverMonthly: 35, storageRate: 0.07, backupRate: 0.02, controlPlaneMonthly: 0, networkMonthly: 10 },
    { name: 'DigitalOcean Droplet allowance', hardwareInitial: 0, serverMonthly: 60, storageRate: 0.10, backupRate: 0.03, controlPlaneMonthly: 0, networkMonthly: 12 }
  ],
  managed: [
    { name: 'DigitalOcean Kubernetes allowance', hardwareInitial: 0, serverMonthly: 65, storageRate: 0.10, backupRate: 0.03, controlPlaneMonthly: 40, networkMonthly: 15 },
    { name: 'Amazon EKS allowance', hardwareInitial: 0, serverMonthly: 90, storageRate: 0.10, backupRate: 0.03, controlPlaneMonthly: 75, networkMonthly: 35 }
  ]
};
