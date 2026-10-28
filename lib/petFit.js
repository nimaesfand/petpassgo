// Compare a Pet Vault pet to carrier and weight limits already on the pass.
// Limits are taken only from sourced requirement text. Nothing is guessed.

function triples(text) {
  const out = [];
  const re = /(\d+(?:\.\d+)?)\s*(?:\\?"|in(?:ches)?|″|”)?\s*[x×]\s*(\d+(?:\.\d+)?)\s*(?:\\?"|in(?:ches)?|″|”)?\s*[x×]\s*(\d+(?:\.\d+)?)/gi;
  let m;
  while ((m = re.exec(String(text || "")))) out.push([Number(m[1]), Number(m[2]), Number(m[3])]);
  return out;
}

function fits(pet, max) {
  const a = [...pet].sort((x, y) => x - y);
  const b = [...max].sort((x, y) => x - y);
  return a.every((n, i) => n <= b[i] + 0.01);
}

function fmtDims(d) {
  return d.map((n) => String(n)).join(" × ");
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function petFitSentence(pet, limitCards) {
  const cards = limitCards || [];
  if (!cards.length) return "";
  const name = pet?.name || "This pet";
  const texts = cards.map((c) => `${c.title || ""} ${c.description || ""} ${c.what || ""} ${c.why || ""}`);
  const blob = texts.join("\n");
  const maxes = texts.flatMap((t) => triples(t));
  const tall = blob.match(/(\d+(?:\.\d+)?)\s*inches tall/i);
  const noWeight = /no set weight|no weight limit|does not publish a (general )?weight|doesn't publish a (general )?weight/i.test(blob);
  const weightMax = blob.match(/(?:up to|maximum|max(?:imum)? of|under|less than|no more than)\s*(\d+(?:\.\d+)?)\s*(?:lb|lbs|pounds)/i);
  const w = num(pet?.weight_lb);
  const dims = [num(pet?.carrier_length_in), num(pet?.carrier_width_in), num(pet?.carrier_height_in)];
  const hasDims = dims.every((n) => n != null);
  if (!pet || (w == null && !hasDims)) {
    return pet?.name
      ? `Add ${name}'s weight and carrier size in Pet Vault. Then this pass can say whether they fit the limit above.`
      : "Link a Pet Vault pet, and add weight and carrier size, to check the limit above.";
  }
  const lines = [];
  if (hasDims && maxes.length) {
    const ok = maxes.find((m) => fits(dims, m));
    lines.push(ok
      ? `${name}'s carrier (${fmtDims(dims)} in) fits a published maximum of ${fmtDims(ok)} in.`
      : `${name}'s carrier (${fmtDims(dims)} in) is larger than the published maximum of ${fmtDims(maxes[0])} in.`);
  } else if (hasDims && tall) {
    const limit = Number(tall[1]);
    const h = dims[2];
    lines.push(h <= limit
      ? `${name}'s carrier height (${h} in) is within the published ${limit}-inch height limit.`
      : `${name}'s carrier height (${h} in) is over the published ${limit}-inch height limit.`);
  } else if (!hasDims && (maxes.length || tall)) {
    lines.push(`Add ${name}'s carrier length, width, and height in Pet Vault to check the size limit.`);
  }
  if (w != null && weightMax) {
    const limit = Number(weightMax[1]);
    const combined = /including the (carrier|kennel)|pet and carrier|combined/i.test(blob);
    if (combined) lines.push(`${name} is ${w} lb. The published limit is ${limit} lb including the carrier, so pet weight alone cannot show a fit.`);
    else if (w <= limit) lines.push(`${name} is ${w} lb, within the published ${limit} lb limit.`);
    else lines.push(`${name} is ${w} lb, over the published ${limit} lb limit.`);
  } else if (w != null && noWeight) {
    lines.push(`${name} is ${w} lb. The rule above does not set a general cabin weight limit. The pet still has to fit in the carrier.`);
  } else if (w == null && (weightMax || noWeight)) {
    lines.push(`Add ${name}'s weight in Pet Vault to check the weight rule.`);
  }
  return lines.join(" ");
}
