export const brand = {
  name: 'Anthony Bluemel',
  email: 'antblu@antblu.net',
  description: 'Independent infrastructure engineering and open-source implementation.'
};

export const links = {
  infrastructure: ['/services/infrastructure', 'Choose infrastructure'],
  applications: ['/services/applications', 'Browse applications'],
  handoff: ['/services/handoff', 'See what you receive'],
  demo: ['/demo', 'Try the restore exercise'],
  compare: ['/services/compare', 'Compare software'],
  calculator: ['/services/calculator', 'Compare your costs'],
  contact: ['/contact#quote', 'Prepare a project brief']
};

export const landing = {
  title: 'I build open-source systems your team can run.',
  lead: 'You buy the hardware or open the cloud account in your name. I deploy and secure the tools, connect them, and train your team to run them. You pay me once.',
  steps: [
    ['Choose where it runs', 'I size the workload and give you a purchase brief. You place the order and control billing.', 'infrastructure'],
    ['Build and connect the stack', 'I configure your CRM, file storage, VPN, and single sign-on. We agree on who needs access, what to back up, and how to test recovery.', 'applications'],
    ['Train the people who will run it', 'Your administrator practices a restore with their own credentials. I hand over the configuration, runbooks, and an AI troubleshooting assistant connected to approved sources in your environment.', 'handoff']
  ],
  ownership: [
    ['Infrastructure and accounts', 'You own equipment you buy. For rented infrastructure, your business holds the provider account, billing, and administrator access.'],
    ['Code and data', 'You keep the project code, deployment repository, data exports, and backup access. Upstream software keeps its own license.'],
    ['One project payment', 'The agreed open-source stack has $0 per-seat licensing and no recurring fee to me. Budget for your team’s time and any infrastructure or storage you buy from providers.']
  ],
  evidence: {
    title: 'See how I build and document systems',
    text: 'In the Antalos lab inventory from November 2026, you can see where I place workloads and how I segment the network. The October 2026 Emiliany architecture notes show how I connected the storefront, order systems, and support tools.',
    links: [['/#homelab', 'Inspect the Antalos lab'], ['/#emiliany', 'Read the Emiliany case study']],
    image: '/assets/homelab/rack-and-ups.webp',
    caption: 'My Antalos lab rack and UPS'
  },
  faq: [
    ['What does the one-time payment cover?', 'We agree on the deployment, integrations, migration, recovery checks, and training before I quote one implementation fee. You buy infrastructure and any third-party services in your name.'],
    ['Will self-hosting cost less?', 'It depends on your current bills, the hardware or provider you choose, and who maintains the stack. Run the comparison with your own costs over one, three, or five years.'],
    ['Who runs the system after handoff?', 'Your designated administrator handles updates, alerts, and recovery. We practice these tasks during handoff.'],
    ['Can you build a website or store in my accounts?', 'Yes. I can deploy a website or store in your accounts, document its integrations, and train your team to edit and operate it.']
  ]
};

export const handoff = {
  title: 'What your team receives at handoff',
  lead: 'We agree on acceptance checks before I build. Your named administrator runs them during training with the accounts and documentation your business will keep.',
  checks: [
    ['Account and access inventory', 'Provider billing, domains, single sign-on, VPN, and the location of emergency access credentials.', 'Sign in as an administrator and rotate a temporary deployment credential.'],
    ['Deployment repository and architecture', 'Configuration, dependencies, network and storage diagrams, and instructions for deploying from source.', 'Find the version running in production and identify which repository controls it.'],
    ['Backups and recovery', 'Backup destinations, retention, recovery targets, and instructions for file and service restores.', 'Restore a sample file to a separate folder, open it, and record the result.'],
    ['Updates and rollback', 'Maintenance schedule, health checks, known failure modes, and the procedure for reverting a change.', 'Rehearse an update and rollback in an agreed test environment.'],
    ['Operator training and AI-assisted runbook', 'A troubleshooting assistant uses the approved runbooks and diagnostics for your environment. Administrators review its evidence and perform changes through their normal workflow.', 'Ask the assistant about a sample incident, find the cited runbook, and verify the recommendation.']
  ]
};

export const infrastructure = {
  title: 'The purchase brief you get before ordering',
  lead: 'I size the setup around your users, storage growth, uptime needs, and recovery goals. The brief lists the specific equipment or provider resources to order and who will administer them.',
  options: [
    ['Existing equipment', 'I check available CPU, memory, storage health, network capacity, and whether the hardware has a workable replacement path.'],
    ['New bare metal', 'I specify the hardware, disks, power protection, network ports, and off-site backup capacity. You place the order.'],
    ['VPS or cloud', 'I specify the region, instance sizes, storage, networking, and backup destination. You open the account and pay the provider.']
  ],
  example: {
    title: 'Sample purchase brief for a 12-person office',
    detail: 'For a files-and-CRM workload that can tolerate a single-server outage, start the assessment with one 8-core host, 32 GB RAM, two 2 TB SSDs in a mirror, a UPS with shutdown signaling, and a separate encrypted off-site backup destination. I confirm capacity from your current data and growth before you order.'
  },
  stack: 'One example pairs Nextcloud Community for files with Keycloak for identity and restic for backups. I check the supported sign-in connector on the versions we plan to deploy and test file recovery before handoff.',
  sources: [
    ['https://docs.nextcloud.com/server/latest/admin_manual/', 'Nextcloud administration'],
    ['https://apps.nextcloud.com/apps/user_saml', 'Nextcloud SSO connector'],
    ['https://www.keycloak.org/documentation', 'Keycloak documentation'],
    ['https://restic.net/', 'restic documentation and license']
  ]
};

export const recovery = {
  title: 'Restore a file from backup',
  lead: 'Try a simulated restore for a shared files workspace. The snapshots, runbook, file contents, and AI response are examples.',
  file: 'vendor-inventory.csv',
  path: 'runbooks/recovery/files.md',
  prompt: 'A teammate deleted the inventory file at 10:15. Which snapshot should I use?',
  operator: 'Files administrator',
  steps: [
    'Choose a snapshot from before the deletion.',
    'Restore the file to a separate folder with your recovery credentials.',
    'Open the copy, check its contents, and record the snapshot and outcome.'
  ],
  snapshots: [
    { id: '0900', label: '09:00 · Inventory file present', recoverable: true },
    { id: '1030', label: '10:30 · After deletion', recoverable: false }
  ],
  answer: 'Choose the 09:00 snapshot. The file was still present at that time. Restore to a separate folder so you can check the copy before replacing anything.',
  contents: 'item,quantity\nnetwork cable,24\nreplacement drive,2',
  afterDeletion: 'That snapshot was taken after the deletion. Choose a recovery point from before 10:15.',
  restored: 'The simulation restored the file to the recovery folder. Open the copy and check its contents.',
  verified: 'Restore verified. The file opens and contains the expected inventory rows. Record 09:00 as the recovery point.'
};

export const policy = {
  privacy: [
    ['Project briefs and messages', 'The forms compose your message in your browser. You choose whether to copy it or open a draft in your email app. If you send it, I use the information to respond and assess your project. The host may log basic connection details for site operation.'],
    ['Browser storage and external links', 'The calculator can keep a summary in your current tab for the project brief. The site can remember your theme preference across visits and loads typefaces from Google Fonts. External websites and email providers have their own privacy terms.']
  ],
  terms: [
    ['Estimates and agreements', 'Prices and calculator totals are planning estimates in USD. Your statement of work specifies the one-time implementation fee, deliverables, and acceptance checks. You purchase hardware and provider services in your own name.'],
    ['Software and operating costs', 'The agreed open-source stack carries no per-seat license fee. Upstream software remains subject to its license. Budget for infrastructure, storage, and your team’s time to operate the system.'],
    ['Comparison data', 'Vendor pricing and feature availability can change. Check the quoted edition, current terms, and required integrations before approving the scope.']
  ]
};

export const ownershipComparison = [
  ['Access', 'A provider defines the permissions in its hosted plan. In your stack, your administrators control the identity provider, application roles, and recovery credentials.'],
  ['Data export', 'Check whether your subscription exports attachments, history, and settings. For your deployment, we identify the data stores and test the exports your team needs.'],
  ['Maintenance', 'A hosted provider updates its service. Your administrator schedules updates, checks release notes, and rehearses rollback using the handoff runbook.'],
  ['Recovery', 'Check which restores your current provider performs and how long they take. For your deployment, we agree on retention and recovery targets and test a restore using your credentials.']
];

export const implementations = {
  'web-development': ['Operate the site in your own accounts', 'You keep your domain, hosting account, site source, and content exports. During handoff, your team publishes a change and learns how to restore a prior version.'],
  ecommerce: ['Keep control of your storefront', 'You hold the store, hosting, domain, and payment provider accounts. During handoff, your team checks a sample order and exports the records it needs. You pay the payment provider directly.']
};

export const operatorTasks = {
  Collaboration: 'Manage memberships and shared folders. Test a restore after changes to storage or backup settings.',
  'Identity & Security': 'Review roles, rotate recovery credentials, and check administrator access after updates.',
  'Development & Infrastructure': 'Review deployment changes, check health after upgrades, and rehearse rollback.',
  'E-commerce': 'Check order and payment integrations, confirm updates in a test environment, and export order records.',
  default: 'Manage access, review upstream releases, and test updates and recovery with the runbook.'
};
