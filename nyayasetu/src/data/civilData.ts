export interface StatePortal {
  state: string;
  portalName: string;
  url: string;
  note: string;
}

export interface CivilCategory {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  bareAct: string;
  indiaCodeUrl: string;
  laypersonReadiness: "Very High (Self-Filing)" | "High (Guided Filing)" | "Moderate (Template + Review)";
  nationalPortal: {
    name: string;
    url: string;
    jurisdictionAndFee: string;
    steps: string[];
    documents: string[];
  };
  statePortals: StatePortal[];
}

export const STATES = ["Karnataka", "Maharashtra", "Delhi", "Tamil Nadu", "Uttar Pradesh", "All India (Default)"];

export const CIVIL_CATEGORIES: CivilCategory[] = [
  {
    id: "consumer", title: "Consumer & E-Commerce", shortTitle: "Consumer",
    description: "Defective products, refused refunds, service deficiency, airline/hotel disputes, and overcharging.",
    bareAct: "Consumer Protection Act, 2019",
    indiaCodeUrl: "https://www.indiacode.nic.in/handle/123456789/15256",
    laypersonReadiness: "Very High (Self-Filing)",
    nationalPortal: {
      name: "e-Jagriti Portal (Unified Consumer Filing)", url: "https://e-jagriti.gov.in/",
      jurisdictionAndFee: "District Commission: Claims up to ₹50 Lakh (₹0 filing fee up to ₹5 Lakh). State: ₹50L–₹2 Cr. National: >₹2 Cr.",
      steps: [
        "Send a written grievance/notice to the seller and wait 15–30 days for response.",
        "Register as a 'Consumer' on e-Jagriti using Mobile OTP and ID proof.",
        "Select District/State Commission based on claim value and enter Opposite Party address.",
        "Upload PDF copies (max 5 MB each) of Index, List of Dates, Complaint, Notarized Affidavit, and Invoices.",
        "Pay nominal fee (if claim > ₹5 Lakh) via BharatKosh and track hearing dates online."
      ],
      documents: ["Tax Invoice / Purchase Receipt", "Proof of Payment (UPI/Bank/Card statement)", "Written Complaint Emails / Chats with Seller", "ID Proof (PAN / Voter ID / Driving Licence)", "Notarized Verification Affidavit (PDF)"]
    },
    statePortals: [
      { state: "Karnataka", portalName: "Karnataka State Consumer Disputes Redressal Commission", url: "https://e-jagriti.gov.in/", note: "Select Karnataka -> District Commission on e-Jagriti." },
      { state: "Maharashtra", portalName: "Maharashtra State Consumer Commission (e-Jagriti)", url: "https://e-jagriti.gov.in/", note: "Select Maharashtra -> Mumbai/Pune/District Commission." },
      { state: "Delhi", portalName: "Delhi State Consumer Commission (e-Jagriti)", url: "https://e-jagriti.gov.in/", note: "File online via e-Jagriti; physical scrutiny at Vikas Bhawan if required." }
    ]
  },
  {
    id: "rental", title: "Rental Agreements & Tenancy", shortTitle: "Rental & Housing",
    description: "Withheld security deposit, illegal eviction threats, rent agreement breach, and landlord/tenant maintenance disputes.",
    bareAct: "Transfer of Property Act, 1882 & Model Tenancy Act",
    indiaCodeUrl: "https://www.indiacode.nic.in/handle/123456789/2338",
    laypersonReadiness: "Moderate (Template + Review)",
    nationalPortal: {
      name: "eCourts e-Filing Portal (Civil / Rent Courts)", url: "https://filing.ecourts.gov.in/",
      jurisdictionAndFee: "Filed in the local Civil Court / Rent Controller having jurisdiction over the rented property address.",
      steps: ["Review your signed Rental Agreement notice period and deposit refund clauses.", "Send a formal Legal Notice via Registered Post AD / Email giving 15 days to refund deposit.", "Register as a 'Litigant' via JanParichay / Meri Pehchaan on eCourts e-Filing.", "Select your State and District Court, upload Plaint/Petition, e-Sign via Aadhaar, and pay state court fee."],
      documents: ["Signed / Registered Rent or Lease Agreement", "Bank Transfer Proofs of Security Deposit & Rent", "Handover Checklist / Photos of Property Condition", "Copy of Written Notice & Postal Tracking Receipt"]
    },
    statePortals: [
      { state: "Karnataka", portalName: "Kaveri Online Services (Registration) & eCourts Karnataka", url: "https://kaveri.karnataka.gov.in/", note: "Verify e-Stamp/Agreement registration on Kaveri; file recovery suit via filing.ecourts.gov.in." },
      { state: "Maharashtra", portalName: "Maharashtra Leave & License e-Registration / Rent Authority", url: "https://efilingigr.maharashtra.gov.in/", note: "Registered Leave & License agreements allow summary eviction/recovery before Competent Authority." },
      { state: "Tamil Nadu", portalName: "TN Tenancy Portal (TNRRRLT Act)", url: "https://www.tenancy.tn.gov.in/", note: "Mandatory registration of tenancy agreements and online Rent Authority dispute filing." },
      { state: "Uttar Pradesh", portalName: "UP Rent Authority / eCourts UP", url: "https://filing.ecourts.gov.in/", note: "Governed by UP Regulation of Urban Premises Tenancy Act, 2021." }
    ]
  },
  {
    id: "realestate", title: "Property & RERA Delays", shortTitle: "Property & RERA",
    description: "Builder possession delay, failure to execute sale deed, structural defects, and unapproved layout changes.",
    bareAct: "Real Estate (Regulation and Development) Act, 2016",
    indiaCodeUrl: "https://www.indiacode.nic.in/handle/123456789/2158",
    laypersonReadiness: "High (Guided Filing)",
    nationalPortal: {
      name: "State RERA Adjudication Portals (via India.gov Directory)", url: "https://www.india.gov.in/",
      jurisdictionAndFee: "Filed on the specific State RERA portal where the housing project is registered (Typical fee: ₹1,000–₹5,000).",
      steps: ["Verify the project's RERA Registration Number on your State RERA website.", "Create a Complainant login on the State RERA portal.", "Fill Form M (RERA Authority) for possession/interest or Form N (Adjudicating Officer) for compensation.", "Upload Builder-Buyer Agreement, payment receipts, and pay fee online."],
      documents: ["Registered Agreement for Sale / Allotment Letter", "Payment Receipts & Bank Loan Sanction Letter", "Builder Brochure / Possession Date Commitments", "RERA Project Registration Number"]
    },
    statePortals: [
      { state: "Karnataka", portalName: "K-RERA (Karnataka RERA)", url: "https://rera.karnataka.gov.in/", note: "Click 'Complaint Registration' -> Login as Citizen to file Form M or N." },
      { state: "Maharashtra", portalName: "MahaRERA", url: "https://maharera.maharashtra.gov.in/", note: "One of India's most active online RERA conciliation and adjudication portals." },
      { state: "Delhi", portalName: "RERA NCT of Delhi", url: "https://rera.delhi.gov.in/", note: "Online complaint filing under 'Complainant Login'." },
      { state: "Tamil Nadu", portalName: "TNRERA", url: "https://rera.tn.gov.in/", note: "Supports online Form-M and Form-N submissions." },
      { state: "Uttar Pradesh", portalName: "UP RERA", url: "https://www.up-rera.in/", note: "Online complaint filing and e-Courts virtual hearing support." }
    ]
  },
  {
    id: "workplace", title: "Workplace, Salary & Labour", shortTitle: "Workplace & Wages",
    description: "Unpaid salary, delayed Full & Final (FnF) settlement, illegal termination, PF withdrawal blocks, and gratuity denial.",
    bareAct: "Payment of Wages Act, 1936 & Industrial Disputes Act, 1947",
    indiaCodeUrl: "https://www.indiacode.nic.in/handle/123456789/2402",
    laypersonReadiness: "High (Guided Filing)",
    nationalPortal: {
      name: "SAMADHAN Portal (Ministry of Labour & Employment)", url: "https://samadhan.labour.gov.in/",
      jurisdictionAndFee: "₹0 filing fee. Handled by Central/State Labour Commissioners for conciliation and wage claims.",
      steps: ["Send a formal HR/Payroll email demanding unpaid dues with exact calculation.", "Visit samadhan.labour.gov.in and register using mobile OTP (also accessible via UMANG app).", "Select 'Raise Dispute / Claim', enter employer establishments details, and upload offer/payslip proofs.", "Attend the scheduled Labour Conciliation Officer meeting (online/in-person)."],
      documents: ["Offer Letter / Employment Contract", "Last 3 Months Payslips & Bank Salary Credits", "Resignation Acceptance / Termination Letter", "HR Email Trail regarding Unpaid Dues"]
    },
    statePortals: [
      { state: "Karnataka", portalName: "Karmika Karnataka / Labour Department", url: "https://karmika.karnataka.gov.in/", note: "State Shops & Establishments wage claims and labour grievances." },
      { state: "Maharashtra", portalName: "Mahakamgar (Maharashtra Labour Dept)", url: "https://mahakamgar.maharashtra.gov.in/", note: "State labour commissioner conciliation and Shops & Establishments disputes." },
      { state: "Delhi", portalName: "Delhi Labour Department e-District", url: "https://labour.delhi.gov.in/", note: "Online wage and termination grievance portal for Delhi NCT." }
    ]
  },
  {
    id: "contracts", title: "Money Recovery & Contracts", shortTitle: "Contracts & Money",
    description: "Unpaid freelance/vendor invoices, breach of service contract, and civil recovery of loaned money.",
    bareAct: "Indian Contract Act, 1872 & Code of Civil Procedure (Order XXXVII)",
    indiaCodeUrl: "https://www.indiacode.nic.in/handle/123456789/2187",
    laypersonReadiness: "Moderate (Template + Review)",
    nationalPortal: {
      name: "eCourts e-Filing (Civil & Commercial Courts)", url: "https://filing.ecourts.gov.in/",
      jurisdictionAndFee: "District Civil Court (or Commercial Court if business dispute > ₹3 Lakh). Ad-valorem court fee applies.",
      steps: ["Issue a formal Legal Demand Notice specifying principal amount, interest, and 15-day deadline.", "For commercial disputes (>₹3 Lakh), complete mandatory Pre-Institution Mediation via NALSA/State Legal Services.", "Log into filing.ecourts.gov.in via JanParichay, choose Summary Suit (Order XXXVII CPC) if written contract/cheque exists.", "Upload Plaint, Contract, Invoices, e-Sign, and pay court fee online."],
      documents: ["Signed Contract / Purchase Order / Work Agreement", "Unpaid Tax Invoices & Delivery/Work Acceptance Proof", "WhatsApp / Email Acknowledgments of Debt", "Legal Notice & Speed Post Receipt"]
    },
    statePortals: [{ state: "All India (Default)", portalName: "MSME Samadhaan (For Registered Micro/Small Businesses)", url: "https://samadhaan.msme.gov.in/", note: "If you hold an Udyam Registration, file delayed payment claims directly against buyers here." }]
  },
  {
    id: "ip", title: "Creators, Trademarks & IP", shortTitle: "Creators & IP",
    description: "Brand name/logo trademark registration, copyright protection for code/art/books, and infringement opposition.",
    bareAct: "Trade Marks Act, 1999 & Copyright Act, 1957",
    indiaCodeUrl: "https://www.indiacode.nic.in/handle/123456789/1993",
    laypersonReadiness: "High (Guided Filing)",
    nationalPortal: {
      name: "IP India Comprehensive e-Filing Portal", url: "https://ipindia.gov.in/",
      jurisdictionAndFee: "Centralized national jurisdiction. Individuals/Startups/MSMEs get a 50% fee rebate (₹4,500 for Trademark).",
      steps: ["Run a Public Search on ipindiaonline.gov.in to ensure your brand name/logo isn't already taken.", "Register on the IP India e-Filing gateway using Class 3 Digital Signature (DSC).", "Select appropriate NICE Class (1–45), fill Form TM-A (Trademark) or Form XIV (Copyright).", "Pay online fee and track examination reports directly on the dashboard."],
      documents: ["Logo Artwork (JPEG) / Source Code or Manuscript PDF", "Udyam MSME / Startup India Certificate (for 50% fee discount)", "User Affidavit (if claiming prior usage date)", "Class 3 Digital Signature Certificate (DSC)"]
    },
    statePortals: [{ state: "All India (Default)", portalName: "Copyright Office India Portal", url: "https://copyright.gov.in/", note: "Dedicated portal for software, literary, musical, and artistic copyright registration." }]
  },
  {
    id: "legalaid", title: "Free Legal Aid & Lok Adalat", shortTitle: "Free Legal Aid",
    description: "Free government-funded lawyer, pre-litigation mediation, and fast-track Lok Adalat settlement.",
    bareAct: "Legal Services Authorities Act, 1987",
    indiaCodeUrl: "https://www.indiacode.nic.in/handle/123456789/1911",
    laypersonReadiness: "Very High (Self-Filing)",
    nationalPortal: {
      name: "NALSA Legal Aid & Tele-Law Portal", url: "https://nalsa.gov.in/",
      jurisdictionAndFee: "100% Free for Women, Children, SC/ST, Senior Citizens, Persons with Disabilities, and citizens below state income thresholds.",
      steps: ["Visit nalsa.gov.in and click 'Apply for Legal Aid' (or call Helpline 15100).", "Fill personal details, eligibility category, and brief summary of your civil dispute.", "Upload ID proof and income certificate (not required for women/children/SC/ST applicants).", "Get assigned a panel advocate or pre-litigation mediation session automatically."],
      documents: ["Aadhaar / Identity Proof", "Income Certificate (if applying under low-income criteria)", "Caste / Disability Certificate (if applicable)", "Brief Summary of Dispute Documents"]
    },
    statePortals: [
      { state: "Karnataka", portalName: "Karnataka State Legal Services Authority (KSLSA)", url: "https://kslsa.kar.nic.in/", note: "Pre-litigation mediation and National Lok Adalat scheduling in Bengaluru & districts." },
      { state: "Maharashtra", portalName: "Maharashtra State Legal Services Authority", url: "https://legalservices.maharashtra.gov.in/", note: "Online legal aid application and Lok Adalat settlement requests." },
      { state: "Delhi", portalName: "Delhi State Legal Services Authority (DSLSA)", url: "https://dslsa.org/", note: "24x7 Legal Aid Helpline 1516 and online application." }
    ]
  }
];
