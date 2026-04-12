// Returns a fully self-contained HTML string for the custom API docs page
function buildApiDocsHtml(baseUrl = '', env = 'development') {

  const badge = (method) => {
    const colors = {
      GET:    'background:rgba(34,197,94,0.15);color:#22c55e',
      POST:   'background:rgba(96,165,250,0.15);color:#60a5fa',
      PATCH:  'background:rgba(250,204,21,0.15);color:#facc15',
      PUT:    'background:rgba(167,139,250,0.15);color:#a78bfa',
      DELETE: 'background:rgba(248,113,113,0.15);color:#f87171',
    };
    return `<span style="font-family:monospace;font-size:11px;font-weight:700;padding:3px 8px;border-radius:5px;min-width:52px;display:inline-block;text-align:center;${colors[method]||''}">${method}</span>`;
  };

  const ep = (method, path, summary, needsAuth, needsSA, params = [], body = '', response = '') => {
    const pid = Math.random().toString(36).slice(2);
    const paramHtml = params.length ? `
      <div style="margin-bottom:12px">
        <div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">Parameters</div>
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead><tr style="border-bottom:1px solid #1e293b">
            <th style="text-align:left;padding:5px 8px;color:#64748b">Name</th>
            <th style="text-align:left;padding:5px 8px;color:#64748b">Type</th>
            <th style="text-align:left;padding:5px 8px;color:#64748b">Req</th>
            <th style="text-align:left;padding:5px 8px;color:#64748b">Description</th>
          </tr></thead>
          <tbody>
            ${params.map(([n,t,r,d]) => `<tr style="border-bottom:1px solid #0f172a">
              <td style="padding:5px 8px"><code style="color:#22d3ee;font-size:11px">${n}</code></td>
              <td style="padding:5px 8px"><span style="background:rgba(34,211,238,.1);color:#22d3ee;font-size:10px;padding:1px 5px;border-radius:4px;font-family:monospace">${t}</span></td>
              <td style="padding:5px 8px;color:#f87171;font-size:10px">${r ? '✓' : ''}</td>
              <td style="padding:5px 8px;color:#94a3b8">${d}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>` : '';

    const bodyHtml = body ? `
      <div style="margin-bottom:10px">
        <div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Request Body</div>
        <pre style="background:#0d1117;border:1px solid #21262d;border-radius:6px;padding:10px;font-size:11px;color:#e6edf3;overflow-x:auto;white-space:pre-wrap">${body.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
      </div>` : '';

    const responseHtml = response ? `
      <div>
        <div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Response</div>
        <pre style="background:#0d1117;border:1px solid #21262d;border-radius:6px;padding:10px;font-size:11px;color:#e6edf3;overflow-x:auto;white-space:pre-wrap">${response.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
      </div>` : '';

    const authBadge = needsAuth ? `<span style="font-size:10px;padding:2px 7px;border-radius:99px;font-weight:600;background:rgba(167,139,250,.15);color:#a78bfa;margin-left:6px">🔒 Auth</span>` : '';
    const saBadge = needsSA ? `<span style="font-size:10px;padding:2px 7px;border-radius:99px;font-weight:600;background:rgba(249,115,22,.15);color:#f97316;margin-left:6px">👑 SuperAdmin</span>` : '';

    return `
    <div style="background:#1e293b;border:1px solid #334155;border-radius:10px;margin-bottom:8px;overflow:hidden">
      <div onclick="(function(el){var b=document.getElementById('ep-${pid}');var ch=document.getElementById('ch-${pid}');b.style.display=b.style.display==='block'?'none':'block';ch.style.transform=b.style.display==='block'?'rotate(90deg)':'rotate(0deg)'})(this)"
           style="display:flex;align-items:center;gap:10px;padding:12px 16px;cursor:pointer">
        ${badge(method)}
        <code style="font-size:13px;color:#e2e8f0;flex:1">${path}</code>
        <span style="font-size:12px;color:#64748b">${summary}</span>
        ${authBadge}${saBadge}
        <span id="ch-${pid}" style="color:#475569;font-size:11px;transition:transform .2s;margin-left:8px">▶</span>
      </div>
      <div id="ep-${pid}" style="display:none;border-top:1px solid #334155;padding:16px">
        ${paramHtml}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div>${bodyHtml}</div>
          <div>${responseHtml}</div>
        </div>
      </div>
    </div>`;
  };

  const section = (id, icon, color, title, desc, content) => `
  <div id="${id}" style="margin-bottom:48px">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid #1e293b">
      <div style="width:36px;height:36px;border-radius:8px;background:${color};display:flex;align-items:center;justify-content:center;font-size:18px">${icon}</div>
      <div>
        <div style="font-size:20px;font-weight:700">${title}</div>
        <div style="color:#64748b;font-size:13px;margin-top:2px">${desc}</div>
      </div>
    </div>
    ${content}
  </div>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Bengal Creations — API Docs</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0f172a;color:#e2e8f0;font-family:'Inter',system-ui,sans-serif;min-height:100vh}
a{color:inherit;text-decoration:none}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:#334155;border-radius:99px}
.sidebar-link{display:flex;align-items:center;gap:9px;padding:8px 18px;font-size:13px;color:#94a3b8;cursor:pointer;border-left:2px solid transparent;transition:all .15s}
.sidebar-link:hover{color:#e2e8f0;background:rgba(255,255,255,.03)}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
</style>
</head>
<body>

<!-- TOPBAR -->
<div style="display:flex;align-items:center;justify-content:space-between;padding:0 28px;height:58px;background:#1e293b;border-bottom:1px solid #334155;position:sticky;top:0;z-index:100">
  <div style="display:flex;align-items:center;gap:12px">
    <div style="width:32px;height:32px;background:#f97316;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:#fff">BC</div>
    <span style="font-weight:700;font-size:15px">Bengal Creations API</span>
    <span style="background:rgba(249,115,22,.12);color:#f97316;font-size:10px;padding:2px 8px;border-radius:99px;font-weight:700">v1.0</span>
  </div>
  <div style="display:flex;align-items:center;gap:12px">
    <span id="env-badge" style="background:rgba(34,197,94,.12);color:#22c55e;font-size:11px;padding:2px 10px;border-radius:99px;font-weight:600">${env}</span>
    <span style="font-size:12px;color:#64748b">API Status</span>
    <div style="width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 3px rgba(34,197,94,.2);animation:pulse 2s infinite"></div>
  </div>
</div>

<div style="display:flex;min-height:calc(100vh - 58px)">

<!-- SIDEBAR -->
<nav style="width:252px;flex-shrink:0;background:#1e293b;border-right:1px solid #334155;overflow-y:auto;position:sticky;top:58px;height:calc(100vh - 58px);padding:12px 0">
  <div style="font-size:10px;font-weight:700;color:#475569;letter-spacing:.08em;text-transform:uppercase;padding:8px 18px 4px">Overview</div>
  <a class="sidebar-link" onclick="jump('overview')">🏠 Introduction</a>

  <div style="font-size:10px;font-weight:700;color:#475569;letter-spacing:.08em;text-transform:uppercase;padding:12px 18px 4px">Authentication</div>
  <a class="sidebar-link" onclick="jump('auth')">🔐 Customer Auth</a>
  <a class="sidebar-link" onclick="jump('sa-auth')">👑 Super Admin Auth</a>

  <div style="font-size:10px;font-weight:700;color:#475569;letter-spacing:.08em;text-transform:uppercase;padding:12px 18px 4px">Super Admin</div>
  <a class="sidebar-link" onclick="jump('sa-dashboard')">📊 Dashboard</a>
  <a class="sidebar-link" onclick="jump('sa-vendors')">🏪 Vendors</a>
  <a class="sidebar-link" onclick="jump('sa-customers')">👥 Customers</a>
  <a class="sidebar-link" onclick="jump('sa-orders')">📦 Orders &amp; Charges</a>
  <a class="sidebar-link" onclick="jump('sa-refunds')">💸 Refunds</a>
  <a class="sidebar-link" onclick="jump('sa-coupons')">🎟️ Coupons</a>
  <a class="sidebar-link" onclick="jump('sa-revenue')">📈 Revenue</a>

  <div style="font-size:10px;font-weight:700;color:#475569;letter-spacing:.08em;text-transform:uppercase;padding:12px 18px 4px">Store</div>
  <a class="sidebar-link" onclick="jump('vendors')">🏪 Vendors</a>
  <a class="sidebar-link" onclick="jump('products')">🛍️ Products</a>
  <a class="sidebar-link" onclick="jump('categories')">🗂️ Categories</a>
  <a class="sidebar-link" onclick="jump('coupons')">🎟️ Coupons</a>

  <div style="font-size:10px;font-weight:700;color:#475569;letter-spacing:.08em;text-transform:uppercase;padding:12px 18px 4px">Commerce</div>
  <a class="sidebar-link" onclick="jump('cart')">🛒 Cart</a>
  <a class="sidebar-link" onclick="jump('orders')">📦 Orders</a>
  <a class="sidebar-link" onclick="jump('payment')">💳 Payment</a>
  <a class="sidebar-link" onclick="jump('wishlist')">❤️ Wishlist</a>

  <div style="font-size:10px;font-weight:700;color:#475569;letter-spacing:.08em;text-transform:uppercase;padding:12px 18px 4px">Customer</div>
  <a class="sidebar-link" onclick="jump('address')">📍 Addresses</a>
  <a class="sidebar-link" onclick="jump('contact')">✉️ Contact</a>
  <a class="sidebar-link" onclick="jump('chatbot')">🤖 Chatbot</a>
</nav>

<!-- MAIN -->
<main style="flex:1;padding:32px;max-width:980px">

  <!-- HERO -->
  <div id="overview" style="background:linear-gradient(135deg,rgba(249,115,22,.07),rgba(96,165,250,.05));border:1px solid rgba(249,115,22,.2);border-radius:12px;padding:28px;margin-bottom:36px">
    <h1 style="font-size:22px;font-weight:800;margin-bottom:8px">Bengal Creations — REST API</h1>
    <p style="color:#94a3b8;font-size:14px;line-height:1.7">Complete e-commerce API — vendor management, multi-vendor orders, UPI payments, coupon engine, refunds, and a full super-admin panel authenticated via email OTP. All protected routes require a <code style="background:rgba(255,255,255,.06);padding:2px 6px;border-radius:4px">Bearer &lt;jwt&gt;</code> header.</p>
    <div style="display:flex;gap:28px;margin-top:18px">
      ${['65+ Endpoints','13 Route Groups','JWT Auth','OTP Login'].map((v,i) => {
        const [num,lbl] = v.includes(' ') ? [v.split(' ')[0], v.split(' ').slice(1).join(' ')] : [v,''];
        return `<div style="text-align:center"><div style="font-size:22px;font-weight:700;color:#f97316">${num}</div><div style="font-size:11px;color:#64748b">${lbl||'Feature'}</div></div>`;
      }).join('')}
    </div>
    <div style="background:#0d1117;border:1px solid #21262d;border-radius:8px;padding:10px 14px;font-family:monospace;font-size:13px;color:#22d3ee;margin-top:16px">BASE URL: <span id="bu">${baseUrl || 'http://localhost:5000'}</span></div>
  </div>

  ${section('auth','🔐','rgba(34,197,94,.1)','Customer Authentication','Register, login, password reset &nbsp;|&nbsp; <code style="font-size:11px">/api/auth</code>',`
    ${ep('POST','/api/auth/register','Register customer',false,false,
      [['name','string','✓','Full name'],['email','string','✓','Email address'],['password','string','✓','Min 6 chars'],['phone','string','','Phone number']],
      `{\n  "name": "Rahul Das",\n  "email": "rahul@example.com",\n  "password": "secret123",\n  "phone": "9800000000"\n}`,
      `{\n  "success": true,\n  "token": "eyJhbGci...",\n  "customer": { "_id": "...", "name": "Rahul Das", "email": "..." }\n}`
    )}
    ${ep('POST','/api/auth/login','Login with password',false,false,
      [['email','string','✓','Registered email'],['password','string','✓','Password']],
      `{\n  "email": "rahul@example.com",\n  "password": "secret123"\n}`,
      `{\n  "success": true,\n  "token": "eyJhbGci...",\n  "customer": { ... }\n}`
    )}
    ${ep('POST','/api/auth/forgot-password','Send reset email',false,false,
      [['email','string','✓','Registered email']],
      `{ "email": "rahul@example.com" }`,
      `{ "success": true, "msg": "Reset email sent" }`
    )}
    ${ep('POST','/api/auth/reset-password/:token','Reset password',false,false,
      [['token','string','✓','URL param from email link'],['newPassword','string','✓','New password']],
      `{ "newPassword": "newpass456" }`,
      `{ "success": true, "msg": "Password updated" }`
    )}
  `)}

  ${section('sa-auth','👑','rgba(249,115,22,.1)','Super Admin — OTP Login','Credentials via ENV vars. OTP valid 10 min. &nbsp;|&nbsp; <code style="font-size:11px">/api/super-admin/auth</code>',`
    <div style="background:rgba(249,115,22,.08);border:1px solid rgba(249,115,22,.2);border-radius:8px;padding:14px 16px;margin-bottom:14px;font-size:13px;color:#fed7aa">
      <strong>ENV Setup:</strong> Set <code>SUPER_ADMIN_EMAIL=admin@bengalcreations.in</code> (or <code>SUPER_ADMIN_1_EMAIL</code>, <code>SUPER_ADMIN_2_EMAIL</code> for multiple admins). OTP is sent via your configured <code>EMAIL_USER</code>.
    </div>
    ${ep('POST','/api/super-admin/auth/send-otp','Send OTP to super admin email',false,false,
      [['email','string','✓','Must match an ENV-configured super admin email']],
      `{ "email": "admin@bengalcreations.in" }`,
      `{ "success": true, "msg": "OTP sent to your email" }`
    )}
    ${ep('POST','/api/super-admin/auth/verify-otp','Verify OTP → receive JWT',false,false,
      [['email','string','✓','Super admin email'],['otp','string','✓','6-digit OTP from email']],
      `{ "email": "admin@bengalcreations.in", "otp": "482910" }`,
      `{ "success": true, "token": "eyJhbGci... (role: superadmin, 8h)", "email": "admin@..." }`
    )}
  `)}

  ${section('sa-dashboard','📊','rgba(249,115,22,.08)','Super Admin — Dashboard','Platform-wide stats. &nbsp;|&nbsp; Requires SuperAdmin token',`
    ${ep('GET','/api/super-admin/dashboard','Total counts, revenue, recent orders',false,true,[],``,
      `{\n  "stats": {\n    "totalVendors": 12,\n    "pendingVendors": 3,\n    "totalCustomers": 480,\n    "totalOrders": 960,\n    "totalProducts": 240,\n    "totalRevenue": 125400,\n    "pendingRefunds": 2\n  },\n  "recentOrders": [ ... ]\n}`
    )}
  `)}

  ${section('sa-vendors','🏪','rgba(96,165,250,.08)','Super Admin — Vendor Management','List, approve, reject vendors',`
    ${ep('GET','/api/super-admin/vendors','List vendors',false,true,
      [['page','number','','Default 1'],['limit','number','','Default 20'],['verified','boolean','','Filter by status'],['search','string','','Name/email search']],``,
      `{ "vendors": [...], "total": 12, "page": 1 }`
    )}
    ${ep('PATCH','/api/super-admin/vendors/:id/approve','Approve vendor + email notification',false,true,
      [['id','string','✓','Vendor MongoDB _id']],``,
      `{ "success": true, "msg": "Vendor approved", "vendor": { ... } }`
    )}
    ${ep('DELETE','/api/super-admin/vendors/:id/reject','Reject & permanently remove vendor',false,true,
      [['id','string','✓','Vendor MongoDB _id']],``,
      `{ "success": true, "msg": "Vendor rejected and removed" }`
    )}
  `)}

  ${section('sa-customers','👥','rgba(167,139,250,.08)','Super Admin — Customer Management','View and manage customer accounts',`
    ${ep('GET','/api/super-admin/customers','List customers',false,true,
      [['page','number','','Default 1'],['limit','number','','Default 20'],['search','string','','Name/email search']],``,
      `{ "customers": [...], "total": 480 }`
    )}
    ${ep('DELETE','/api/super-admin/customers/:id','Delete a customer',false,true,
      [['id','string','✓','Customer _id']],``,
      `{ "success": true, "msg": "Customer deleted" }`
    )}
  `)}

  ${section('sa-orders','📦','rgba(34,211,238,.08)','Super Admin — Orders & Manual Charges','Full order control, bulk status updates, manual payment recording',`
    ${ep('GET','/api/super-admin/orders','List orders with filters & pagination',false,true,
      [['page','number','',''],['limit','number','',''],['status','string','','Pending|Processing|Shipped|Delivered|Cancelled'],['paymentStatus','string','','Pending|Paid|Failed'],['search','string','','Name / email / order ID']],``,
      `{ "orders": [...], "total": 960 }`
    )}
    ${ep('PATCH','/api/super-admin/orders/:id','Update order or payment status',false,true,
      [['id','string','✓','Order _id (URL param)'],['status','string','','New order status'],['paymentStatus','string','','New payment status']],
      `{ "status": "Shipped", "paymentStatus": "Paid" }`,
      `{ "success": true, "order": { ... } }`
    )}
    ${ep('POST','/api/super-admin/orders/bulk-update','Bulk update multiple orders',false,true,
      [['orderIds','array','✓','Array of order _ids'],['status','string','','Apply to all'],['paymentStatus','string','','Apply to all']],
      `{\n  "orderIds": ["66a1b...", "66a1c..."],\n  "paymentStatus": "Paid"\n}`,
      `{ "success": true, "modifiedCount": 2 }`
    )}
    ${ep('POST','/api/super-admin/orders/manual-charge','Record manual payment (COD, UPI, etc.)',false,true,
      [['orderId','string','✓','Order _id'],['amount','number','','Override amount if different from order'],['method','string','','Payment method label'],['note','string','','UTR / transaction reference']],
      `{\n  "orderId": "66a1b2c...",\n  "note": "UTR#98765432",\n  "method": "UPI"\n}`,
      `{ "success": true, "msg": "Payment recorded", "order": { "paymentStatus": "Paid", ... } }`
    )}
  `)}

  ${section('sa-refunds','💸','rgba(248,113,113,.08)','Super Admin — Refund Management','View all refund requests, approve or reject',`
    ${ep('GET','/api/super-admin/refunds','All refund requests',false,true,[],``,
      `{ "refunds": [{ "_id":"...", "refundStatus":"Requested", "refundAmount":499, "user":{ "name":"...", "email":"..." } }] }`
    )}
    ${ep('POST','/api/super-admin/refunds/process','Approve or reject a refund',false,true,
      [['orderId','string','✓','Order _id'],['action','string','✓','approve | reject'],['refundAmount','number','','Override amount (default = order total)'],['note','string','','Admin note appended to refundReason']],
      `{\n  "orderId": "66a1b2c...",\n  "action": "approve",\n  "refundAmount": 450,\n  "note": "Transferred via UPI to customer"\n}`,
      `{ "success": true, "msg": "Refund approved", "order": { "refundStatus": "Processed", ... } }`
    )}
  `)}

  ${section('sa-coupons','🎟️','rgba(250,204,21,.08)','Super Admin — Coupon Management','Create, edit, toggle, delete discount coupons',`
    ${ep('GET','/api/super-admin/coupons','List all coupons',false,true,[],``,
      `{ "coupons": [{ "code":"SAVE20", "discount_type":"PERCENTAGE", "discount_value":20, "used_count":5, "is_active":true }] }`
    )}
    ${ep('POST','/api/super-admin/coupons','Create a new coupon',false,true,
      [
        ['code','string','✓','Unique code (auto-uppercased)'],
        ['title','string','✓','Display title'],
        ['discount_type','string','✓','PERCENTAGE | FLAT'],
        ['discount_value','number','✓','% or flat ₹ amount'],
        ['min_order_amount','number','','Min cart total to apply'],
        ['max_discount_amount','number','','Cap on PERCENTAGE discounts'],
        ['usage_limit','number','','Total uses (null = unlimited)'],
        ['usage_limit_per_customer','number','','Max uses per customer (default 1)'],
        ['start_at','date','✓','ISO 8601 date string'],
        ['end_at','date','✓','ISO 8601 date string'],
        ['applicable_for','string','','ALL | STORE | CATEGORY | FIRST_ORDER'],
        ['is_active','boolean','','Default true'],
        ['is_public','boolean','','Show on coupon listing page, default true'],
      ],
      `{\n  "code": "FESTIVE30",\n  "title": "Festive 30% Off",\n  "discount_type": "PERCENTAGE",\n  "discount_value": 30,\n  "min_order_amount": 800,\n  "max_discount_amount": 500,\n  "usage_limit": 200,\n  "start_at": "2025-10-01T00:00:00Z",\n  "end_at": "2025-10-31T23:59:59Z"\n}`,
      `{ "success": true, "coupon": { "_id":"...", "code":"FESTIVE30", "used_count":0, ... } }`
    )}
    ${ep('PATCH','/api/super-admin/coupons/:id','Update any coupon field',false,true,
      [['id','string','✓','Coupon _id (URL param)'],['...any field','','','Partial update — send only changed fields']],
      `{ "is_active": false }`,
      `{ "success": true, "coupon": { "is_active": false, ... } }`
    )}
    ${ep('DELETE','/api/super-admin/coupons/:id','Delete a coupon permanently',false,true,
      [['id','string','✓','Coupon _id']],``,
      `{ "success": true, "msg": "Coupon deleted" }`
    )}
  `)}

  ${section('sa-revenue','📈','rgba(34,197,94,.08)','Super Admin — Revenue Report','Total revenue, refunds, monthly breakdown, top vendors',`
    ${ep('GET','/api/super-admin/revenue','Revenue analytics',false,true,
      [['startDate','date','','Filter from date (ISO)'],['endDate','date','','Filter to date (ISO)']],``,
      `{\n  "totalRevenue": 125400,\n  "totalRefunds": 2100,\n  "netRevenue": 123300,\n  "monthlyRevenue": [{ "_id":{"year":2025,"month":3}, "revenue":18400, "count":42 }],\n  "topVendors": [{ "shopName":"Muslin House", "revenue":32000, "orders":76 }]\n}`
    )}
  `)}

  ${section('vendors','🏪','rgba(96,165,250,.08)','Vendors (Public)','Register, login, manage vendors &nbsp;|&nbsp; <code style="font-size:11px">/api/vendors</code>',`
    ${ep('POST','/api/vendors/register','Register a new vendor',false,false,
      [['name','string','✓',''],['shopName','string','✓',''],['email','string','✓',''],['password','string','✓',''],['phone','string','✓',''],['address','string','✓',''],['tradeLicense','string','✓','Document URL'],['aadhaarCard','string','✓','Document URL'],['panCard','string','✓','Document URL'],['description','string','',''],['logo','string','',''],['banner','string','','']],
      `{\n  "name": "Ananya Sen",\n  "shopName": "Muslin House",\n  "email": "ananya@example.com",\n  "password": "secure123",\n  "phone": "9800000001",\n  "address": "Kolkata, WB",\n  "tradeLicense": "https://...",\n  "aadhaarCard": "https://...",\n  "panCard": "https://..."\n}`,
      `{ "success": true, "msg": "Vendor Registered Successfully", "vendor": { ... } }`
    )}
    ${ep('POST','/api/vendors/login','Vendor login',false,false,
      [['email','string','✓',''],['password','string','✓','']],
      `{ "email": "ananya@example.com", "password": "secure123" }`,
      `{ "success": true, "token": "eyJhbGci...", "vendor": { ... } }`
    )}
    ${ep('GET','/api/vendors','List all vendors',false,false,
      [['page','number','','Default 1'],['limit','number','','Default 10'],['verified','boolean','','Filter by status']],``,
      `{ "success": true, "vendors": [...], "pagination": { "total":12 } }`
    )}
    ${ep('GET','/api/vendors/pending/all','Pending (unverified) vendors',false,false,[],``,`{ "success": true, "vendors": [...] }`)}
    ${ep('PATCH','/api/vendors/verify/:id','Verify a vendor',false,false,[['id','string','✓','Vendor _id']],``,`{ "success": true, "vendor": { "isVerified": true, ... } }`)}
    ${ep('GET','/api/vendors/:id','Get vendor by vendorId',false,false,[['id','string','✓','vendorId like VEND-2025ABCD']],``,`{}`)}
    ${ep('PUT','/api/vendors/:id','Update vendor details',false,false,[],`{}`,'`{}`')}
    ${ep('DELETE','/api/vendors/:id','Delete vendor',false,false,[],``,`{}`)}
    ${ep('GET','/api/vendors/:vendorId/products','Get vendor products',false,false,[],``,`{}`)}
  `)}

  ${section('products','🛍️','rgba(167,139,250,.08)','Products','<code style="font-size:11px">/api/products</code>',`
    ${ep('GET','/api/products','List products (paginated, filterable)',false,false,
      [['page','number','',''],['limit','number','',''],['category','string','','Category ID'],['vendor','string','','Vendor ID'],['search','string','','Full-text search'],['minPrice','number','',''],['maxPrice','number','','']],``,`{ "products": [...], "total": 240 }`
    )}
    ${ep('POST','/api/products','Create product',true,false,
      [['name','string','✓',''],['description','string','',''],['price','number','✓',''],['stock','number','✓',''],['category','string','✓','Category _id'],['images','array','','Image URLs']],
      `{\n  "name": "Tant Saree",\n  "price": 1200,\n  "stock": 50,\n  "category": "...",\n  "images": ["https://..."]\n}`,`{}`
    )}
    ${ep('GET','/api/products/:id','Get product by ID',false,false,[],``,`{}`)}
    ${ep('PUT','/api/products/:id','Update product',true,false,[],`{}`,`{}`)}
    ${ep('DELETE','/api/products/:id','Delete product',true,false,[],``,`{}`)}
  `)}

  ${section('categories','🗂️','rgba(34,211,238,.08)','Categories','<code style="font-size:11px">/api/categories</code>',`
    ${ep('GET','/api/categories','Get all categories',false,false,[],``,`[{ "_id":"...", "name":"Sarees", "image":"..." }]`)}
    ${ep('POST','/api/categories','Create category',false,false,[['name','string','✓',''],['image','string','','Image URL']],`{ "name": "Sarees", "image": "https://..." }`,`{}`)}
    ${ep('PUT','/api/categories/:id','Update category',false,false,[],`{}`,`{}`)}
    ${ep('DELETE','/api/categories/:id','Delete category',false,false,[],``,`{}`)}
  `)}

  ${section('coupons','🎟️','rgba(250,204,21,.08)','Coupons (Customer-facing)','<code style="font-size:11px">/api/coupon</code>',`
    ${ep('GET','/api/coupon/public','Get active public coupons',false,false,[],``,
      `{ "coupons": [{ "code":"SAVE20", "title":"Save 20%", "discount_type":"PERCENTAGE", "discount_value":20, "end_at":"2025-12-31" }] }`
    )}
    ${ep('POST','/api/coupon/apply','Validate & apply coupon at checkout',true,false,
      [['code','string','✓','Coupon code'],['cartTotal','number','✓','Cart subtotal before discount'],['customerId','string','','For per-customer usage check']],
      `{\n  "code": "SAVE20",\n  "cartTotal": 1500,\n  "customerId": "66a1b2c..."\n}`,
      `{\n  "success": true,\n  "discountAmount": 300,\n  "finalTotal": 1200,\n  "coupon": { "code":"SAVE20", "title":"Save 20%" }\n}`
    )}
  `)}

  ${section('cart','🛒','rgba(34,211,238,.08)','Cart','<code style="font-size:11px">/api/cart</code>',`
    ${ep('GET','/api/cart/:userId','Get customer cart',true,false,[['userId','string','✓','URL param']],``,`{ "items":[...], "totalAmount":1800 }`)}
    ${ep('POST','/api/cart/add','Add item to cart',true,false,
      [['userId','string','✓',''],['productId','string','✓',''],['quantity','number','✓','']],
      `{ "userId": "...", "productId": "...", "quantity": 2 }`,`{}`
    )}
    ${ep('PATCH','/api/cart/update','Update item quantity',true,false,
      [['userId','string','✓',''],['productId','string','✓',''],['quantity','number','✓','Set to 0 to remove']],`{}`,`{}`
    )}
    ${ep('DELETE','/api/cart/remove','Remove item from cart',true,false,
      [['userId','string','✓',''],['productId','string','✓','']],`{}`,`{}`
    )}
    ${ep('DELETE','/api/cart/clear/:userId','Clear entire cart',true,false,[],``,`{}`)}
  `)}

  ${section('orders','📦','rgba(249,115,22,.08)','Orders','<code style="font-size:11px">/api/orders</code>',`
    ${ep('POST','/api/orders','Create order from cart',false,false,
      [['addressId','string','✓','Delivery address _id'],['user_id','string','✓','Customer _id'],['PaymentMethod','string','✓','COD | UPI | BANK_TRANSFER'],['couponCode','string','','Applied coupon code'],['discountAmount','number','','Discount to subtract']],
      `{\n  "addressId": "...",\n  "user_id": "...",\n  "PaymentMethod": "UPI"\n}`,
      `{ "_id": "...", "totalAmount": 1200, "status": "Pending", "paymentStatus": "Pending" }`
    )}
    ${ep('GET','/api/orders/user/:userId','Orders for a customer',false,false,[['userId','string','✓','']],``,`[...]`)}
    ${ep('GET','/api/orders/status/:status','Orders by status',false,false,[['status','string','✓','Pending|Processing|Shipped|Delivered|Cancelled']],``,`[...]`)}
    ${ep('GET','/api/orders','All orders',false,false,[],``,`[...]`)}
    ${ep('GET','/api/orders/:id','Order by ID',false,false,[],``,`{}`)}
    ${ep('PATCH','/api/orders/status/:id','Update order status',false,false,[['status','string','✓','']],`{ "status": "Shipped" }`,`{}`)}
    ${ep('PATCH','/api/orders/payment-status/:id','Update payment status',false,false,[['paymentStatus','string','✓','Pending|Paid|Failed']],`{ "paymentStatus": "Paid" }`,`{}`)}
    ${ep('DELETE','/api/orders/:id','Delete order',false,false,[],``,`{}`)}
  `)}

  ${section('payment','💳','rgba(34,197,94,.08)','Payment (UPI + Refunds)','<code style="font-size:11px">/api/payment</code>',`
    ${ep('GET','/api/payment/upi/:orderId','Get UPI ID & amount for QR generation',false,false,[['orderId','string','✓','URL param']],``,
      `{ "upiId": "7908735132@ybl", "amount": 1200, "orderId": "...", "merchantName": "Bengal Creations" }`
    )}
    ${ep('POST','/api/payment/upi/confirm','Confirm after user scans & pays',false,false,
      [['orderId','string','✓',''],['upiTransactionId','string','','UTR or reference number']],
      `{ "orderId": "...", "upiTransactionId": "UTR123456789" }`,
      `{ "success": true, "message": "Payment confirmed", "order": { "paymentStatus":"Paid", "status":"Processing" } }`
    )}
    ${ep('POST','/api/payment/failed','Mark payment as failed',false,false,
      [['orderId','string','✓','']],`{ "orderId": "..." }`,`{ "success": true }`
    )}
    ${ep('POST','/api/payment/refund/request','Customer requests refund',false,false,
      [['orderId','string','✓',''],['reason','string','','Reason for refund']],
      `{ "orderId": "...", "reason": "Wrong item received" }`,
      `{ "success": true, "msg": "Refund request submitted" }`
    )}
    ${ep('POST','/api/payment/refund/process','Process refund (vendor/admin)',false,false,
      [['orderId','string','✓',''],['action','string','✓','approve | reject'],['refundAmount','number','','']],
      `{ "orderId": "...", "action": "approve" }`,`{}`
    )}
    ${ep('GET','/api/payment/refunds','All refund requests',false,false,[['vendorId','string','','Filter by vendor']],``,`{}`)}
    ${ep('GET','/api/payment/report','Order analytics report',false,false,
      [['vendorId','string','',''],['startDate','date','',''],['endDate','date','','']],``,
      `{ "totalRevenue": 125400, "totalOrders": 960, "statusBreakdown": {...} }`
    )}
  `)}

  ${section('wishlist','❤️','rgba(248,113,113,.08)','Wishlist','<code style="font-size:11px">/api/wishlist</code>',`
    ${ep('GET','/api/wishlist/:userId','Get wishlist',true,false,[],``,`{ "items": [...] }`)}
    ${ep('POST','/api/wishlist/add','Add to wishlist',true,false,[['userId','string','✓',''],['productId','string','✓','']],`{}`,`{}`)}
    ${ep('DELETE','/api/wishlist/remove','Remove from wishlist',true,false,[['userId','string','✓',''],['productId','string','✓','']],`{}`,`{}`)}
  `)}

  ${section('address','📍','rgba(96,165,250,.08)','Addresses','<code style="font-size:11px">/api/addresses</code>',`
    ${ep('GET','/api/addresses/:customerId','Get all addresses',false,false,[],``,`[...]`)}
    ${ep('POST','/api/addresses','Add address',false,false,
      [['customer','string','✓','Customer _id'],['name','string','✓',''],['phone','string','✓',''],['line1','string','✓',''],['city','string','✓',''],['state','string','✓',''],['pincode','string','✓',''],['isDefault','boolean','','']],
      `{ "customer":"...", "name":"Rahul Das", "phone":"9800000000", "line1":"12 Park St", "city":"Kolkata", "state":"WB", "pincode":"700001" }`,`{}`
    )}
    ${ep('PUT','/api/addresses/:id','Update address',false,false,[],`{}`,`{}`)}
    ${ep('DELETE','/api/addresses/:id','Delete address',false,false,[],``,`{}`)}
  `)}

  ${section('contact','✉️','rgba(167,139,250,.08)','Contact & Chatbot','<code style="font-size:11px">/api/contact &amp; /api/chatbot</code>',`
    ${ep('POST','/api/contact','Submit contact form',false,false,
      [['name','string','✓',''],['email','string','✓',''],['message','string','✓','']],
      `{ "name": "Rahul Das", "email": "rahul@example.com", "message": "I need help with my order" }`,
      `{ "success": true, "msg": "Message sent" }`
    )}
    ${ep('POST','/api/chatbot/chat','Chat with AI assistant',false,false,
      [['message','string','✓','User message']],
      `{ "message": "What fabrics do you sell?" }`,
      `{ "reply": "We specialise in handloom silks, muslin, jamdani and tant sarees..." }`
    )}
  `)}

  <div style="text-align:center;padding:40px 0;color:#334155;font-size:13px">
    Bengal Creations API v1.0 &nbsp;·&nbsp; Built with Express.js + MongoDB &nbsp;·&nbsp; © ${new Date().getFullYear()}
  </div>

</main>
</div>

<script>
  function jump(id){
    var el=document.getElementById(id);
    if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
  }
  // Set live base URL
  document.getElementById('bu').textContent = window.location.origin;
</script>
</body>
</html>`;

  return html;
}

module.exports = buildApiDocsHtml;
