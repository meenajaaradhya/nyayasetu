export interface PracticalGuide {
  summary: string;
  firstSteps: string[];
  keepEvidence: string[];
  avoid: string;
  supportUrl: string;
  supportLabel: string;
}

export const PRACTICAL_GUIDES: Record<string, PracticalGuide> = {
  consumer: {
    summary: "Start by asking the seller or service provider for a specific fix: replacement, repair, refund, or correction. Keep the request and response in writing.",
    firstSteps: [
      "Check the invoice, warranty, return policy, and the seller’s written terms.",
      "Contact the seller through its official support channel. State what happened, what outcome you want, and a reasonable date for a response.",
      "If that does not resolve it, use the National Consumer Helpline for pre-litigation assistance before deciding whether to escalate."
    ],
    keepEvidence: ["Invoice and payment confirmation", "Photos or video showing the issue", "Support ticket numbers, emails, and chat screenshots"],
    avoid: "Do not post order numbers, addresses, phone numbers, or payment details publicly. Check current eligibility and process before using a formal forum.",
    supportUrl: "https://consumerhelpline.gov.in/",
    supportLabel: "National Consumer Helpline"
  },
  rental: {
    summary: "Tenancy rules and remedies vary by state and by agreement. First establish what the agreement says, what happened to the property, and what outcome you are asking for.",
    firstSteps: [
      "Read the deposit, repair, notice, and handover clauses in your signed agreement; note any dates and amounts.",
      "Photograph the property condition and prepare an itemized record of rent, deposit, deductions, and handover.",
      "Send the landlord a calm written request for the specific remedy or an itemized explanation. Keep proof that it was delivered.",
      "If discussion stalls, check the relevant state tenancy authority or speak with a local legal-aid service before choosing a formal route."
    ],
    keepEvidence: ["Signed agreement and payment records", "Move-in / move-out photos and inspection notes", "Written requests, replies, and delivery proof"],
    avoid: "Do not change locks, disconnect utilities, withhold money, or rely on another state’s rules without checking local law.",
    supportUrl: "https://nalsa.gov.in/",
    supportLabel: "NALSA legal-aid information"
  },
  realestate: {
    summary: "A delayed or defective property does not automatically mean that filing a complaint is the best first move. Clarify your goal, verify the project record, and build a dated evidence trail.",
    firstSteps: [
      "Choose the outcome you want first: a written construction / handover timeline, repair, account statement, refund discussion, or explanation of a change.",
      "Compare the agreement’s possession date, extension clauses, specifications, and promised remedies with the builder’s latest written updates.",
      "Check the project’s registration and public disclosures on the relevant state RERA website. Save dated copies of the information you rely on.",
      "Write to the builder’s grievance contact with a short chronology, specific questions, requested action, and a reasonable reply date.",
      "If the response is inadequate, compare the state RERA conciliation / guidance options and independent legal advice. The best route depends on the agreement and facts."
    ],
    keepEvidence: ["Builder-buyer agreement and addenda", "Payment ledger, receipts, and loan statements", "Brochures, promised dates, emails, site photographs, and status-page screenshots"],
    avoid: "Do not rely only on social-media posts, verbal assurances, or a generic online template. Avoid signing revised terms or waivers before understanding their effect.",
    supportUrl: "https://www.india.gov.in/",
    supportLabel: "Find official government services"
  },
  workplace: {
    summary: "Create a clear record of what is owed and what was agreed. Start with a written payroll or HR request, then check which labour authority applies to your role and workplace.",
    firstSteps: [
      "Make a month-by-month calculation of salary, leave, reimbursement, or settlement amounts you believe are outstanding.",
      "Email HR or payroll with the calculation, the relevant dates, and a request for an itemized response and payment timeline.",
      "Save your contract, payslips, bank entries, attendance or work records, and any resignation or termination communication.",
      "If unresolved, check the appropriate state or central labour channel. Worker classification and applicable remedies can depend on the facts."
    ],
    keepEvidence: ["Offer letter and employment terms", "Payslips and bank credits", "HR emails, attendance records, and exit documents"],
    avoid: "Do not share employer documents or personal identifiers publicly. Check the right authority for your role before submitting a claim.",
    supportUrl: "https://samadhan.labour.gov.in/",
    supportLabel: "Labour dispute information (SAMADHAN)"
  },
  contracts: {
    summary: "Before escalating a payment dispute, verify the amount, due date, acceptance terms, and the other party’s stated reason for not paying.",
    firstSteps: [
      "Reconcile the contract or purchase order against invoices, delivery records, milestones, and payments already received.",
      "Send a concise written statement of account asking the other party to identify any disputed item and provide a payment date.",
      "Keep all negotiation in writing and consider a neutral mediation conversation where appropriate.",
      "If you are an eligible micro or small enterprise, check the current MSME delayed-payment process; otherwise ask a local adviser which route fits the contract."
    ],
    keepEvidence: ["Signed contract, purchase order, or accepted quotation", "Invoices and proof of delivery / work acceptance", "Payment ledger and written acknowledgements"],
    avoid: "Do not assume that a cheque, invoice, or informal message guarantees a particular legal outcome. Check limitation periods with a qualified adviser.",
    supportUrl: "https://samadhaan.msme.gov.in/",
    supportLabel: "MSME Samadhaan information"
  },
  ip: {
    summary: "For a brand, creative work, or suspected copying, preserve dated evidence and identify exactly what right or use is in question before sending a demand.",
    firstSteps: [
      "Save original files, drafts, publication dates, registration records, and examples of the other party’s use.",
      "Search the relevant public register and identify the exact mark, work, product, or use you want reviewed.",
      "Keep a neutral timeline of discovery and communications. Avoid public accusations while the facts are being checked.",
      "For a dispute, potential infringement, or filing decision, seek advice from an IP professional; rights and remedies vary by work and facts."
    ],
    keepEvidence: ["Original dated files and publication history", "Registration or application records", "Screenshots and URLs showing the disputed use"],
    avoid: "Do not upload confidential source files or unpublished work to public forums. A search result alone does not establish infringement or ownership.",
    supportUrl: "https://ipindia.gov.in/",
    supportLabel: "IP India official information"
  },
  legalaid: {
    summary: "If cost is a barrier, check eligibility for free legal services before paying for advice. State Legal Services Authorities can explain local application options.",
    firstSteps: [
      "Write a one-page timeline: what happened, when, who was involved, and what help you need.",
      "Collect relevant notices, agreements, and identity or eligibility documents, but share them only through official channels.",
      "Contact NALSA or your State Legal Services Authority to check eligibility and the next step.",
      "Ask about legal aid, advice, mediation, or Lok Adalat suitability; these are different options and not every dispute fits each one."
    ],
    keepEvidence: ["Short dated chronology", "Relevant agreements, notices, and correspondence", "Only the eligibility documents requested by the official service"],
    avoid: "Do not send Aadhaar, bank details, or sensitive papers to unverified social-media accounts claiming to offer free legal aid.",
    supportUrl: "https://nalsa.gov.in/",
    supportLabel: "NALSA official information"
  }
};
