// Common dog and cat breeds, plus forgiving matching for misspellings ("daachound" -> Dachshund).
export const DOG_BREEDS = [
  "Mixed breed", "Affenpinscher", "Afghan Hound", "Airedale Terrier", "Akita", "Alaskan Malamute", "American Bulldog", "American Eskimo Dog", "American Pit Bull Terrier", "American Staffordshire Terrier",
  "Anatolian Shepherd", "Australian Cattle Dog", "Australian Shepherd", "Australian Terrier", "Basenji", "Basset Hound", "Beagle", "Bearded Collie", "Bedlington Terrier", "Belgian Malinois",
  "Bernese Mountain Dog", "Bichon Frise", "Bloodhound", "Border Collie", "Border Terrier", "Borzoi", "Boston Terrier", "Bouvier des Flandres", "Boxer", "Boykin Spaniel",
  "Brittany", "Brussels Griffon", "Bull Terrier", "Bulldog", "Bullmastiff", "Cairn Terrier", "Cane Corso", "Cardigan Welsh Corgi", "Cavalier King Charles Spaniel", "Cavapoo",
  "Chesapeake Bay Retriever", "Chihuahua", "Chinese Crested", "Chow Chow", "Cockapoo", "Cocker Spaniel", "Collie", "Coton de Tulear", "Dachshund", "Miniature Dachshund", "Dalmatian",
  "Doberman Pinscher", "Dogo Argentino", "Dogue de Bordeaux", "English Bulldog", "English Setter", "English Springer Spaniel", "French Bulldog", "German Shepherd", "German Shorthaired Pointer",
  "Giant Schnauzer", "Golden Retriever", "Goldendoodle", "Great Dane", "Great Pyrenees", "Greyhound", "Havanese", "Irish Setter", "Irish Wolfhound", "Italian Greyhound",
  "Jack Russell Terrier", "Japanese Chin", "Keeshond", "Labradoodle", "Labrador Retriever", "Lhasa Apso", "Maltese", "Maltipoo", "Mastiff", "Miniature American Shepherd",
  "Miniature Pinscher", "Miniature Schnauzer", "Newfoundland", "Norfolk Terrier", "Norwich Terrier", "Old English Sheepdog", "Papillon", "Pekingese", "Pembroke Welsh Corgi", "Pomeranian",
  "Pomsky", "Poodle", "Miniature Poodle", "Toy Poodle", "Portuguese Water Dog", "Pug", "Puggle", "Rat Terrier", "Rhodesian Ridgeback", "Rottweiler", "Saint Bernard",
  "Samoyed", "Schnauzer", "Scottish Terrier", "Shar Pei", "Shetland Sheepdog", "Shiba Inu", "Shih Tzu", "Siberian Husky", "Silky Terrier", "Soft Coated Wheaten Terrier",
  "Staffordshire Bull Terrier", "Standard Schnauzer", "Toy Fox Terrier", "Vizsla", "Weimaraner", "West Highland White Terrier", "Whippet", "Wirehaired Pointing Griffon", "Xoloitzcuintli", "Yorkshire Terrier", "Yorkipoo",
];
export const CAT_BREEDS = [
  "Domestic Shorthair", "Domestic Medium Hair", "Domestic Longhair", "Mixed breed", "Abyssinian", "American Curl", "American Shorthair", "Balinese", "Bengal", "Birman", "Bombay",
  "British Longhair", "British Shorthair", "Burmese", "Chartreux", "Cornish Rex", "Devon Rex", "Egyptian Mau", "Exotic Shorthair", "Havana Brown", "Himalayan",
  "Japanese Bobtail", "Korat", "LaPerm", "Maine Coon", "Manx", "Munchkin", "Norwegian Forest Cat", "Ocicat", "Oriental Shorthair", "Persian", "Ragamuffin", "Ragdoll",
  "Russian Blue", "Savannah", "Scottish Fold", "Selkirk Rex", "Siamese", "Siberian", "Singapura", "Somali", "Sphynx", "Tonkinese", "Turkish Angora", "Turkish Van",
];

const norm = (s) => String(s || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");

function distance(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    const c = a[i - 1] === b[j - 1] ? 0 : 1;
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
  }
  return d[m][n];
}

// Nicknames and common misspellings people actually type.
const ALIASES = {
  chiwawa: "Chihuahua", chiuaua: "Chihuahua", chihuaua: "Chihuahua", doxie: "Dachshund", weinerdog: "Dachshund", wienerdog: "Dachshund", sausagedog: "Dachshund",
  frenchie: "French Bulldog", yorkie: "Yorkshire Terrier", westie: "West Highland White Terrier", sheltie: "Shetland Sheepdog", aussie: "Australian Shepherd",
  gsd: "German Shepherd", lab: "Labrador Retriever", pitbull: "American Pit Bull Terrier", pittie: "American Pit Bull Terrier", staffy: "Staffordshire Bull Terrier",
  corgi: "Pembroke Welsh Corgi", husky: "Siberian Husky", golden: "Golden Retriever", doodle: "Goldendoodle", berner: "Bernese Mountain Dog", dobie: "Doberman Pinscher",
  schnoodle: "Miniature Schnauzer", tabby: "Domestic Shorthair", dsh: "Domestic Shorthair", dlh: "Domestic Longhair", mutt: "Mixed breed", mix: "Mixed breed",
};

// Best matches for what someone typed. Prefix and word matches first, then close misspellings.
export function suggestBreeds(query, animal = "Dog", limit = 6) {
  const q = norm(query);
  const list = animal === "Cat" ? CAT_BREEDS : animal === "Dog" ? DOG_BREEDS : [...DOG_BREEDS, ...CAT_BREEDS];
  if (!q) return [];
  const scored = [];
  const alias = ALIASES[q];
  if (alias && list.includes(alias)) scored.push([-1, 0, alias]);
  for (const name of new Set(list)) {
    const n = norm(name);
    const words = name.toLowerCase().split(/[\s-]+/).map(norm);
    let score;
    if (n === q) score = 0;
    else if (n.startsWith(q)) score = 1;
    else if (words.some((w) => w.startsWith(q))) score = 2;
    else if (n.includes(q)) score = 3;
    else {
      const best = Math.min(distance(q, n), ...words.map((w) => Math.min(distance(q, w), distance(q, w.slice(0, q.length)))), distance(q, n.slice(0, q.length + 1)));
      const allowed = q.length <= 5 ? 1 : q.length <= 8 ? 2 : 3;
      if (best <= allowed) score = 4 + best;
    }
    if (score !== undefined) scored.push([score, name.length, name]);
  }
  const seen = new Set();
  return scored.sort((a, b) => a[0] - b[0] || a[1] - b[1]).map((x) => x[2]).filter((x) => !seen.has(x) && seen.add(x)).slice(0, limit);
}

export function isKnownBreed(value, animal) {
  const v = norm(value);
  const list = animal === "Cat" ? CAT_BREEDS : animal === "Dog" ? DOG_BREEDS : [...DOG_BREEDS, ...CAT_BREEDS];
  return list.some((b) => norm(b) === v);
}
