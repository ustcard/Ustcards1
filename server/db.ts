import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  password_hash: string;
  role: 'super_admin' | 'ops_admin' | 'support_agent' | 'customer';
  account_status: 'active' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface CardRequest {
  id: string;
  request_id: string; // e.g. UST-CARD-000124
  user_id: string;
  card_network: 'visa' | 'mastercard';
  cardholder_name: string;
  simulated_card_number: string;
  simulated_expiry: string;
  request_status: 'Draft' | 'Submitted' | 'Pending Review' | 'Approved' | 'Rejected' | 'Processing' | 'Printed' | 'Ready for Dispatch' | 'Dispatched' | 'Delivered' | 'Cancelled';
  payment_status: 'Unpaid' | 'Pending' | 'Paid' | 'Failed' | 'Cancelled' | 'Refund Pending' | 'Refunded';
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

export interface CardDesign {
  id: string;
  design_name: string;
  card_network: 'visa' | 'mastercard' | 'all';
  front_artwork_data?: string;
  back_artwork_data?: string;
  dynamic_field_configuration: {
    name_x: number;
    name_y: number;
    name_font_size: number;
    name_color: string;
    number_x: number;
    number_y: number;
    expiry_x: number;
    expiry_y: number;
    chip_x: number;
    chip_y: number;
    logo_x: number;
    logo_y: number;
  };
  version_number: number;
  is_active: boolean;
  created_by: string;
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

export interface PaymentQuote {
  id: string;
  request_id: string;
  currency: string;
  subtotal: number;
  total: number;
  price_snapshot: Array<{ service_name: string; description: string; amount: number }>;
  status: 'active' | 'expired' | 'completed';
  expires_at: string;
  created_at: string;
}

export interface Payment {
  id: string;
  request_id: string;
  quote_id: string;
  provider: 'Universal Pay Sandbox' | 'Stripe' | 'Wire';
  provider_transaction_reference: string;
  amount: number;
  currency: string;
  status: 'Unpaid' | 'Pending' | 'Paid' | 'Failed' | 'Cancelled' | 'Refund Pending' | 'Refunded';
  verified_at?: string;
  refunded_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Shipment {
  id: string;
  shipment_id: string;
  request_id: string;
  tracking_id: string; // e.g. UST-TRK-8F42K9
  courier_name: string;
  courier_reference: string;
  destination_summary: string;
  current_status: 'Request Received' | 'Card Approved' | 'Card Processing' | 'Card Printed' | 'Awaiting Dispatch' | 'Dispatched' | 'In Transit' | 'Arrived at Local Facility' | 'Out for Delivery' | 'Delivered' | 'On Hold' | 'Delivery Attempted' | 'Exception' | 'Returned to Sender' | 'Cancelled';
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

export interface PrintPackage {
  id: string;
  request_id: string;
  design_version_id: string;
  front_file_path: string;
  back_file_path: string;
  details_pdf_path: string;
  generation_status: 'ready' | 'processing' | 'failed';
  generated_by: string;
  generated_at: string;
}

export interface AuditLog {
  id: string;
  actor_user_id: string;
  actor_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  summary: string;
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

export interface EmailNotification {
  id: string;
  user_id: string;
  recipient_email: string;
  recipient_name: string;
  request_id: string;
  subject: string;
  message: string;
  payout_amount?: string;
  status: 'Sent' | 'Delivered';
  sent_at: string;
}

interface DatabaseSchema {
  users: User[];
  card_requests: CardRequest[];
  addresses: Address[];
  card_designs: CardDesign[];
  pricing: PricingItem[];
  payment_quotes: PaymentQuote[];
  payments: Payment[];
  shipments: Shipment[];
  tracking_events: TrackingEvent[];
  print_packages: PrintPackage[];
  audit_logs: AuditLog[];
  notifications: EmailNotification[];
  settings: Settings;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

function initializeSeedData(): DatabaseSchema {
  const now = new Date().toISOString();
  return {
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
    users: [
      {
        id: 'usr_admin_1',
        full_name: 'Universal Admin',
        email: 'admin@universalsportstip.com',
        phone: '+1 800-555-0199',
        password_hash: 'admin12345',
        role: 'super_admin',
        account_status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        id: 'usr_demo_customer',
        full_name: 'Alex Mercer',
        email: 'alex.mercer@example.com',
        phone: '+1 555-234-5678',
        password_hash: 'customer123',
        role: 'customer',
        account_status: 'active',
        created_at: now,
        updated_at: now
      }
    ],
    card_requests: [
      {
        id: 'req_seed_1',
        request_id: 'UST-CARD-000101',
        user_id: 'usr_demo_customer',
        card_network: 'visa',
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
    payment_quotes: [
      {
        id: 'quote_seed_1',
        request_id: 'req_seed_1',
        currency: 'USD',
        subtotal: 75.00,
        total: 75.00,
        price_snapshot: [
          { service_name: 'Card Production', description: 'Card manufacturing', amount: 45.00 },
          { service_name: 'Delivery', description: 'Tracked delivery', amount: 15.00 },
          { service_name: 'Maintenance', description: 'Network maintenance', amount: 10.00 },
          { service_name: 'Tracking', description: 'SMS updates', amount: 5.00 }
        ],
        status: 'completed',
        expires_at: new Date(Date.now() + 86400000 * 7).toISOString(),
        created_at: now
      }
    ],
    payments: [
      {
        id: 'pay_seed_1',
        request_id: 'req_seed_1',
        quote_id: 'quote_seed_1',
        provider: 'Universal Pay Sandbox',
        provider_transaction_reference: 'UST-TXN-984210A',
        amount: 75.00,
        currency: 'USD',
        status: 'Paid',
        verified_at: new Date(Date.now() - 86400000 * 2).toISOString(),
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
    print_packages: [],
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
    ],
    settings: {
      id: 'settings_1',
      platform_name: 'Universal Sports Tip',
      watermark_enabled: true,
      watermark_text: 'UNIVERSAL SPORTS TIP - SPECIMEN',
      watermark_opacity: 0.22,
      watermark_size: 13,
      watermark_position: 'diagonal',
      support_email: 'support@universalsportstip.com',
      support_phone: '+1 800-555-0199',
      default_currency: 'USD',
      maintenance_mode: false,
      updated_by: 'usr_admin_1',
      updated_at: now
    }
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
        if (!this.data.notifications) {
          this.data.notifications = [];
        }
        if (this.data.card_requests) {
          let updated = false;
          this.data.card_requests.forEach(r => {
            if (r.simulated_card_number && (r.simulated_card_number.includes('•') || r.simulated_card_number.includes('*'))) {
              const prefix = r.card_network === 'mastercard' ? '5412' : '4892';
              const digits = r.simulated_card_number.replace(/\D/g, '');
              const last4 = digits.length >= 4 ? digits.slice(-4) : (r.card_network === 'mastercard' ? '8201' : '9210');
              r.simulated_card_number = `${prefix} 8492 1039 ${last4}`;
              updated = true;
            }
          });
          if (updated) {
            this.persist();
          }
        }
      } catch (err) {
        console.error('Failed to parse database file, restoring seeds:', err);
        this.data = initializeSeedData();
        this.persist();
      }
    } else {
      this.data = initializeSeedData();
      this.persist();
    }
  }

  private persist() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public get<K extends keyof DatabaseSchema>(table: K): DatabaseSchema[K] {
    return this.data[table];
  }

  public set<K extends keyof DatabaseSchema>(table: K, value: DatabaseSchema[K]) {
    this.data[table] = value;
    this.persist();
  }

  public logAudit(actorUserId: string, actorName: string, action: string, entityType: string, entityId: string, summary: string) {
    const log: AuditLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      actor_user_id: actorUserId,
      actor_name: actorName,
      action,
      entity_type: entityType,
      entity_id: entityId,
      summary,
      created_at: new Date().toISOString()
    };
    this.data.audit_logs.unshift(log);
    if (this.data.audit_logs.length > 500) {
      this.data.audit_logs = this.data.audit_logs.slice(0, 500);
    }
    this.persist();
    return log;
  }
}

export const db = new Database();
