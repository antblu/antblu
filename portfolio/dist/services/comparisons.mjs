// Baseline verification date. Override verified per plan when updating a source.
const verified = '2026-11-14';

// Annual amounts are billed per year. Store the full charge, even where the vendor advertises a monthly equivalent.
const monthly = amount => ({ amount, period: 'month', term: 'Billed monthly' });
const annually = amount => ({ amount, period: 'year', term: 'Billed annually' });

export const comparisons = [
  {
    id: 'microsoft-365', category: 'Office Productivity',
    vendor: 'Microsoft 365', plan: 'Business Basic with Teams',
    alternatives: ['Nextcloud', 'EuroOffice', 'Nextcloud Talk'],
    details: 'Business Basic bundles hosted email, Teams, browser-based Office apps, 1 TB of file storage per user and Microsoft support. Nextcloud and EuroOffice cover file collaboration and browser editing, while Nextcloud Talk supports team communication. Budget separately for mail, meetings and support, test complex Office files, and size and back up your file storage.',
    url: 'https://www.microsoft.com/en-us/microsoft-365/business/microsoft-365-business-basic',
    prices: [annually(84), monthly(8.40)], unit: 'seat', minimum: 1, maximum: 300, seatGroup: 'employees',
    billingNote: 'For organizations of up to 300 users.'
  },
  {
    id: 'dropbox', category: 'File Storage',
    vendor: 'Dropbox', plan: 'Advanced',
    alternatives: ['Nextcloud'],
    details: 'Advanced includes pooled storage starting at 15 TB, a year of deleted-file recovery, team controls, sync and SSO. Nextcloud offers configurable quotas, share policies and version retention. Size storage and replication for your actual usage, run restore tests, and check that client sync and identity integration fit your workflow.',
    url: 'https://www.dropbox.com/plans',
    termsUrl: 'https://investors.dropbox.com/static-files/bd69e485-7a51-4b42-b20e-09a43781366a',
    prices: [annually(288), monthly(30)], unit: 'seat', minimum: 3, seatGroup: 'users'
  },
  {
    id: 'slack', category: 'Team Communication',
    vendor: 'Slack', plan: 'Pro',
    alternatives: ['Nextcloud Talk', 'Jitsi'],
    details: 'Pro hosts message and file history, group calls and an app directory. Nextcloud Talk supports team messaging and calls, while Jitsi can provide meetings. Validate identity integration, retention, encryption recovery and call capacity. Your team handles updates, media storage, abuse controls and service availability.',
    url: 'https://slack.com/pricing',
    termsUrl: 'https://slack.com/help/articles/218915077-Slacks-Fair-Billing-Policy',
    prices: [annually(87), monthly(8.75)], unit: 'seat', minimum: 1, seatGroup: 'users',
    billingNote: 'Billed on active seats under eligible self-service billing.'
  },
  {
    id: 'salesforce-starter', category: 'CRM',
    vendor: 'Salesforce', plan: 'Starter Suite',
    alternatives: ['SuiteCRM'],
    details: 'Starter Suite bundles hosted CRM, linked sales and email-nurture workflows, and vendor-operated storage. SuiteCRM covers leads, accounts, opportunities and cases. Map fields and permissions, validate mail and other integrations, and budget for database operations, migration and support.',
    url: 'https://www.salesforce.com/small-business/starter/',
    prices: [monthly(25), annually(300)], unit: 'seat', minimum: 1, seatGroup: 'sales',
    billingNote: 'Starting price. Transaction fees and applicable add-ons are separate.'
  },
  {
    id: 'salesforce-pro', category: 'CRM',
    vendor: 'Salesforce', plan: 'Pro Suite',
    alternatives: ['SuiteCRM'],
    details: 'Pro Suite adds forecasting, quoting, greater workflow customization and access to AppExchange on Salesforce-managed infrastructure. SuiteCRM can cover core pipeline and quotation workflows. Validate forecasting, approvals and existing AppExchange dependencies separately, and budget for database storage, backups and operations.',
    url: 'https://www.salesforce.com/small-business/starter/',
    prices: [annually(1200)], unit: 'seat', minimum: 1, seatGroup: 'sales',
    billingNote: 'Starting price. Annual contract required. Transaction fees and applicable add-ons are separate.'
  },
  {
    id: 'netsuite', category: 'ERP',
    vendor: 'Oracle NetSuite', plan: 'NetSuite ERP base platform',
    alternatives: ['ERPNext', 'Dolibarr'],
    details: 'NetSuite hosts the core platform and offers modules for finance, inventory and other operations under contract. ERPNext and Dolibarr can cover accounting, inventory and orders depending on scope. Confirm localization, tax and reporting rules, approval flows and connector support. Plan database recovery and validate reports with accounting staff.',
    url: 'https://www.netsuite.com/portal/products/erp.shtml',
    prices: [], unit: 'account', minimum: null, seatGroup: 'users',
    billingNote: 'Annual contract depends on the platform, modules and users. Implementation is separate.'
  },
  {
    id: 'zendesk', category: 'Helpdesk',
    vendor: 'Zendesk', plan: 'Support Team',
    alternatives: ['Zammad'],
    details: 'Support Team provides hosted email ticketing, routing and automations. Suite tiers add channels and other capabilities. Zammad can handle queues, triggers and configured channels. Check mail delivery, search index capacity, attachment storage, identity integration and coverage during outages.',
    url: 'https://www.zendesk.com/pricing/',
    termsUrl: 'https://www.zendesk.com/service/help-desk-software/small-businesses/',
    prices: [annually(228)], unit: 'seat', minimum: 1, seatGroup: 'agents'
  },
  {
    id: 'asana', category: 'Project Management',
    vendor: 'Asana', plan: 'Starter',
    alternatives: ['OpenProject Community'],
    details: 'Asana Starter includes hosted boards, timelines, forms and automations. OpenProject Community offers work packages and planning. Verify forms, rules, dependencies and guest access individually. Import history and attachments, set up notifications, and operate application and database backups.',
    url: 'https://asana.com/pricing',
    termsUrl: 'https://help.asana.com/s/article/subscription-size-and-users',
    prices: [annually(131.88), monthly(13.49)], unit: 'seat', minimum: 2, seatGroup: 'users',
    seatBands: [[5, 1], [30, 5], [100, 10], [500, 25], [Infinity, 50]],
    billingNote: 'Seats are sold in blocks above five. The estimate rounds up to the next eligible block.'
  },
  {
    id: '1password', category: 'Password Management',
    vendor: '1Password', plan: 'Business',
    alternatives: ['Vaultwarden'],
    details: 'Business includes a hosted vault, vendor support and business controls such as policies and provisioning integrations. Vaultwarden is a community server compatible with many Bitwarden clients. Test client compatibility, access lifecycle and recovery. Your team owns availability, secure backups and timely patching.',
    url: 'https://1password.com/pricing/business',
    prices: [annually(107.88)], unit: 'seat', minimum: 1, seatGroup: 'employees'
  },
  {
    id: 'confluence', category: 'Knowledge Management',
    vendor: 'Atlassian Confluence Cloud', plan: 'Standard',
    alternatives: ['BookStack'],
    details: 'Confluence Standard includes hosted pages, permissions, 250 GB of storage, business-hours support and integrations such as Jira. BookStack provides structured documentation, permissions and configurable sign-in. Check macro and attachment migration, external access, backup retention and how linked work items will be represented.',
    url: 'https://www.atlassian.com/en/software/confluence/pricing',
    termsUrl: 'https://www.atlassian.com/licensing/cloud',
    prices: [], unit: 'account', minimum: null, seatGroup: 'users',
    billingNote: 'Use the vendor calculator for progressive monthly pricing or annual user tiers.'
  },
  {
    id: 'mailchimp', category: 'Marketing Automation',
    vendor: 'Mailchimp', plan: 'Marketing Standard',
    alternatives: ['Mautic', 'Listmonk'],
    details: 'Marketing Standard bundles hosted campaigns, automation and usage limits based on contact volume. Mautic offers journeys and segmentation, while Listmonk focuses on newsletters and lists. Pay for delivery as needed and plan consent data migration, suppression lists, reputation monitoring and contact database backups.',
    url: 'https://mailchimp.com/pricing/marketing/',
    prices: [], unit: 'account', minimum: null, seatGroup: 'users',
    billingNote: 'Use your contact bracket and send volumes. Overages and add-ons may apply.'
  },
  {
    id: 'looker', category: 'Business Analytics',
    vendor: 'Looker (Google Cloud core)', plan: 'Standard',
    alternatives: ['Metabase Open Source Edition', 'Grafana', 'Matomo'],
    details: 'Looker Standard includes a managed instance, LookML, named users and warehouse integrations. Metabase can cover SQL dashboards, Grafana is suited to time-series data, and Matomo covers web analytics. Confirm data models, governance rules, connectors and dashboard migration. Include warehouse queries, storage and reporting availability in your budget.',
    url: 'https://cloud.google.com/looker/pricing',
    prices: [], unit: 'account', minimum: null, seatGroup: 'users',
    billingNote: 'Annual platform quote includes 10 Standard and 2 Developer users. Additional named users and data charges may apply.'
  },
  {
    id: 'github', category: 'Source Control',
    vendor: 'GitHub', plan: 'Team',
    alternatives: ['Forgejo'],
    details: 'GitHub Team hosts Git repositories, review workflows, package storage and included Actions minutes, with vendor support. Forgejo hosts Git and code review on your infrastructure. Plan runner isolation, artifact and repository storage, backups and overage-equivalent costs, and test workflows, integrations and branch rules.',
    url: 'https://github.com/pricing?locale=en-US',
    termsUrl: 'https://docs.github.com/en/get-started/learning-about-github/faq-about-changes-to-githubs-plans',
    prices: [monthly(4)], unit: 'seat', minimum: 1, seatGroup: 'users',
    billingNote: 'One billable user assumed. Usage and add-ons may be priced separately.'
  },
  {
    id: 'shopify', category: 'E-commerce',
    vendor: 'Shopify', plan: 'Basic',
    alternatives: ['Medusa'],
    details: 'Shopify Basic bundles hosted checkout, store operation and merchant support. Medusa provides commerce APIs for a custom storefront. Plan checkout testing, service availability, media storage, extensions and payments, tax and shipping integrations. Payment-processing fees apply separately.',
    url: 'https://www.shopify.com/pricing',
    termsUrl: 'https://www.shopify.com/about',
    prices: [annually(348), monthly(39)], unit: 'account', unitLabel: 'store', minimum: 1, seatGroup: 'users',
    billingNote: 'Per store. Taxes, paid apps, processing and other transaction charges are separate.'
  },
  {
    id: 'shopify-grow', category: 'E-commerce',
    vendor: 'Shopify', plan: 'Grow',
    alternatives: ['Medusa'],
    details: 'Grow adds up to five staff accounts and different processing rates to Shopify’s hosted store and checkout. Medusa can support staffed stores with configured roles. Verify inventory, fulfillment and integrations, and plan media storage, backup recovery, application support and checkout availability.',
    url: 'https://www.shopify.com/pricing',
    termsUrl: 'https://www.shopify.com/about',
    prices: [annually(948), monthly(105)], unit: 'account', unitLabel: 'store', minimum: 1, seatGroup: 'users',
    billingNote: 'Per store. Taxes, paid apps, processing and other transaction charges are separate.'
  }
].map(plan => ({ region: 'United States', currency: 'USD', verified, ...plan }));

export function billableSeats(plan, quantity) {
  if (plan.unit === 'account') return 1;

  const seats = Math.max(plan.minimum ?? 1, Math.ceil(Number(quantity) || 0));
  const band = plan.seatBands?.find(([ceiling]) => seats <= ceiling);
  return band ? Math.ceil(seats / band[1]) * band[1] : seats;
}
