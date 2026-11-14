# Velcoris Industries — Website Analysis & Redesign

Task 1 | Independent design study | Reviewed 13 November 2026

## Executive recommendation

Retain the existing site's strong monochrome identity, technical depth and sample enquiry journey. Reorganise the experience around the industrial buyer's decisions: understand the material, identify application fit, inspect relevant evidence, and request a sample. The working concept uses a restrained evergreen and mineral palette, a static carbon-layer illustration, shorter content blocks and contextual calls to action.

This document presents an independent review and working concept. It is not an official company redesign.

## Scope and method

Reviewed the public homepage, Company, Technology, Applications, Media and Contact pages. Direct browser checks covered the homepage, mobile menu, Technology material controls, Applications content and sample-intent Contact route. Desktop and phone viewports were inspected at 1440 × 900 and 390 × 844 respectively. The separate Lite Mode and Careers experiences were outside this review.

This is an expert review, not a user research study. Findings about buyer effort are hypotheses to validate with users. No live enquiry was submitted; delivery, database persistence and response time were not tested. There was no authenticated access, source repository access, field analytics, Lighthouse run or security assessment. Page content can change after the review date.

## Deliverable 1 — Existing website evaluation

### Strengths to preserve

- **Design:** The existing black-and-white treatment, large serif typography and scientific imagery provide a distinctive identity. The redesign need not imply that the current website is unprofessional.
- **Structure:** Company, Technology, Applications, Media and Contact are already clear top-level destinations. A persistent sample action provides a useful conversion route.
- **Technical content:** The Technology page already separates material families and provides interactive specification categories. The review successfully switched from FLG to GO. A recommendation to “add technical information” would ignore what exists.
- **Responsive behaviour:** At the inspected phone width, the homepage stacks its content and presents a labelled expandable menu. Opening the menu exposed the principal destinations and a sample request action. No horizontal page overflow was detected in the inspected phone Technology state (386 px document width within a 390 px viewport).
- **Enquiry flow:** The sample-intent Contact route changes its form heading and guidance after the page settles. It already preserves some entry context. The live form exposes name, email, optional phone and message fields.
- **Accessibility foundations:** The site exposes a skip link, heading structure, labelled form controls and named interactive controls. Their presence is a strength, not proof of full accessibility compliance.

### Findings and recommended changes

Priorities below describe the proposed implementation order, not measured business impact. P1 means resolve before a production redesign; P2 means an improvement to validate and refine.

**F1 / P1 — Clarify the application model's output.**

On Applications, the visible default model displays a water-penetration reduction value of 150%. A conventional percentage reduction against a non-negative baseline cannot exceed 100%; the interface may instead mean a different functional gain. The label, denominator and computation therefore need technical review. This observation does not establish that the underlying material result is false. Publish the definition, test conditions, source and model limitations, or replace the predictive interface until validated. The prototype uses qualitative evaluation prompts rather than calculated gains. [S3]

**F2 / P1 — Bring evidence alongside purchase-relevant claims.**

Large market, pricing and performance assertions are prominent, while the inspected copy does not place an independently inspectable source or test report next to each figure. Add source date, comparison basis, grade and test conditions where relevant. Distinguish company-reported claims, material properties and end-product test outcomes. Do not generalise ideal single-layer properties to every supplied product. The prototype does not repeat the homepage's numerical assertions. [S1, S2, S3]

**F3 / P2 — Surface materials and documentation earlier.**

The homepage leads with a long brand and science narrative. Specific material evaluation and documentation require further exploration. That can create effort for engineers arriving with a defined brief. Put a Materials entry in navigation, show the two families early, and group technical documents under Resources. Preserve the deeper technology content for visitors who need it. The prototype's material selector and evidence section demonstrate this route. [S1, S2]

**F4 / P2 — Reduce repetition and visual motion.**

The homepage revisits cost, scale, sustainability and domestic supply across several sections. Repeated announcement text also appears in the accessibility representation. Consolidate the commercial story, use one static rebrand notice, and review whether repeated decorative copies should be hidden from assistive technology. Respect reduced-motion preferences and offer a pause control for any retained automatic motion. Motion-related performance and accessibility failures were not measured. The prototype has no autoplay or marquee. [S1, R4]

**F5 / P2 — Qualify enquiries without making the form heavy.**

The live sample route changes its heading, but its visible fields do not ask for enquiry category or material family. Those details can be buried in free text. Add enquiry purpose, an optional material choice and a concise application prompt; prefill relevant context from the preceding action. Keep organisation optional. Measure whether the extra choices improve routing without reducing completion. The prototype demonstrates this; it does not promise faster company response. [S4, R3]

**F6 / P2 — Make mobile scanning more efficient.**

The existing phone layout is responsive. The improvement is task prioritisation: a long vertical story delays access to deeper buyer information. Use concise section titles, visible material choices and an in-page route to documents and enquiry. Use full-width, comfortably sized controls where needed. Avoid making scientific demonstrations a prerequisite for basic navigation. Validate the new structure at narrow widths and with zoom, rather than describing the existing site as “not mobile friendly.” [S1, S2]

**F7 / P2 — Improve provenance of visual and supporting evidence.**

The Media page offers category filters and a large image archive. Improve its utility with dates, event context, descriptive captions and links to supporting primary evidence. Distinguish facility photography, stock illustration and scientific characterisation. A logo or appearance in an event photograph should not imply certification or a customer relationship. The prototype links to the original company pages and uses an explicitly conceptual lattice illustration. [S5]

**F8 / P2 — Complete accessibility and content checks.**

Validate keyboard focus, mobile menu dismissal, selected states, form errors, contrast, zoom/reflow and reduced motion. The inspected Technology page also uses lower-level headings within process controls; review the outline for a logical hierarchy. The live site's existing labels and skip link should be preserved. No WCAG conformance claim is made from this limited inspection. [S2, R3, R4]

## Deliverable 2 — Proposed improvements

### Information architecture

For the prototype, a single responsive page demonstrates the core journey. A production website can expand the same structure into dedicated pages:

1. **Home:** Clear industrial proposition, materials, application routes, evidence and one principal sample action.
2. **Materials:** Family overview; separate FLG and GO detail pages with reviewed specifications and grade selection.
3. **Applications:** Commercial evaluation pathways separated from exploratory R&D. Each page should explain the challenge, evidence, limitations and next step.
4. **Technology:** Process overview, quality assurance, characterisation and approved sustainability evidence.
5. **Company:** History, people, location, verified milestones and careers.
6. **Resources:** Approved technical datasheets, safety data, dated case studies and evaluation guidance.
7. **Contact / Sample request:** Context-preserving form, direct contact alternatives and a clear post-submission state.

Media can sit under Company or Resources. Keep its existing URL through a redirect if the production structure changes. Do not remove useful content solely to shorten navigation.

### Proposed buyer journey

Landing proposition → material family → application evaluation brief → technical evidence → contextual enquiry → confirmation.

The journey supports two assumed audiences: an engineer seeking technical fit and a procurement visitor seeking a credible supply conversation. It allows visitors who already know their need to go directly to the form.

### Content and interface specification

- Lead with what the company provides and who it serves. Keep the rebrand explanation concise.
- Present material properties with grade, units, test method, date and document revision. Make approved documents available in a consistent resource area; do not fabricate downloads while they are unavailable.
- Replace broad superlatives with claims supported by traceable evidence. Label illustrative science and exploratory applications.
- Use readable body copy, restrained typography and sufficient spacing. Reserve one accent colour for emphasis and clear selection states.
- Keep the primary sample action consistent. Documentation requests should retain their enquiry purpose; material and application actions should carry useful context.
- Provide field instructions, visible required markers, native validation and a clear confirmation. Include a production privacy notice once data handling is defined.
- Load appropriately sized images, avoid unnecessary animation and preserve a lightweight baseline. Proposed production performance targets are LCP ≤2.5 seconds, INP ≤200 ms and CLS ≤0.1 at the 75th percentile; these are targets, not measured results of either site. [R5]

### Prioritisation and validation

**First:** Resolve F1, review claims and obtain approved technical documents. Confirm the intended audiences and the company's actual enquiry-handling process.

**Then:** Test the new navigation and material-to-enquiry journey with representative engineers and procurement visitors. Suggested tasks: find a suitable family to discuss, locate the documentation route, and prepare a sample enquiry. Record completion, hesitation, errors and questions rather than inventing user satisfaction scores.

**Before release:** Conduct accessibility testing, real-device and browser checks, content approval, redirect checks and performance measurement. Track enquiry starts/completions only after a privacy-reviewed analytics plan. Set any conversion improvement target after establishing the existing baseline.

## Deliverable 3 — Basic working prototype

The `prototype/dist` folder contains the complete buildless website. It can be opened from `index.html` or served by a static web server. It uses HTML, CSS and vanilla JavaScript, with no package installation or third-party runtime dependency.

### Implemented interactions

- Responsive navigation with expanded state, link dismissal and Escape dismissal.
- Material selector that changes overview content and carries the selected material into its enquiry action.
- Application selector that changes evaluation guidance and can prefill an application brief.
- Enquiry-purpose preselection from sample and documentation calls to action.
- Downloadable, clearly labelled independent evaluation checklist.
- Expandable questions and links to original company sources.
- Required field, email, message-length and demo acknowledgement validation.
- Enquiry preview with entered values and an Edit action that preserves the form data.
- Keyboard focus styling, a skip link, semantic landmarks, selected-state attributes and reduced-motion handling.

### Deliberate scope boundary

This Task 1 form previews an enquiry only. It does not send email, call the company, persist data in a browser store, or write to a backend database. The demo receipt states this clearly. Task 2 will add the real database write and stored-query viewing functionality to this same project, with server validation and suitable access control. A client-side receipt is not evidence of a successful backend submission.

The design uses a typographic concept wordmark and original SVG illustration; neither represents a newly approved company brand asset. No fabricated customer logos, testimonials, batch certificates or downloadable official datasheets are included.

## Deliverable 4 — Reasoning, design references and assumptions

### Design decisions and rationale

**D1 / Evidence-led hierarchy:** Materials and application intent appear ahead of lengthy corporate storytelling. This supports a visitor evaluating fit, while direct links retain access to the original detail. Linked findings: F2, F3 and F6.

**D2 / Evergreen, mineral and carbon palette:** Dark green and pale mineral backgrounds create a restrained industrial-science concept with clear visual contrast. This is a proposed departure from the original monochrome palette, requiring brand approval. The original site's confidence and spaciousness remain useful references.

**D3 / Static layered lattice:** The visual communicates the material theme without stock factory imagery or an autoplay scientific demonstration. Its caption states that it is conceptual and not to scale. It does not claim to depict actual microscopy or Velcoris production. Linked findings: F4 and F7.

**D4 / Two material choices:** Visible alternatives let a buyer compare starting points without promising a definitive material recommendation. The technical team must confirm compatibility and specifications. Linked finding: F3.

**D5 / Evaluation prompts instead of predicted gains:** Application content asks for the matrix, processing route and test criteria. This encourages a useful technical enquiry while the numerical model is reviewed. Linked findings: F1 and F2.

**D6 / Contextual, short form:** Purpose and selected material reduce repetition for a visitor, while organisation remains optional. The receipt is explicit about demo status. Linked finding: F5.

### References and what was adapted

- **Hexcel [R1]:** Reference for separating product families, markets and technical resources. Adapted the organising principle, not its branding, wording or full enterprise menu.
- **BASF product/industry navigation [R2]:** Reference for entering a materials portfolio through an industry need. Adapted this into four concise application pathways.
- **W3C WAI Forms Tutorial [R3]:** Reference for visible labels, instructions, validation and user notifications. The prototype applies these foundations; complete assistive-technology testing remains necessary.
- **W3C motion guidance [R4]:** Reference for avoiding nonessential movement and respecting motion preferences. Its interaction-animation criterion is Level AAA; it is not presented here as an AA conformance requirement. Automatic movement also needs a separate pause/stop/hide review.
- **web.dev Core Web Vitals [R5]:** Reference for proposed performance acceptance thresholds. No scores or measured gains are claimed.

### Assumptions to confirm

- A1: Engineers, R&D teams and industrial procurement are the principal users; this is inferred from the existing messaging, not validated research.
- A2: FLG and GO remain appropriate public material-family labels. Product availability, grade details and application suitability must be confirmed by the company.
- A3: The public company contact information is appropriate to retain. No response-time promise has been added to the concept.
- A4: Approved datasheets, safety documentation and test evidence can be supplied for production use. The prototype does not imply that these files were inspected or independently certified.
- A5: A one-page concept is sufficient to demonstrate the basic working redesign. A production site would keep dedicated detail pages and redirect old URLs where necessary.
- A6: The proposed palette, wordmark treatment, copy and illustration require company review. They are design proposals, not verified corporate assets.
- A7: The form's preview-only behaviour is appropriate for Task 1. It must not be submitted as completed Task 2 query management.

## Source register

All references accessed 13 November 2026. Company statements are treated as company-reported information, not independently established product evidence.

- S1 — Velcoris homepage: https://velcorisindustries.com/
- S2 — Technology: https://velcorisindustries.com/technology
- S3 — Applications: https://velcorisindustries.com/applications
- S4 — Contact and sample route: https://velcorisindustries.com/contact?intent=sample
- S5 — Media: https://velcorisindustries.com/media
- S6 — Company: https://velcorisindustries.com/company
- R1 — Hexcel: https://www.hexcel.com/
- R2 — BASF products: https://www.basf.com/global/en/products
- R3 — W3C WAI forms: https://www.w3.org/WAI/tutorials/forms/
- R4 — W3C interaction animation: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
- R5 — Core Web Vitals: https://web.dev/articles/vitals

See `Verification.md` for the completed checks and remaining limits.
