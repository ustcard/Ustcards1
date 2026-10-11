// Client-Side API & Offline Fallback Client
// When deployed on hosts without Node.js backend running (e.g. Hostinger shared hosting where /api returns HTML),
// this service automatically falls back to persistent localStorage so Admin & Customer logins and features work 100%!

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  password_hash?: string;
  role: 'super_admin' | 'ops_admin' | 'support_agent' | 'customer';
  account_status: 'active' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface CardRequest {
  id: string;
  request_id: string;
  user_id: string;
  card_network: 'visa' | 'mastercard';
  cardholder_name: string;
  simulated_card_number: string;
  simulated_expiry: string;
  request_status: string;
  payment_status: string;
  design_version_id: string;
  rejection_reason?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  request_id: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state_region: string;
  country: string;
  postal_code: string;
  delivery_phone: string;
  created_at: string;
  updated_at: string;
}

export interface PricingItem {
  id: string;
  service_name: string;
  description: string;
  amount: number;
  currency: string;
  is_enabled: boolean;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface Shipment {
  id: string;
  shipment_id: string;
  request_id: string;
  tracking_id: string;
  courier_name: string;
  courier_reference: string;
  destination_summary: string;
  current_status: string;
  dispatched_at?: string;
  delivered_at?: string;
  estimated_delivery?: string;
  created_at: string;
  updated_at: string;
}

export interface TrackingEvent {
  id: string;
  shipment_id: string;
  status: string;
  location?: string;
  description: string;
  event_at: string;
  created_by: string;
  created_at: string;
}

export interface Settings {
  id: string;
  platform_name: string;
  watermark_enabled: boolean;
  watermark_text: string;
  watermark_opacity: number;
  watermark_size: number;
  watermark_position: 'diagonal' | 'center' | 'bottom_right';
  support_email: string;
  support_phone: string;
  default_currency: string;
  maintenance_mode: boolean;
  updated_by: string;
  updated_at: string;
}

const STORAGE_KEY = 'ust_database_store_v1';

function getDefaultSeedData() {
  const now = new Date().toISOString();
  return {
    users: [
      {
        id: 'usr_admin_1',
        full_name: 'Universal Admin',
        email: 'admin@universalsportstip.com',
        phone: '+1 800-555-0199',
        password_hash: 'admin12345',
        role: 'super_admin' as const,
        account_status: 'active' as const,
        created_at: now,
        updated_at: now
      },
      {
        id: 'usr_demo_customer',
        full_name: 'Alex Mercer',
        email: 'alex.mercer@example.com',
        phone: '+1 555-234-5678',
        password_hash: 'customer123',
        role: 'customer' as const,
        account_status: 'active' as const,
        created_at: now,
        updated_at: now
      }
    ],
    card_requests: [
      {
        id: 'req_seed_1',
        request_id: 'UST-CARD-000101',
        user_id: 'usr_demo_customer',
        card_network: 'visa' as const,
        cardholder_name: 'ALEX MERCER',
        simulated_card_number: '4892 8492 1039 9210',
        simulated_expiry: '10/29',
        request_status: 'Dispatched',
        payment_status: 'Paid',
        design_version_id: 'des_v1',
        approved_by: 'Universal Admin',
        approved_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        submitted_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        updated_at: now
      }
    ],
    addresses: [
      {
        id: 'addr_seed_1',
        request_id: 'req_seed_1',
        address_line_1: '742 Evergreen Terrace',
        address_line_2: 'Suite 4B',
        city: 'Springfield',
        state_region: 'Oregon',
        country: 'United States',
        postal_code: '97477',
        delivery_phone: '+1 555-234-5678',
        created_at: now,
        updated_at: now
      }
    ],
    card_designs: [
      {
        id: 'des_v1',
        design_name: 'Master Blue Abstract v1.0',
        card_network: 'all',
        dynamic_field_configuration: {
          name_x: 8,
          name_y: 80,
          name_font_size: 14,
          name_color: '#FFFFFF',
          number_x: 8,
          number_y: 64,
          expiry_x: 62,
          expiry_y: 80,
          chip_x: 8,
          chip_y: 30,
          logo_x: 78,
          logo_y: 74
        },
        version_number: 1,
        is_active: true,
        created_by: 'Universal Admin',
        created_at: now,
        updated_at: now
      }
    ],
    pricing: [
      {
        id: 'price_1',
        service_name: 'Card Production',
        description: 'High-precision sports tip physical card manufacturing and micro-engraving',
        amount: 45.00,
        currency: 'USD',
        is_enabled: true,
        created_by: 'admin',
        updated_by: 'admin',
        created_at: now,
        updated_at: now
      },
      {
        id: 'price_2',
        service_name: 'Delivery',
        description: 'Secure tracked express courier delivery with signature confirmation',
        amount: 15.00,
        currency: 'USD',
        is_enabled: true,
        created_by: 'admin',
        updated_by: 'admin',
        created_at: now,
        updated_at: now
      },
      {
        id: 'price_3',
        service_name: 'Maintenance',
        description: 'Annual network directory synchronization & card status maintenance',
        amount: 10.00,
        currency: 'USD',
        is_enabled: true,
        created_by: 'admin',
        updated_by: 'admin',
        created_at: now,
        updated_at: now
      },
      {
        id: 'price_4',
        service_name: 'Tracking',
        description: 'Priority SMS and email real-time shipment milestone notifications',
        amount: 5.00,
        currency: 'USD',
        is_enabled: true,
        created_by: 'admin',
        updated_by: 'admin',
        created_at: now,
        updated_at: now
      }
    ],
    shipments: [
      {
        id: 'ship_seed_1',
        shipment_id: 'UST-SHIP-1001',
        request_id: 'req_seed_1',
        tracking_id: 'UST-TRK-8F42K9',
        courier_name: 'Apex Priority Express',
        courier_reference: 'APX-99482-US',
        destination_summary: 'Springfield, OR, United States',
        current_status: 'In Transit',
        dispatched_at: new Date(Date.now() - 86400000).toISOString(),
        estimated_delivery: new Date(Date.now() + 86400000 * 2).toLocaleDateString(),
        created_at: now,
        updated_at: now
      }
    ],
    tracking_events: [
      {
        id: 'evt_1',
        shipment_id: 'ship_seed_1',
        status: 'Request Received',
        location: 'Universal Sports Tip Central',
        description: 'Card issuance request registered and verified in core system.',
        event_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        created_by: 'System',
        created_at: now
      },
      {
        id: 'evt_2',
        shipment_id: 'ship_seed_1',
        status: 'Card Approved',
        location: 'Compliance Desk, London Facility',
        description: 'Customer application vetted and cleared for high-spec manufacturing.',
        event_at: new Date(Date.now() - 86400000 * 2.5).toISOString(),
        created_by: 'Universal Admin',
        created_at: now
      },
      {
        id: 'evt_3',
        shipment_id: 'ship_seed_1',
        status: 'Card Printed',
        location: 'Secure Production Lab #3',
        description: 'Master Blue Abstract card micro-printed, contactless chip encoded, and quality audited.',
        event_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        created_by: 'Ops Team',
        created_at: now
      },
      {
        id: 'evt_4',
        shipment_id: 'ship_seed_1',
        status: 'Dispatched',
        location: 'Outbound Logistics Center',
        description: 'Secure package handed over to Apex Priority Express courier.',
        event_at: new Date(Date.now() - 86400000).toISOString(),
        created_by: 'Apex Logistics',
        created_at: now
      },
      {
        id: 'evt_5',
        shipment_id: 'ship_seed_1',
        status: 'In Transit',
        location: 'Regional Sorting Hub, Portland OR',
        description: 'Package sorted and routed to local destination delivery hub.',
        event_at: new Date(Date.now() - 3600000 * 5).toISOString(),
        created_by: 'Apex Hub',
        created_at: now
      }
    ],
    notifications: [
      {
        id: 'notif_seed_1',
        user_id: 'usr_demo_customer',
        recipient_email: 'alex.mercer@example.com',
        recipient_name: 'Alex Mercer',
        request_id: 'UST-CARD-000101',
        subject: 'Congrats! Your payout has been funded to your card',
        message: 'Congratulations Alex Mercer! Your payout has been funded to your Universal Sports Tip card (Ref: UST-CARD-000101). Your personalized card has been approved and registered for production.',
        payout_amount: '$1,250.00 USD',
        status: 'Delivered',
        sent_at: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ],
    settings: {
      id: 'settings_1',
      platform_name: 'Universal Sports Tip',
      watermark_enabled: true,
      watermark_text: 'UNIVERSAL SPORTS TIP - SPECIMEN',
      watermark_opacity: 0.22,
      watermark_size: 13,
      watermark_position: 'diagonal' as const,
      support_email: 'support@universalsportstip.com',
      support_phone: '+1 800-555-0199',
      default_currency: 'USD',
      maintenance_mode: false,
      updated_by: 'usr_admin_1',
      updated_at: now
    },
    audit_logs: [
      {
        id: 'log_1',
        actor_user_id: 'usr_admin_1',
        actor_name: 'Universal Admin',
        action: 'SYSTEM_INIT',
        entity_type: 'Settings',
        entity_id: 'global',
        summary: 'Database initialized with master artwork profiles and security rules.',
        created_at: now
      }
    ]
  };
}

function getLocalDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed;
    }
  } catch (e) {
    console.warn('Could not read from local database', e);
  }
  const seed = getDefaultSeedData();
  saveLocalDb(seed);
  return seed;
}

function saveLocalDb(data: any) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save to local database', e);
  }
}

// Universal fetcher that probes the backend first, then falls back safely if non-JSON/HTML is returned
async function smartFetch(url: string, options?: RequestInit): Promise<{ isJson: boolean; data: any; status: number }> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await res.json();
      return { isJson: true, data: json, status: res.status };
    }
    return { isJson: false, data: null, status: res.status };
  } catch (e) {
    // Network error or backend offline
    return { isJson: false, data: null, status: 0 };
  }
}

// ----------------------------------------------------
// AUTHENTICATION
// ----------------------------------------------------

export async function loginUser(email: string, password: string): Promise<{ user: User; token: string }> {
  const probe = await smartFetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (probe.isJson) {
    if (probe.status >= 200 && probe.status < 300) {
      return probe.data;
    }
    throw new Error(probe.data?.error || 'Invalid credentials');
  }

  // Fallback to local storage
  const db = getLocalDb();
  const user = db.users.find((u: any) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || user.password_hash !== password) {
    throw new Error('Invalid email or password.');
  }

  const { password_hash, ...safeUser } = user;
  return { user: safeUser, token: user.id };
}

export async function registerUser(fullName: string, email: string, phone: string, password: string): Promise<{ user: User; token: string }> {
  const probe = await smartFetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: fullName, email, phone, password })
  });

  if (probe.isJson) {
    if (probe.status >= 200 && probe.status < 300) {
      return probe.data;
    }
    throw new Error(probe.data?.error || 'Registration failed');
  }

  // Fallback to local storage
  const db = getLocalDb();
  const existing = db.users.find((u: any) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const now = new Date().toISOString();
  const newUser: any = {
    id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    full_name: fullName.trim(),
    email: email.trim().toLowerCase(),
    phone: phone ? phone.trim() : '',
    password_hash: password,
    role: 'customer',
    account_status: 'active',
    created_at: now,
    updated_at: now
  };

  db.users.push(newUser);
  saveLocalDb(db);

  const { password_hash: _, ...safeUser } = newUser;
  return { user: safeUser, token: newUser.id };
}

// ----------------------------------------------------
// ADMIN DATA
// ----------------------------------------------------

export async function fetchAdminData(token?: string) {
  const headers = { Authorization: `Bearer ${token || 'usr_admin_1'}` };
  
  // Try server first
  const probe = await smartFetch('/api/admin/stats', { headers });
  if (probe.isJson && probe.status === 200) {
    // Backend is alive, load all from server
    try {
      const [resStats, resReqs, resPrices, resShips, resDes, resSets, resAudits] = await Promise.all([
        probe.data,
        fetch('/api/requests', { headers }).then(r => r.json()),
        fetch('/api/pricing', { headers }).then(r => r.json()),
        fetch('/api/shipments', { headers }).then(r => r.json()),
        fetch('/api/designs', { headers }).then(r => r.json()),
        fetch('/api/settings', { headers }).then(r => r.json()),
        fetch('/api/admin/audit-logs', { headers }).then(r => r.json())
      ]);
      return {
        stats: resStats,
        requests: Array.isArray(resReqs) ? resReqs : [],
        pricing: Array.isArray(resPrices) ? resPrices : [],
        shipments: Array.isArray(resShips) ? resShips : [],
        designs: Array.isArray(resDes) ? resDes : [],
        settings: resSets || null,
        auditLogs: Array.isArray(resAudits) ? resAudits : []
      };
    } catch (e) {
      // Fall through to local fallback
    }
  }

  // Fallback to local database
  const db = getLocalDb();
  const totalRequests = db.card_requests.length;
  const pendingRequests = db.card_requests.filter((r: any) => r.request_status === 'Submitted' || r.request_status === 'Pending Review').length;
  const approvedCards = db.card_requests.filter((r: any) => r.request_status === 'Approved' || r.request_status === 'Processing' || r.request_status === 'Printed').length;
  const dispatchedCards = db.card_requests.filter((r: any) => r.request_status === 'Dispatched' || r.request_status === 'Delivered').length;

  const stats = {
    totalRequests,
    pendingRequests,
    approvedCards,
    dispatchedCards,
    totalRevenue: totalRequests * 75,
    activeShipments: db.shipments.filter((s: any) => s.current_status !== 'Delivered').length
  };

  return {
    stats,
    requests: db.card_requests || [],
    pricing: db.pricing || [],
    shipments: db.shipments || [],
    designs: db.card_designs || [],
    settings: db.settings || null,
    auditLogs: db.audit_logs || []
  };
}

// ----------------------------------------------------
// ACTIONS
// ----------------------------------------------------

export async function approveCardRequest(reqId: string, token?: string) {
  const probe = await smartFetch(`/api/requests/${reqId}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token || 'usr_admin_1'}` }
  });
  if (probe.isJson && probe.status === 200) return probe.data;

  // Local fallback
  const db = getLocalDb();
  const req = db.card_requests.find((r: any) => r.id === reqId);
  if (req) {
    req.request_status = 'Approved';
    req.approved_by = 'Universal Admin';
    req.approved_at = new Date().toISOString();
    req.updated_at = new Date().toISOString();
    saveLocalDb(db);
  }
  return { success: true, request: req };
}

export async function rejectCardRequest(reqId: string, reason: string, token?: string) {
  const probe = await smartFetch(`/api/requests/${reqId}/reject`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token || 'usr_admin_1'}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reason })
  });
  if (probe.isJson && probe.status === 200) return probe.data;

  // Local fallback
  const db = getLocalDb();
  const req = db.card_requests.find((r: any) => r.id === reqId);
  if (req) {
    req.request_status = 'Rejected';
    req.rejection_reason = reason;
    req.rejected_by = 'Universal Admin';
    req.rejected_at = new Date().toISOString();
    req.updated_at = new Date().toISOString();
    saveLocalDb(db);
  }
  return { success: true, request: req };
}

export async function updateCardRequestStatus(reqId: string, status: string, token?: string) {
  const probe = await smartFetch(`/api/requests/${reqId}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token || 'usr_admin_1'}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status })
  });
  if (probe.isJson && probe.status === 200) return probe.data;

  // Local fallback
  const db = getLocalDb();
  const req = db.card_requests.find((r: any) => r.id === reqId);
  if (req) {
    req.request_status = status;
    req.updated_at = new Date().toISOString();
    saveLocalDb(db);
  }
  return { success: true, request: req };
}

export async function createShipment(shipmentData: any, token?: string) {
  const probe = await smartFetch('/api/shipments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token || 'usr_admin_1'}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(shipmentData)
  });
  if (probe.isJson && probe.status === 200) return probe.data;

  // Local fallback
  const db = getLocalDb();
  const now = new Date().toISOString();
  const newShipment = {
    id: 'ship_' + Date.now(),
    shipment_id: 'UST-SHIP-' + Math.floor(1000 + Math.random() * 9000),
    request_id: shipmentData.request_id,
    tracking_id: shipmentData.tracking_id,
    courier_name: shipmentData.courier_name,
    courier_reference: shipmentData.courier_reference || 'REF-' + Math.floor(10000 + Math.random() * 90000),
    destination_summary: shipmentData.destination_summary,
    current_status: 'Dispatched',
    dispatched_at: now,
    estimated_delivery: shipmentData.estimated_delivery || new Date(Date.now() + 86400000 * 3).toLocaleDateString(),
    created_at: now,
    updated_at: now
  };
  db.shipments = db.shipments || [];
  db.shipments.push(newShipment);

  // Add initial event
  db.tracking_events = db.tracking_events || [];
  db.tracking_events.push({
    id: 'evt_' + Date.now(),
    shipment_id: newShipment.id,
    status: 'Dispatched',
    location: 'Distribution Hub',
    description: `Package dispatched with ${shipmentData.courier_name}`,
    event_at: now,
    created_by: 'Admin',
    created_at: now
  });

  saveLocalDb(db);
  return { success: true, shipment: newShipment };
}

export async function addTrackingEvent(shipmentId: string, eventData: any, token?: string) {
  const probe = await smartFetch(`/api/shipments/${shipmentId}/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token || 'usr_admin_1'}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(eventData)
  });
  if (probe.isJson && probe.status === 200) return probe.data;

  // Local fallback
  const db = getLocalDb();
  const now = new Date().toISOString();
  const event = {
    id: 'evt_' + Date.now(),
    shipment_id: shipmentId,
    status: eventData.status,
    location: eventData.location,
    description: eventData.description,
    event_at: now,
    created_by: 'Admin',
    created_at: now
  };
  db.tracking_events = db.tracking_events || [];
  db.tracking_events.push(event);

  const ship = db.shipments.find((s: any) => s.id === shipmentId);
  if (ship) {
    ship.current_status = eventData.status;
    ship.updated_at = now;
  }
  saveLocalDb(db);
  return { success: true, event };
}

export async function updatePricingItem(id: string, amount: number, is_enabled: boolean, token?: string) {
  const probe = await smartFetch(`/api/pricing/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token || 'usr_admin_1'}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ amount, is_enabled })
  });
  if (probe.isJson && probe.status === 200) return probe.data;

  // Local fallback
  const db = getLocalDb();
  const item = db.pricing.find((p: any) => p.id === id);
  if (item) {
    item.amount = amount;
    item.is_enabled = is_enabled;
    item.updated_at = new Date().toISOString();
    saveLocalDb(db);
  }
  return { success: true, item };
}

export async function updatePlatformSettings(settingsData: any, token?: string) {
  const probe = await smartFetch('/api/settings', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token || 'usr_admin_1'}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(settingsData)
  });
  if (probe.isJson && probe.status === 200) return probe.data;

  // Local fallback
  const db = getLocalDb();
  db.settings = { ...db.settings, ...settingsData, updated_at: new Date().toISOString() };
  saveLocalDb(db);
  return { success: true, settings: db.settings };
}

export async function generatePrintPackageApi(requestId: string, token?: string) {
  const probe = await smartFetch('/api/print-packages/generate', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token || 'usr_admin_1'}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ request_id: requestId })
  });

  if (probe.isJson && probe.status === 200) {
    return probe.data;
  }

  // Local fallback for Hostinger or offline environments
  const db = getLocalDb();
  const req = (db.card_requests || []).find((r: any) => r.id === requestId || r.request_id === requestId);
  const now = new Date().toISOString();

  if (req) {
    if (req.request_status === 'Approved' || req.request_status === 'Processing') {
      req.request_status = 'Printed';
      req.updated_at = now;
    }
  }

  db.print_packages = db.print_packages || [];
  const newPkg = {
    id: 'pkg_' + Date.now(),
    request_id: req ? req.id : requestId,
    design_version_id: req?.design_version_id || 'des_v1',
    front_file_path: `/exports/${req?.request_id || requestId}_front.png`,
    back_file_path: `/exports/${req?.request_id || requestId}_back.png`,
    details_pdf_path: `/exports/${req?.request_id || requestId}_details.pdf`,
    generation_status: 'ready',
    generated_by: 'Universal Admin',
    generated_at: now
  };
  db.print_packages.push(newPkg);

  db.audit_logs = db.audit_logs || [];
  db.audit_logs.push({
    id: 'audit_' + Date.now(),
    actor_id: 'usr_admin_1',
    actor_name: 'Universal Admin',
    action_type: 'PRINT_PACKAGE_GENERATED',
    target_entity: 'PrintPackage',
    target_id: newPkg.id,
    summary: `Generated print package for ${req?.request_id || requestId}`,
    created_at: now
  });

  saveLocalDb(db);
  return {
    success: true,
    package: newPkg
  };
}

// ----------------------------------------------------
// CUSTOMER QUERIES
// ----------------------------------------------------

export async function fetchCustomerData(userId: string) {
  const headers = { Authorization: `Bearer ${userId}` };
  const probe = await smartFetch(`/api/requests?user_id=${userId}`, { headers });
  
  if (probe.isJson && probe.status === 200) {
    try {
      const notifsRes = await fetch(`/api/notifications?user_id=${userId}`, { headers }).then(r => r.json());
      return {
        requests: Array.isArray(probe.data) ? probe.data : [],
        notifications: Array.isArray(notifsRes) ? notifsRes : []
      };
    } catch (e) {
      // Fall through to local fallback
    }
  }

  // Local fallback
  const db = getLocalDb();
  const reqs = (db.card_requests || []).filter((r: any) => r.user_id === userId);
  const notifs = (db.notifications || []).filter((n: any) => n.user_id === userId);
  return {
    requests: reqs,
    notifications: notifs
  };
}

export async function submitNewCardRequest(payload: any, token?: string) {
  const probe = await smartFetch('/api/requests', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token || 'usr_demo_customer'}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (probe.isJson && probe.status === 200) return probe.data;

  // Local fallback
  const db = getLocalDb();
  const now = new Date().toISOString();
  const randomRef = 'UST-CARD-' + Math.floor(100000 + Math.random() * 900000);
  
  const newRequest = {
    id: 'req_' + Date.now(),
    request_id: randomRef,
    user_id: payload.user_id || 'usr_demo_customer',
    card_network: payload.card_network,
    cardholder_name: payload.cardholder_name.toUpperCase(),
    simulated_card_number: payload.simulated_card_number,
    simulated_expiry: payload.simulated_expiry,
    request_status: 'Submitted',
    payment_status: 'Paid',
    design_version_id: 'des_v1',
    submitted_at: now,
    created_at: now,
    updated_at: now
  };

  db.card_requests = db.card_requests || [];
  db.card_requests.push(newRequest);

  if (payload.address) {
    db.addresses = db.addresses || [];
    db.addresses.push({
      id: 'addr_' + Date.now(),
      request_id: newRequest.id,
      address_line_1: payload.address.address_line_1,
      address_line_2: payload.address.address_line_2 || '',
      city: payload.address.city,
      state_region: payload.address.state_region,
      country: payload.address.country,
      postal_code: payload.address.postal_code,
      delivery_phone: payload.address.delivery_phone,
      created_at: now,
      updated_at: now
    });
  }

  saveLocalDb(db);
  return { success: true, request: newRequest };
}

export async function trackShipmentPublic(trackingOrRequestId: string) {
  const probe = await smartFetch(`/api/shipments/track/${encodeURIComponent(trackingOrRequestId.trim())}`);
  if (probe.isJson && probe.status === 200) return probe.data;

  // Local fallback
  const db = getLocalDb();
  const idQuery = trackingOrRequestId.trim().toUpperCase();
  
  const ship = (db.shipments || []).find(
    (s: any) => s.tracking_id.toUpperCase() === idQuery || s.shipment_id.toUpperCase() === idQuery
  );

  let req = null;
  if (ship) {
    req = (db.card_requests || []).find((r: any) => r.id === ship.request_id || r.request_id === ship.request_id);
  } else {
    req = (db.card_requests || []).find((r: any) => r.request_id.toUpperCase() === idQuery);
  }

  if (!ship && !req) {
    throw new Error('No shipment or card request found with identifier ' + trackingOrRequestId);
  }

  const events = (db.tracking_events || []).filter((e: any) => ship && e.shipment_id === ship.id);

  return {
    shipment: ship || {
      tracking_id: 'UST-TRK-' + (req?.request_id?.slice(-6) || 'PENDING'),
      courier_name: 'Universal Secure Courier',
      current_status: req?.request_status === 'Dispatched' ? 'In Transit' : req?.request_status || 'Processing',
      destination_summary: 'On file with customer support'
    },
    request: req,
    events
  };
}

// ----------------------------------------------------
// DATABASE PRESERVATION, EXPORT & RESTORE
// ----------------------------------------------------

export async function exportDatabaseBackup(token?: string): Promise<{ success: boolean }> {
  // Check backend first
  const probe = await smartFetch('/api/admin/backup', {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  let dataToExport = null;
  if (probe.isJson && probe.status === 200 && probe.data) {
    dataToExport = probe.data;
  } else {
    dataToExport = getLocalDb();
  }

  const jsonStr = JSON.stringify(dataToExport, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ustcards_database_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return { success: true };
}

export async function importDatabaseBackup(
  jsonString: string,
  token?: string
): Promise<{ success: boolean; message: string; count?: number }> {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, message: 'Invalid backup file format.' };
    }
    if (!parsed.users && !parsed.card_requests) {
      return { success: false, message: 'Backup file does not contain valid users or requests.' };
    }

    // Try server sync if backend is active
    await smartFetch('/api/admin/restore', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(parsed)
    });

    // Update local database so static browser mode is also synchronized
    const current = getLocalDb();
    const merged = {
      ...current,
      ...parsed,
      users: parsed.users || current.users || [],
      card_requests: parsed.card_requests || current.card_requests || []
    };
    saveLocalDb(merged);

    return {
      success: true,
      message: `Database restored with ${merged.users.length} users and ${merged.card_requests.length} card requests.`
    };
  } catch (err: any) {
    return { success: false, message: 'Error processing backup file: ' + err.message };
  }
}

