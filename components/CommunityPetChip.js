"use client";
import { PetIllustration } from "./PetIdCard";
import { tokens, font } from "../lib/theme";

export default function CommunityPetChip({ pet }) {
  if (!pet?.pet_id || !pet?.name) return null;
  return (
    <a
      href={`/id/${pet.pet_id}`}
      data-community-pet
      aria-label={`View ${pet.name}'s profile`}
      className="inline-flex items-center gap-2 rounded-full pl-1 pr-3"
      style={{ background: "#fff", border: `1px solid ${tokens.line}`, textDecoration: "none", minHeight: 44 }}
    >
      <span className="rounded-full overflow-hidden flex items-center justify-center" style={{ width: 36, height: 36, background: "#E8EEF7" }}>
        {pet.has_photo ? (
          <img src={`/api/pet-photo/${pet.pet_id}`} alt="" className="object-cover" style={{ width: "100%", height: "100%" }} />
        ) : (
          <PetIllustration type={pet.animal_type} size={36} />
        )}
      </span>
      <span style={{ fontFamily: font.body, fontWeight: 700, fontSize: 15, color: tokens.navy }}>{pet.name}</span>
      {pet.breed ? (
        <span className="rounded-full px-2 py-0.5" style={{ background: tokens.sky, color: tokens.navy, fontFamily: font.body, fontSize: 13, fontWeight: 700 }}>{pet.breed}</span>
      ) : pet.animal_type ? (
        <span className="rounded-full px-2 py-0.5" style={{ background: tokens.sky, color: tokens.navy, fontFamily: font.body, fontSize: 13, fontWeight: 700 }}>{pet.animal_type}</span>
      ) : null}
    </a>
  );
}
