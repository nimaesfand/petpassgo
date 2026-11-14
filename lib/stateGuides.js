// State guides: ESA, service dog and psychiatric service dog rules, in plain words,
// with the official source for each. Federal rules apply in every state; each
// state adds its own. Written from primary sources; checked dates are shown.

export const GUIDES_CHECKED = "November 13, 2026";

const ADA_FAQ = "https://www.ada.gov/resources/service-animals-faqs";
const DOT_RULE = "https://www.transportation.gov/individuals/aviation-consumer-protection/service-animals";
const HUD_2026 = "https://dredf.org/huds-esa-policy-reversal/";

export const FEDERAL = {
  serviceDog: {
    title: "Service dogs, including psychiatric service dogs",
    points: [
      "A service dog is a dog individually trained to do work or tasks for a person with a disability. A psychiatric service dog is a service dog, as long as it's trained to do a task, like interrupting a panic attack.",
      "No certificate, registration, ID card or vest is required. Online registrations give no legal rights.",
      "Where it isn't obvious, staff can ask only two things: is the dog needed because of a disability, and what task is it trained to do. They can't ask for papers or a demonstration.",
      "You can train the dog yourself.",
    ],
    source: ADA_FAQ,
  },
  flying: {
    title: "Flying",
    points: [
      "Since 2021, U.S. airlines treat emotional support animals as pets: pet rules, a carrier and a pet fee apply.",
      "Trained service dogs, including psychiatric service dogs, fly in the cabin at no charge. Airlines can ask for the U.S. DOT Service Animal Air Transportation Form.",
    ],
    source: DOT_RULE,
  },
  housing: {
    title: "Housing (federal)",
    points: [
      "On May 22, 2026, HUD withdrew its earlier guidance on assistance animals. HUD now uses a training standard when it reviews complaints, so a request for an untrained emotional support animal is no longer presumed reasonable at the federal level.",
      "The Fair Housing Act itself didn't change, and state laws still apply. Some states protect emotional support animals in housing on their own.",
    ],
    source: HUD_2026,
  },
};

export const FEDERAL_TRUTHS = [
  { claim: "A registration or ID card makes my dog a service dog.", true: false, why: "Training makes a service dog. Registrations and ID cards give no rights under federal law." },
  { claim: "An ESA letter lets my dog fly in the cabin for free.", true: false, why: "Not since 2021. Emotional support animals fly as pets, with the airline's pet fee and carrier rules." },
  { claim: "A psychiatric service dog counts as a real service dog.", true: true, why: "Yes, if it's trained to perform a task for the person's disability. Comfort alone isn't a task." },
  { claim: "A store can ask to see my service dog's papers.", true: false, why: "Staff can only ask whether the dog is needed for a disability and what task it's trained to do." },
  { claim: "I can train my own service dog.", true: true, why: "Federal law doesn't require a professional trainer or program." },
];

export const STATES = [
  {
    slug: "california",
    name: "California",
    airports: ["LAX", "SFO", "SAN", "SJC", "OAK", "SMF"],
    summary: "California has some of the strictest emotional support dog letter rules in the U.S., and faking a service dog is a crime.",
    rules: [
      {
        title: "ESA letters: a 30-day relationship first",
        body: "Since January 1, 2022, a health care practitioner can only write documentation for an emotional support dog if they're licensed where you are, have had a client relationship with you for at least 30 days, have done a clinical evaluation, and have warned you that misrepresenting a service dog is a crime. There's an exception to the 30-day rule for people verified as homeless.",
        source: "https://www.bbs.ca.gov/pdf/faq_emotional_dog.pdf",
        law: "Health and Safety Code §122318",
      },
      {
        title: "Selling ESA certificates and vests comes with a warning",
        body: "Anyone who sells or gives out a certificate, ID, tag, vest, leash or harness for an emotional support animal must give written notice that it doesn't give the animal service-dog rights. Breaking that rule carries civil penalties of $500, then $1,000, then $2,500.",
        source: "https://www.bbs.ca.gov/pdf/agen_notice/2021/20210909_10_xvi.pdf",
        law: "AB 468 (2021)",
      },
      {
        title: "Faking a service dog is a misdemeanor",
        body: "Knowingly and fraudulently claiming your dog is a guide, signal or service dog can mean up to six months in county jail, a fine of up to $1,000, or both.",
        source: "https://law.justia.com/codes/california/2013/code-pen/part-1/title-9/chapter-12/section-365.7/",
        law: "Penal Code §365.7",
      },
      {
        title: "Housing: state law still covers support animals",
        body: "California's own fair housing law recognizes support animals, separate from the federal changes in 2026. A letter that doesn't meet the 30-day rule can be questioned.",
        source: "https://www.bbs.ca.gov/pdf/agen_notice/2021/20210707_vii.pdf",
        law: "Fair Employment and Housing Act",
      },
    ],
    truths: [
      { claim: "An online ESA letter from a provider I just met is valid in California.", true: false, why: "The provider must have a client relationship with you for at least 30 days first." },
      { claim: "Buying a service dog vest online is fine if my dog is an ESA.", true: false, why: "Presenting an emotional support dog as a service dog is a misdemeanor in California." },
    ],
  },
  {
    slug: "texas",
    name: "Texas",
    airports: ["DFW", "IAH", "AUS", "SAT", "DAL", "HOU", "ELP"],
    summary: "Texas raised the penalty for passing off a pet as a service or assistance animal in 2023.",
    rules: [
      {
        title: "Faking a service or assistance animal: up to $1,000",
        body: "Since September 1, 2023, it's a misdemeanor to knowingly claim your animal is an assistance or service animal when it isn't specially trained or equipped to help a person with a disability. The penalty is a fine of up to $1,000 plus 30 hours of community service, to be done within a year.",
        source: "https://capitol.texas.gov/tlodocs/88R/billtext/html/HB04164F.htm",
        law: "Human Resources Code §121.006",
      },
      {
        title: "Neglecting a service animal",
        body: "A person who habitually abuses or neglects to care for their assistance or service animal can have the animal seized.",
        source: "https://capitol.texas.gov/tlodocs/88R/billtext/html/HB04164F.htm",
        law: "Human Resources Code §121.006(b)",
      },
      {
        title: "Housing: federal rules, changed in 2026",
        body: "For emotional support animals in housing, Texans mainly rely on the federal Fair Housing Act. Since HUD's May 2026 change, an untrained ESA is no longer presumed allowed in federal complaints, so landlords have more room to say no.",
        source: HUD_2026,
        law: "Fair Housing Act",
      },
    ],
    truths: [
      { claim: "Faking a service dog in Texas is just a small ticket.", true: false, why: "It's a misdemeanor with a fine of up to $1,000 and 30 hours of community service." },
    ],
  },
  {
    slug: "florida",
    name: "Florida",
    airports: ["MCO", "MIA", "FLL", "TPA", "JAX", "RSW", "PBI"],
    summary: "Florida protects emotional support animals in housing under its own law, and punishes fake letters and fake service dogs.",
    rules: [
      {
        title: "Housing: Florida law protects ESAs",
        body: "Florida law bars housing discrimination against people with a disability-related need for an emotional support animal. If the need isn't obvious, a landlord can ask for reliable information that supports it, and that information should come from a practitioner with personal knowledge of you. This is separate from the federal changes in 2026.",
        source: "https://flrules.org/gateway/statute.asp?id=760.27",
        law: "Florida Statutes §760.27",
      },
      {
        title: "Practitioners need personal knowledge",
        body: "Florida law stops health care practitioners from providing information about a person's need for an emotional support animal without personal knowledge of that person's disability.",
        source: "https://flsenate.gov/Session/Bill/2020/209/BillText/c3/PDF",
        law: "Florida Statutes §456.072",
      },
      {
        title: "Fake ESA documents are a crime",
        body: "Falsifying documentation for an emotional support animal, or knowingly misrepresenting a disability-related need for one, is a second-degree misdemeanor.",
        source: "https://www.legalreader.com/?p=20732711",
        law: "Florida Statutes §817.265",
      },
      {
        title: "Faking a service dog is a crime too",
        body: "Knowingly misrepresenting an animal as a service animal is a second-degree misdemeanor, and comes with 30 hours of community service.",
        source: "https://www.legalreader.com/?p=20732711",
        law: "Florida Statutes §413.08(9)",
      },
    ],
    truths: [
      { claim: "An online ESA certificate is enough for a Florida landlord.", true: false, why: "Florida expects information from a practitioner with personal knowledge of your disability." },
      { claim: "ESAs still have housing rights in Florida after HUD's 2026 change.", true: true, why: "Florida's own ESA housing law wasn't changed by HUD's federal memo." },
    ],
  },
  {
    slug: "new-york",
    name: "New York",
    airports: ["JFK", "LGA", "EWR", "BUF", "ALB", "ROC", "SYR"],
    summary: "New York makes it unlawful to put a fake service, therapy or emotional support tag on a dog.",
    rules: [
      {
        title: "A fake service dog tag is a violation",
        body: "Since December 18, 2017, it's unlawful to knowingly put a false or improper ID tag on a dog that marks it as a guide, service, therapy or hearing dog. It's handled as a violation under the state's dog licensing law.",
        source: "https://www.nysenate.gov/legislation/laws/AGM/118",
        law: "Agriculture and Markets Law §118(1)(c)",
      },
      {
        title: "Real service dogs don't need a tag or vest",
        body: "Under the ADA, a service dog doesn't have to wear a vest, patch or tag, and a business can't ask for an ID card or training papers. It can only ask if the dog is needed because of a disability and what task it's trained to do.",
        source: ADA_FAQ,
        law: "Americans with Disabilities Act",
      },
      {
        title: "Housing: federal rules, changed in 2026",
        body: "For emotional support animals in housing, the federal Fair Housing Act applies. Since HUD's May 2026 change, an untrained ESA is no longer presumed allowed in federal complaints, so check your building's own policy before you move.",
        source: HUD_2026,
        law: "Fair Housing Act",
      },
    ],
    truths: [
      { claim: "A service dog tag I bought online makes my dog a service dog in New York.", true: false, why: "Putting a false service, therapy or ESA tag on a dog is unlawful in New York. Training makes a service dog, not a tag." },
      { claim: "A New York store can ask for my service dog's certificate.", true: false, why: "Businesses can only ask two questions, and can't ask for papers or an ID card." },
    ],
  },
  {
    slug: "illinois",
    name: "Illinois",
    airports: ["ORD", "MDW", "PIA", "MLI", "BMI"],
    summary: "Illinois says an online ESA certificate bought without a real assessment isn't enough for housing.",
    rules: [
      {
        title: "ESA letters need a real relationship",
        body: "Since January 1, 2020, documentation for an assistance animal in housing must be in writing, come from someone with a therapeutic relationship with you, and describe your disability-related need for the animal.",
        source: "https://ilga.gov/legislation/ilcs/ilcs3.asp?ActID=4031",
        law: "Assistance Animal Integrity Act, 310 ILCS 120/10",
      },
      {
        title: "Online certificates don't count",
        body: "A certificate or registration that claims you need an animal without a meaningful assessment of you doesn't meet the law. A landlord can deny a request based only on that, and can check whether documentation is real.",
        source: "https://ilga.gov/ftp/Public%20Acts/101/101-0518.htm",
        law: "Public Act 101-0518",
      },
      {
        title: "No special insurance for an assistance animal",
        body: "A housing provider can't make you buy special liability insurance for an approved assistance animal, and you don't have to share a specific diagnosis.",
        source: "https://law.justia.com/codes/illinois/chapter-310/act-310-ilcs-120/",
        law: "310 ILCS 120/10(f)-(g)",
      },
    ],
    truths: [
      { claim: "An instant online ESA registration works for an Illinois landlord.", true: false, why: "Illinois requires documentation from someone with a therapeutic relationship with you, not an online certificate." },
      { claim: "Illinois ESA housing rules still apply after HUD's 2026 change.", true: true, why: "The Illinois act and the Illinois Human Rights Act are state law, separate from HUD's federal memo." },
    ],
  },
  {
    slug: "arizona",
    name: "Arizona",
    airports: ["PHX", "TUS", "AZA", "FLG"],
    summary: "Arizona can fine you up to $250 for passing off a pet as a service animal in a public place.",
    rules: [
      {
        title: "Faking a service animal: up to $250 per time",
        body: "Since August 3, 2018, a court or hearing officer can fine anyone who fraudulently misrepresents an animal as a service animal, or one in training, to a business or public place, up to $250 for each violation.",
        source: "https://www.azleg.gov/ars/11/01024.htm",
        law: "A.R.S. §11-1024(K)",
      },
      {
        title: "Emotional support isn't a task",
        body: "Arizona's law says comfort, emotional support and companionship don't count as the work or tasks a service animal must do. An ESA doesn't get public access rights in Arizona.",
        source: "https://www.azleg.gov/ars/11/01024.htm",
        law: "A.R.S. §11-1024",
      },
      {
        title: "Turning away a real service dog is a crime",
        body: "A business or public place that refuses a person with a disability and their service animal can be charged with a class 2 misdemeanor.",
        source: "https://www.azleg.gov/legtext/53leg/2R/summary/H.HB2588_04-18-18_CHAPTERED.DOCX.htm",
        law: "A.R.S. §11-1024",
      },
    ],
    truths: [
      { claim: "My ESA can go into Arizona stores and restaurants.", true: false, why: "Only trained service dogs and miniature horses have public access in Arizona." },
      { claim: "A business can demand my service dog's registration.", true: false, why: "There's no official registry, and businesses can't ask for ID or training papers." },
    ],
  },
];

export function stateBySlug(slug) {
  return STATES.find((s) => s.slug === slug) || null;
}
