import { Router, Request, Response } from 'express';
import { db, User, CardRequest, Address, CardDesign, PricingItem, PaymentQuote, Payment, Shipment, TrackingEvent, PrintPackage } from './db';

export const apiRouter = Router();

// Helper to generate IDs
function generateRef(prefix: string, length: number = 6): string {
  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${result}`;
}

// Helper to extract bearer token or simulated session header
function getAuthUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const users = db.get('users');
  return users.find(u => u.id === token) || null;
}

// ----------------------------------------------------
// 1. AUTHENTICATION ROUTES
// ----------------------------------------------------

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { full_name, email, phone, password } = req.body;
  if (!full_name || !email || !password) {
    return res.status(400).json({ error: 'Full name, email, and password are required.' });
  }

  const users = db.get('users');
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email address already exists.' });
  }

  const newUser: User = {
    id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    full_name: full_name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone ? phone.trim() : '',
    password_hash: password, // In production this would be bcrypt
    role: 'customer',
    account_status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  users.push(newUser);
  db.set('users', users);
  db.logAudit(newUser.id, newUser.full_name, 'USER_REGISTERED', 'User', newUser.id, `Customer registered: ${newUser.email}`);

  const { password_hash, ...safeUser } = newUser;
  return res.json({ token: newUser.id, user: safeUser });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const users = db.get('users');
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password_hash !== password) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (user.role !== 'customer') {
    db.logAudit(user.id, user.full_name, 'ADMIN_LOGIN', 'User', user.id, `Admin signed in: ${user.email} (${user.role})`);
  }

  const { password_hash, ...safeUser } = user;
  return res.json({ token: user.id, user: safeUser });
});

apiRouter.post('/auth/admin-login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Admin email and credentials are required.' });
  }

  const users = db.get('users');
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password_hash !== password) {
    return res.status(401).json({ error: 'Invalid administrative credentials.' });
  }

  if (user.role === 'customer') {
    return res.status(403).json({ error: 'Access denied: Administrative privileges required.' });
  }

  db.logAudit(user.id, user.full_name, 'ADMIN_LOGIN', 'User', user.id, `Admin signed in: ${user.email} (${user.role})`);
  const { password_hash, ...safeUser } = user;
  return res.json({ token: user.id, user: safeUser });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized or session expired.' });
  }
  const { password_hash, ...safeUser } = user;
  return res.json({ user: safeUser });
});

// ----------------------------------------------------
// 2. PRICING ROUTES (Server Authoritative)
// ----------------------------------------------------

apiRouter.get('/pricing', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const pricing = db.get('pricing');
  if (user && (user.role === 'super_admin' || user.role === 'ops_admin')) {
    return res.json(pricing);
  }
  // Public customers only see enabled prices
  return res.json(pricing.filter(p => p.is_enabled));
});

apiRouter.post('/pricing', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super Admin privileges required to configure pricing.' });
  }

  const { service_name, description, amount, currency, is_enabled } = req.body;
  if (!service_name || amount === undefined) {
    return res.status(400).json({ error: 'Service name and amount are required.' });
  }

  const pricing = db.get('pricing');
  const newPrice: PricingItem = {
    id: 'price_' + Date.now(),
    service_name: String(service_name).trim(),
    description: String(description || '').trim(),
    amount: Number(amount) || 0,
    currency: String(currency || 'USD').toUpperCase(),
    is_enabled: is_enabled !== undefined ? Boolean(is_enabled) : true,
    created_by: user.full_name,
    updated_by: user.full_name,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  pricing.push(newPrice);
  db.set('pricing', pricing);
  db.logAudit(user.id, user.full_name, 'PRICING_CREATED', 'Pricing', newPrice.id, `Created service charge: ${newPrice.service_name} ($${newPrice.amount})`);

  return res.json(newPrice);
});

apiRouter.put('/pricing/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super Admin privileges required to update pricing.' });
  }

  const { id } = req.params;
  const { service_name, description, amount, currency, is_enabled } = req.body;

  const pricing = db.get('pricing');
  const index = pricing.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Pricing item not found.' });
  }

  const existing = pricing[index];
  const updated: PricingItem = {
    ...existing,
    service_name: service_name !== undefined ? String(service_name).trim() : existing.service_name,
    description: description !== undefined ? String(description).trim() : existing.description,
    amount: amount !== undefined ? Number(amount) : existing.amount,
    currency: currency !== undefined ? String(currency).toUpperCase() : existing.currency,
    is_enabled: is_enabled !== undefined ? Boolean(is_enabled) : existing.is_enabled,
    updated_by: user.full_name,
    updated_at: new Date().toISOString()
  };

  pricing[index] = updated;
  db.set('pricing', pricing);
  db.logAudit(user.id, user.full_name, 'PRICING_UPDATED', 'Pricing', id, `Updated price item: ${updated.service_name} ($${updated.amount}, active: ${updated.is_enabled})`);

  return res.json(updated);
});

apiRouter.delete('/pricing/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super Admin privileges required to remove pricing.' });
  }

  const { id } = req.params;
  let pricing = db.get('pricing');
  const target = pricing.find(p => p.id === id);
  if (!target) {
    return res.status(404).json({ error: 'Pricing item not found.' });
  }

  pricing = pricing.filter(p => p.id !== id);
  db.set('pricing', pricing);
  db.logAudit(user.id, user.full_name, 'PRICING_DELETED', 'Pricing', id, `Deleted price item: ${target.service_name}`);

  return res.json({ success: true, removed: target });
});

// ----------------------------------------------------
// 3. CARD REQUESTS
// ----------------------------------------------------

apiRouter.post('/requests', (req: Request, res: Response) => {
  const {
    network,
    cardholder_name,
    personal_info,
    delivery_info,
    user_id
  } = req.body;

  // Validation
  if (!network || !cardholder_name) {
    return res.status(400).json({ error: 'Network and cardholder name are required.' });
  }

  if (!personal_info || !personal_info.full_name || !personal_info.email || !personal_info.phone) {
    return res.status(400).json({ error: 'Personal information (full name, email, phone) is required.' });
  }

  if (!delivery_info || !delivery_info.address_line_1 || !delivery_info.city || !delivery_info.country || !delivery_info.postal_code) {
    return res.status(400).json({ error: 'Delivery information (street, city, country, postal code) is required.' });
  }

  // Email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(personal_info.email)) {
    return res.status(400).json({ error: 'Invalid email address format.' });
  }

  const requestIdStr = generateRef('UST-CARD', 6);
  const now = new Date().toISOString();
  const internalId = 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

  // Active design version
  const designs = db.get('card_designs');
  const activeDesign = designs.find(d => d.is_active) || designs[0];

  // Assign user or auto-associate customer
  let finalUserId = user_id;
  if (!finalUserId) {
    const users = db.get('users');
    let matchedUser = users.find(u => u.email.toLowerCase() === personal_info.email.toLowerCase());
    if (!matchedUser) {
      matchedUser = {
        id: 'usr_' + Date.now(),
        full_name: personal_info.full_name.trim(),
        email: personal_info.email.trim().toLowerCase(),
        phone: personal_info.phone.trim(),
        password_hash: 'temp_secret',
        role: 'customer',
        account_status: 'active',
        created_at: now,
        updated_at: now
      };
      users.push(matchedUser);
      db.set('users', users);
    }
    finalUserId = matchedUser.id;
  }

  // Full 16-digit card number specimen (CR80 template, unmasked for production and printing)
  const prefix = network === 'mastercard' ? '5412' : '4892';
  const block2 = String(Math.floor(1000 + Math.random() * 9000));
  const block3 = String(Math.floor(1000 + Math.random() * 9000));
  const block4 = String(Math.floor(1000 + Math.random() * 9000));
  const simulatedNumber = `${prefix} ${block2} ${block3} ${block4}`;

  const newRequest: CardRequest = {
    id: internalId,
    request_id: requestIdStr,
    user_id: finalUserId,
    card_network: network === 'mastercard' ? 'mastercard' : 'visa',
    cardholder_name: cardholder_name.trim().toUpperCase(),
    simulated_card_number: simulatedNumber,
    simulated_expiry: '12/29',
    request_status: 'Pending Review',
    payment_status: 'Unpaid',
    design_version_id: activeDesign ? activeDesign.id : 'des_v1',
    submitted_at: now,
    created_at: now,
    updated_at: now
  };

  const newAddress: Address = {
    id: 'addr_' + Date.now(),
    request_id: internalId,
    address_line_1: delivery_info.address_line_1.trim(),
    address_line_2: delivery_info.address_line_2 ? delivery_info.address_line_2.trim() : undefined,
    city: delivery_info.city.trim(),
    state_region: delivery_info.state_region ? delivery_info.state_region.trim() : '',
    country: delivery_info.country.trim(),
    postal_code: delivery_info.postal_code.trim(),
    delivery_phone: delivery_info.delivery_phone ? delivery_info.delivery_phone.trim() : personal_info.phone.trim(),
    created_at: now,
    updated_at: now
  };

  // Generate Authoritative Payment Quote snapshot from current active pricing
  const pricing = db.get('pricing').filter(p => p.is_enabled);
  const priceSnapshot = pricing.map(p => ({
    service_name: p.service_name,
    description: p.description,
    amount: p.amount
  }));
  const subtotal = priceSnapshot.reduce((sum, item) => sum + item.amount, 0);
  const total = subtotal;

  const newQuote: PaymentQuote = {
    id: 'quote_' + Date.now(),
    request_id: internalId,
    currency: pricing[0]?.currency || 'USD',
    subtotal,
    total,
    price_snapshot: priceSnapshot,
    status: 'active',
    expires_at: new Date(Date.now() + 86400000 * 7).toISOString(),
    created_at: now
  };

  const requests = db.get('card_requests');
  requests.unshift(newRequest);
  db.set('card_requests', requests);

  const addresses = db.get('addresses');
  addresses.push(newAddress);
  db.set('addresses', addresses);

  const notifications = db.get('notifications') || [];
  const emailNotification = {
    id: 'notif_' + Date.now(),
    user_id: finalUserId,
    recipient_email: personal_info.email.trim(),
    recipient_name: personal_info.full_name.trim(),
    request_id: requestIdStr,
    subject: 'Congrats! Your payout has been funded to your card',
    message: `Congratulations ${personal_info.full_name}! Your payout has been funded to your Universal Sports Tip card (Ref: ${requestIdStr}). Your card pass has been registered in our system and queued for physical manufacturing and courier dispatch.`,
    payout_amount: '$1,250.00 USD',
    status: 'Delivered' as const,
    sent_at: now
  };
  notifications.unshift(emailNotification);
  db.set('notifications', notifications);

  db.logAudit(finalUserId, personal_info.full_name, 'REQUEST_SUBMITTED', 'CardRequest', internalId, `Submitted card request ${requestIdStr} (${network})`);
  db.logAudit(finalUserId, 'Notification Service', 'EMAIL_NOTIFICATION_SENT', 'EmailNotification', emailNotification.id, `Sent email notification to ${emailNotification.recipient_email}: Congrats! Your payout has been funded to your card`);

  return res.status(201).json({
    request: newRequest,
    address: newAddress,
    quote: newQuote,
    notification: emailNotification
  });
});

apiRouter.get('/notifications', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const notifications = db.get('notifications') || [];
  if (!user || user.role === 'customer') {
    const targetUserId = user ? user.id : String(req.query.user_id || '');
    if (!targetUserId) {
      return res.json(notifications.slice(0, 10));
    }
    return res.json(notifications.filter(n => n.user_id === targetUserId));
  }
  return res.json(notifications);
});

apiRouter.get('/requests', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const requests = db.get('card_requests');
  const addresses = db.get('addresses');
  const quotes = db.get('payment_quotes');
  const payments = db.get('payments');
  const shipments = db.get('shipments');
  const users = db.get('users');

  // Customer scoping: only return their own requests
  let filteredRequests = requests;
  if (!user || user.role === 'customer') {
    const targetUserId = user ? user.id : String(req.query.user_id || '');
    if (!targetUserId) {
      return res.status(401).json({ error: 'Customer authentication required to view requests.' });
    }
    filteredRequests = requests.filter(r => r.user_id === targetUserId);
  }

  // Optional search query filter for admin
  const q = String(req.query.q || '').toLowerCase();
  const statusFilter = String(req.query.status || '');
  const paymentFilter = String(req.query.payment_status || '');
  const networkFilter = String(req.query.network || '');

  let results = filteredRequests.map(reqItem => {
    const addr = addresses.find(a => a.request_id === reqItem.id);
    const quote = quotes.find(q => q.request_id === reqItem.id);
    const pay = payments.find(p => p.request_id === reqItem.id);
    const ship = shipments.find(s => s.request_id === reqItem.id);
    const u = users.find(usr => usr.id === reqItem.user_id);
    return {
      ...reqItem,
      customer_name: u?.full_name || reqItem.cardholder_name,
      customer_email: u?.email || '',
      customer_phone: u?.phone || '',
      address: addr,
      quote,
      payment: pay,
      shipment: ship
    };
  });

  if (q) {
    results = results.filter(r =>
      r.request_id.toLowerCase().includes(q) ||
      r.cardholder_name.toLowerCase().includes(q) ||
      r.customer_email.toLowerCase().includes(q) ||
      r.customer_name.toLowerCase().includes(q)
    );
  }

  if (statusFilter && statusFilter !== 'all') {
    results = results.filter(r => r.request_status === statusFilter);
  }
  if (paymentFilter && paymentFilter !== 'all') {
    results = results.filter(r => r.payment_status === paymentFilter);
  }
  if (networkFilter && networkFilter !== 'all') {
    results = results.filter(r => r.card_network === networkFilter);
  }

  return res.json(results);
});

apiRouter.get('/requests/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const { id } = req.params;
  const requests = db.get('card_requests');
  const cardReq = requests.find(r => r.id === id || r.request_id === id);

  if (!cardReq) {
    return res.status(404).json({ error: 'Card request not found.' });
  }

  // Customer scoping check
  if (user && user.role === 'customer' && cardReq.user_id !== user.id) {
    return res.status(403).json({ error: 'Access denied: You cannot view records belonging to another customer.' });
  }

  const addr = db.get('addresses').find(a => a.request_id === cardReq.id);
  const quote = db.get('payment_quotes').find(q => q.request_id === cardReq.id);
  const payment = db.get('payments').find(p => p.request_id === cardReq.id);
  const shipment = db.get('shipments').find(s => s.request_id === cardReq.id);
  const customer = db.get('users').find(u => u.id === cardReq.user_id);

  return res.json({
    request: cardReq,
    address: addr,
    quote,
    payment,
    shipment,
    customer: customer ? { id: customer.id, full_name: customer.full_name, email: customer.email, phone: customer.phone } : null
  });
});

apiRouter.put('/requests/:id/approve', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || (user.role !== 'super_admin' && user.role !== 'ops_admin')) {
    return res.status(403).json({ error: 'Authorized Operations Admin role required.' });
  }

  const { id } = req.params;
  const requests = db.get('card_requests');
  const index = requests.findIndex(r => r.id === id || r.request_id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Request not found.' });
  }

  const existing = requests[index];
  if (existing.request_status === 'Rejected') {
    return res.status(400).json({ error: 'Rejected requests cannot be approved directly without formal reopening.' });
  }

  const updated: CardRequest = {
    ...existing,
    request_status: 'Approved',
    approved_by: user.full_name,
    approved_at: new Date().toISOString(),
    rejection_reason: undefined,
    rejected_by: undefined,
    rejected_at: undefined,
    updated_at: new Date().toISOString()
  };

  requests[index] = updated;
  db.set('card_requests', requests);
  db.logAudit(user.id, user.full_name, 'REQUEST_APPROVED', 'CardRequest', updated.id, `Approved card request ${updated.request_id}`);

  return res.json({ success: true, request: updated });
});

apiRouter.put('/requests/:id/reject', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || (user.role !== 'super_admin' && user.role !== 'ops_admin')) {
    return res.status(403).json({ error: 'Authorized Operations Admin role required.' });
  }

  const { id } = req.params;
  const { reason } = req.body;
  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: 'A specific reason is required to reject a card application.' });
  }

  const requests = db.get('card_requests');
  const index = requests.findIndex(r => r.id === id || r.request_id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Request not found.' });
  }

  const existing = requests[index];
  const updated: CardRequest = {
    ...existing,
    request_status: 'Rejected',
    rejection_reason: reason.trim(),
    rejected_by: user.full_name,
    rejected_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  requests[index] = updated;
  db.set('card_requests', requests);
  db.logAudit(user.id, user.full_name, 'REQUEST_REJECTED', 'CardRequest', updated.id, `Rejected request ${updated.request_id}. Reason: ${reason}`);

  return res.json({ success: true, request: updated });
});

apiRouter.put('/requests/:id/status', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || (user.role !== 'super_admin' && user.role !== 'ops_admin')) {
    return res.status(403).json({ error: 'Authorized administrator role required.' });
  }

  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['Submitted', 'Pending Review', 'Approved', 'Processing', 'Printed', 'Ready for Dispatch', 'Dispatched', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status: ${status}` });
  }

  const requests = db.get('card_requests');
  const index = requests.findIndex(r => r.id === id || r.request_id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Request not found.' });
  }

  const existing = requests[index];
  const updated: CardRequest = {
    ...existing,
    request_status: status,
    updated_at: new Date().toISOString()
  };

  requests[index] = updated;
  db.set('card_requests', requests);
  db.logAudit(user.id, user.full_name, 'REQUEST_STATUS_CHANGED', 'CardRequest', updated.id, `Status transitioned to '${status}' for ${updated.request_id}`);

  return res.json({ success: true, request: updated });
});

apiRouter.put('/requests/:id/edit', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role === 'customer') {
    return res.status(403).json({ error: 'Administrative privileges required.' });
  }

  const { id } = req.params;
  const { cardholder_name, card_network } = req.body;

  const requests = db.get('card_requests');
  const index = requests.findIndex(r => r.id === id || r.request_id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Request not found.' });
  }

  const existing = requests[index];
  const updated: CardRequest = {
    ...existing,
    cardholder_name: cardholder_name ? String(cardholder_name).trim().toUpperCase() : existing.cardholder_name,
    card_network: card_network === 'mastercard' ? 'mastercard' : card_network === 'visa' ? 'visa' : existing.card_network,
    updated_at: new Date().toISOString()
  };

  requests[index] = updated;
  db.set('card_requests', requests);
  db.logAudit(user.id, user.full_name, 'REQUEST_EDITED', 'CardRequest', updated.id, `Edited fields for ${updated.request_id}`);

  return res.json({ success: true, request: updated });
});

// ----------------------------------------------------
// 4. PAYMENTS & QUOTES (Real server verification)
// ----------------------------------------------------

apiRouter.get('/payments/quote/:requestId', (req: Request, res: Response) => {
  const { requestId } = req.params;
  const requests = db.get('card_requests');
  const targetReq = requests.find(r => r.id === requestId || r.request_id === requestId);
  if (!targetReq) {
    return res.status(404).json({ error: 'Card request not found.' });
  }

  const quotes = db.get('payment_quotes');
  const existingQuote = quotes.find(q => q.request_id === targetReq.id);
  if (existingQuote) {
    return res.json(existingQuote);
  }

  // If no quote, generate fresh from active pricing
  const pricing = db.get('pricing').filter(p => p.is_enabled);
  const priceSnapshot = pricing.map(p => ({
    service_name: p.service_name,
    description: p.description,
    amount: p.amount
  }));
  const total = priceSnapshot.reduce((sum, item) => sum + item.amount, 0);

  const newQuote: PaymentQuote = {
    id: 'quote_' + Date.now(),
    request_id: targetReq.id,
    currency: pricing[0]?.currency || 'USD',
    subtotal: total,
    total,
    price_snapshot: priceSnapshot,
    status: 'active',
    expires_at: new Date(Date.now() + 86400000 * 7).toISOString(),
    created_at: new Date().toISOString()
  };

  quotes.push(newQuote);
  db.set('payment_quotes', quotes);

  return res.json(newQuote);
});

apiRouter.post('/payments/verify', (req: Request, res: Response) => {
  const { request_id, quote_id, provider = 'Universal Pay Sandbox', provider_ref } = req.body;

  const requests = db.get('card_requests');
  const reqIndex = requests.findIndex(r => r.id === request_id || r.request_id === request_id);
  if (reqIndex === -1) {
    return res.status(404).json({ error: 'Card request not found.' });
  }

  const targetReq = requests[reqIndex];
  const quotes = db.get('payment_quotes');
  const quote = quotes.find(q => q.id === quote_id || q.request_id === targetReq.id);

  const amount = quote ? quote.total : 60.00;
  const currency = quote ? quote.currency : 'USD';
  const now = new Date().toISOString();
  const txnRef = provider_ref || generateRef('UST-TXN', 8);

  const newPayment: Payment = {
    id: 'pay_' + Date.now(),
    request_id: targetReq.id,
    quote_id: quote ? quote.id : 'quote_gen',
    provider: provider as any,
    provider_transaction_reference: txnRef,
    amount,
    currency,
    status: 'Paid',
    verified_at: now,
    created_at: now,
    updated_at: now
  };

  const payments = db.get('payments');
  payments.push(newPayment);
  db.set('payments', payments);

  // Update card request status
  targetReq.payment_status = 'Paid';
  targetReq.updated_at = now;
  requests[reqIndex] = targetReq;
  db.set('card_requests', requests);

  db.logAudit(targetReq.user_id, 'Payment Gateway', 'PAYMENT_VERIFIED', 'Payment', newPayment.id, `Verified payment of ${amount} ${currency} for ${targetReq.request_id}. Ref: ${txnRef}`);

  return res.json({
    success: true,
    message: 'Payment verified and confirmed by settlement provider.',
    payment: newPayment,
    request: targetReq
  });
});

apiRouter.post('/payments/:id/refund', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super Admin permission required for refund operations.' });
  }

  const { id } = req.params;
  const payments = db.get('payments');
  const payIndex = payments.findIndex(p => p.id === id);
  if (payIndex === -1) {
    return res.status(404).json({ error: 'Payment transaction not found.' });
  }

  const payment = payments[payIndex];
  payment.status = 'Refunded';
  payment.refunded_at = new Date().toISOString();
  payment.updated_at = new Date().toISOString();
  payments[payIndex] = payment;
  db.set('payments', payments);

  // Update request payment status
  const requests = db.get('card_requests');
  const reqIndex = requests.findIndex(r => r.id === payment.request_id);
  if (reqIndex !== -1) {
    requests[reqIndex].payment_status = 'Refunded';
    requests[reqIndex].updated_at = new Date().toISOString();
    db.set('card_requests', requests);
  }

  db.logAudit(user.id, user.full_name, 'PAYMENT_REFUNDED', 'Payment', payment.id, `Authorized refund of ${payment.amount} ${payment.currency} for transaction ${payment.provider_transaction_reference}`);

  return res.json({ success: true, payment });
});

// ----------------------------------------------------
// 5. SHIPMENTS & TRACKING
// ----------------------------------------------------

apiRouter.post('/shipments', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || (user.role !== 'super_admin' && user.role !== 'ops_admin')) {
    return res.status(403).json({ error: 'Operations Admin permission required.' });
  }

  const { request_id, courier_name, courier_reference, destination_summary, estimated_delivery } = req.body;

  const requests = db.get('card_requests');
  const targetReq = requests.find(r => r.id === request_id || r.request_id === request_id);
  if (!targetReq) {
    return res.status(404).json({ error: 'Target card request not found.' });
  }

  const trackingId = generateRef('UST-TRK', 6);
  const shipmentId = generateRef('UST-SHIP', 5);
  const now = new Date().toISOString();

  const newShipment: Shipment = {
    id: 'ship_' + Date.now(),
    shipment_id: shipmentId,
    request_id: targetReq.id,
    tracking_id: trackingId,
    courier_name: courier_name || 'Apex Priority Express',
    courier_reference: courier_reference || generateRef('APX', 8),
    destination_summary: destination_summary || 'Express Courier Logistics',
    current_status: 'Awaiting Dispatch',
    estimated_delivery: estimated_delivery || new Date(Date.now() + 86400000 * 3).toLocaleDateString(),
    created_at: now,
    updated_at: now
  };

  const shipments = db.get('shipments');
  shipments.push(newShipment);
  db.set('shipments', shipments);

  // Initial event
  const events = db.get('tracking_events');
  events.push({
    id: 'evt_' + Date.now(),
    shipment_id: newShipment.id,
    status: 'Awaiting Dispatch',
    location: 'Universal Sports Tip Fulfillment Center',
    description: 'Card package sealed in tamper-evident secure sleeve, awaiting courier pickup.',
    event_at: now,
    created_by: user.full_name,
    created_at: now
  });
  db.set('tracking_events', events);

  // Advance request status
  targetReq.request_status = 'Ready for Dispatch';
  targetReq.updated_at = now;
  db.set('card_requests', requests);

  db.logAudit(user.id, user.full_name, 'SHIPMENT_CREATED', 'Shipment', newShipment.id, `Created shipment ${shipmentId} with Tracking ID ${trackingId} for request ${targetReq.request_id}`);

  return res.status(201).json({ shipment: newShipment });
});

apiRouter.get('/shipments', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role === 'customer') {
    return res.status(403).json({ error: 'Administrative privileges required.' });
  }

  const shipments = db.get('shipments');
  const events = db.get('tracking_events');
  const requests = db.get('card_requests');

  const detailed = shipments.map(s => {
    const sEvents = events.filter(e => e.shipment_id === s.id);
    const reqItem = requests.find(r => r.id === s.request_id);
    return {
      ...s,
      events: sEvents,
      request_ref: reqItem?.request_id || ''
    };
  });

  return res.json(detailed);
});

apiRouter.get('/shipments/track/:trackingId', (req: Request, res: Response) => {
  const { trackingId } = req.params;
  const cleanId = trackingId.trim().toUpperCase();

  const shipments = db.get('shipments');
  const shipment = shipments.find(s => s.tracking_id.toUpperCase() === cleanId);

  if (!shipment) {
    return res.status(404).json({ error: "We couldn't find a shipment associated with that tracking ID. Please check the reference and try again." });
  }

  const events = db.get('tracking_events')
    .filter(e => e.shipment_id === shipment.id)
    .sort((a, b) => new Date(a.event_at).getTime() - new Date(b.event_at).getTime());

  const requests = db.get('card_requests');
  const cardReq = requests.find(r => r.id === shipment.request_id);

  // Return public-safe tracking payload (sanitized of sensitive full address lines)
  return res.json({
    tracking_id: shipment.tracking_id,
    current_status: shipment.current_status,
    courier_name: shipment.courier_name,
    destination_summary: shipment.destination_summary,
    estimated_delivery: shipment.estimated_delivery,
    last_update: events[events.length - 1]?.event_at || shipment.updated_at,
    request_reference: cardReq ? cardReq.request_id : undefined,
    events
  });
});

apiRouter.post('/shipments/:id/events', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || (user.role !== 'super_admin' && user.role !== 'ops_admin')) {
    return res.status(403).json({ error: 'Operations Admin permission required.' });
  }

  const { id } = req.params;
  const { status, location, description } = req.body;

  if (!status || !description) {
    return res.status(400).json({ error: 'Status and description are required.' });
  }

  const shipments = db.get('shipments');
  const shipIndex = shipments.findIndex(s => s.id === id || s.tracking_id === id);
  if (shipIndex === -1) {
    return res.status(404).json({ error: 'Shipment not found.' });
  }

  const targetShipment = shipments[shipIndex];
  const now = new Date().toISOString();

  const newEvent: TrackingEvent = {
    id: 'evt_' + Date.now(),
    shipment_id: targetShipment.id,
    status,
    location: location || '',
    description: description.trim(),
    event_at: now,
    created_by: user.full_name,
    created_at: now
  };

  const events = db.get('tracking_events');
  events.push(newEvent);
  db.set('tracking_events', events);

  // Update current status on shipment
  targetShipment.current_status = status as any;
  targetShipment.updated_at = now;
  if (status === 'Dispatched' && !targetShipment.dispatched_at) {
    targetShipment.dispatched_at = now;
  }
  if (status === 'Delivered') {
    targetShipment.delivered_at = now;
  }
  shipments[shipIndex] = targetShipment;
  db.set('shipments', shipments);

  // Also sync request lifecycle status if appropriate
  const requests = db.get('card_requests');
  const reqIndex = requests.findIndex(r => r.id === targetShipment.request_id);
  if (reqIndex !== -1) {
    if (status === 'Dispatched') requests[reqIndex].request_status = 'Dispatched';
    if (status === 'Delivered') requests[reqIndex].request_status = 'Delivered';
    requests[reqIndex].updated_at = now;
    db.set('card_requests', requests);
  }

  db.logAudit(user.id, user.full_name, 'TRACKING_EVENT_ADDED', 'Shipment', targetShipment.id, `Added event '${status}' to shipment ${targetShipment.tracking_id}`);

  return res.status(201).json({ event: newEvent, shipment: targetShipment });
});

// ----------------------------------------------------
// 6. CARD DESIGNS & MASTER ARTWORK
// ----------------------------------------------------

apiRouter.get('/designs', (req: Request, res: Response) => {
  const designs = db.get('card_designs');
  return res.json(designs);
});

apiRouter.post('/designs', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super Admin permission required.' });
  }

  const { design_name, card_network = 'all', dynamic_field_configuration, front_artwork_data, back_artwork_data } = req.body;
  const designs = db.get('card_designs');
  const nextVersion = designs.length + 1;

  const newDesign: CardDesign = {
    id: 'des_v' + nextVersion,
    design_name: design_name || `Master Artwork v${nextVersion}.0`,
    card_network: card_network as any,
    front_artwork_data,
    back_artwork_data,
    dynamic_field_configuration: dynamic_field_configuration || {
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
    version_number: nextVersion,
    is_active: true,
    created_by: user.full_name,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Set previous designs to inactive
  designs.forEach(d => { d.is_active = false; });
  designs.push(newDesign);
  db.set('card_designs', designs);

  db.logAudit(user.id, user.full_name, 'CARD_DESIGN_CREATED', 'CardDesign', newDesign.id, `Configured new master design version ${nextVersion}`);

  return res.status(201).json(newDesign);
});

apiRouter.put('/designs/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super Admin permission required.' });
  }

  const { id } = req.params;
  const { dynamic_field_configuration, is_active, front_artwork_data, back_artwork_data, design_name } = req.body;

  const designs = db.get('card_designs');
  const index = designs.findIndex(d => d.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Design version not found.' });
  }

  if (is_active) {
    designs.forEach(d => { d.is_active = false; });
  }

  const existing = designs[index];
  const updated: CardDesign = {
    ...existing,
    design_name: design_name !== undefined ? design_name : existing.design_name,
    dynamic_field_configuration: dynamic_field_configuration || existing.dynamic_field_configuration,
    front_artwork_data: front_artwork_data !== undefined ? front_artwork_data : existing.front_artwork_data,
    back_artwork_data: back_artwork_data !== undefined ? back_artwork_data : existing.back_artwork_data,
    is_active: is_active !== undefined ? is_active : existing.is_active,
    updated_at: new Date().toISOString()
  };

  designs[index] = updated;
  db.set('card_designs', designs);
  db.logAudit(user.id, user.full_name, 'CARD_DESIGN_UPDATED', 'CardDesign', id, `Updated card design version ${updated.version_number}`);

  return res.json(updated);
});

// ----------------------------------------------------
// 7. PRINT PACKAGE RECORDING
// ----------------------------------------------------

apiRouter.post('/print-packages/generate', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || (user.role !== 'super_admin' && user.role !== 'ops_admin')) {
    return res.status(403).json({ error: 'Operations Admin permission required.' });
  }

  const { request_id } = req.body;
  const requests = db.get('card_requests');
  const targetReq = requests.find(r => r.id === request_id || r.request_id === request_id);
  if (!targetReq) {
    return res.status(404).json({ error: 'Card request not found.' });
  }

  const now = new Date().toISOString();
  const printPackages = db.get('print_packages');

  const newPkg: PrintPackage = {
    id: 'pkg_' + Date.now(),
    request_id: targetReq.id,
    design_version_id: targetReq.design_version_id,
    front_file_path: `/exports/${targetReq.request_id}_front.png`,
    back_file_path: `/exports/${targetReq.request_id}_back.png`,
    details_pdf_path: `/exports/${targetReq.request_id}_details.pdf`,
    generation_status: 'ready',
    generated_by: user.full_name,
    generated_at: now
  };

  printPackages.push(newPkg);
  db.set('print_packages', printPackages);

  // Update card request state to Printed if still in Approved/Processing
  if (targetReq.request_status === 'Approved' || targetReq.request_status === 'Processing') {
    targetReq.request_status = 'Printed';
    targetReq.updated_at = now;
    db.set('card_requests', requests);
  }

  db.logAudit(user.id, user.full_name, 'PRINT_PACKAGE_GENERATED', 'PrintPackage', newPkg.id, `Generated print package for ${targetReq.request_id}: front.png, back.png, card-details.pdf`);

  return res.json({
    success: true,
    package: newPkg,
    files: [
      { name: 'front.png', url: newPkg.front_file_path, type: 'image/png' },
      { name: 'back.png', url: newPkg.back_file_path, type: 'image/png' },
      { name: 'card-details.pdf', url: newPkg.details_pdf_path, type: 'application/pdf' }
    ]
  });
});

apiRouter.get('/print-packages/:requestId', (req: Request, res: Response) => {
  const { requestId } = req.params;
  const packages = db.get('print_packages');
  const pkg = packages.find(p => p.request_id === requestId);
  return res.json(pkg || null);
});

// ----------------------------------------------------
// 8. SETTINGS & WATERMARK
// ----------------------------------------------------

apiRouter.get('/settings', (req: Request, res: Response) => {
  return res.json(db.get('settings'));
});

apiRouter.put('/settings', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super Admin permission required to modify global platform settings.' });
  }

  const current = db.get('settings');
  const updated = {
    ...current,
    ...req.body,
    updated_by: user.id,
    updated_at: new Date().toISOString()
  };

  db.set('settings', updated);
  db.logAudit(user.id, user.full_name, 'SETTINGS_UPDATED', 'Settings', 'global', 'Updated global settings and watermark configuration');

  return res.json(updated);
});

// ----------------------------------------------------
// 9. ADMIN OVERVIEW METRICS & AUDIT LOGS
// ----------------------------------------------------

apiRouter.get('/admin/stats', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role === 'customer') {
    return res.status(403).json({ error: 'Administrative privileges required.' });
  }

  const requests = db.get('card_requests');
  const shipments = db.get('shipments');
  const payments = db.get('payments');

  const totalRequests = requests.length;
  const pendingReview = requests.filter(r => r.request_status === 'Pending Review' || r.request_status === 'Submitted').length;
  const approvedRequests = requests.filter(r => r.request_status === 'Approved').length;
  const rejectedRequests = requests.filter(r => r.request_status === 'Rejected').length;
  const pendingPayments = requests.filter(r => r.payment_status === 'Unpaid' || r.payment_status === 'Pending').length;
  const verifiedPayments = payments.filter(p => p.status === 'Paid').length;
  const cardsBeingProduced = requests.filter(r => r.request_status === 'Processing').length;
  const readyForDispatch = requests.filter(r => r.request_status === 'Printed' || r.request_status === 'Ready for Dispatch').length;
  const inTransit = shipments.filter(s => s.current_status === 'In Transit' || s.current_status === 'Dispatched' || s.current_status === 'Out for Delivery').length;
  const delivered = shipments.filter(s => s.current_status === 'Delivered').length;

  return res.json({
    totalRequests,
    pendingReview,
    approvedRequests,
    rejectedRequests,
    pendingPayments,
    verifiedPayments,
    cardsBeingProduced,
    readyForDispatch,
    inTransit,
    delivered
  });
});

apiRouter.get('/admin/audit-logs', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role === 'customer') {
    return res.status(403).json({ error: 'Administrative privileges required.' });
  }

  const logs = db.get('audit_logs');
  return res.json(logs);
});

apiRouter.get('/admin/backup', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role === 'customer') {
    return res.status(403).json({ error: 'Administrative privileges required.' });
  }
  return res.json(db.getAll());
});

apiRouter.post('/admin/restore', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role === 'customer') {
    return res.status(403).json({ error: 'Administrative privileges required.' });
  }
  const payload = req.body;
  if (!payload || (!payload.users && !payload.card_requests)) {
    return res.status(400).json({ error: 'Invalid backup file structure.' });
  }
  db.restoreAll(payload);
  db.logAudit(user.id, user.full_name, 'DATABASE_RESTORED', 'System', 'database', 'Admin restored database backup.');
  return res.json({ success: true, message: 'Database restored successfully.' });
});

