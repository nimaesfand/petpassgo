"use client";
import PetPassport from "../PetPassport";

// The real passport, with Biscuit, our sample pup. Tap to flip.
const BISCUIT = {
  id: "sample-biscuit", name: "Biscuit", animal_type: "Dog", role: "Pet", breed: "Dachshund", sex: "Male", color: "Red",
  date_of_birth: "2021-04-12", weight_lb: 11, trained: "yes", handler_name: "Sample Owner", passport_no: "PPG-000-0001",
  passport_issued_at: "2026-11-01T12:00:00Z", verify_code: "SAMP-LE7K-Q3XA",
  emergency_contact_name: "Sample Owner", emergency_contact_phone: "555-0100", show_contact_on_public_id: true,
};

export default function HomePassport() {
  return <PetPassport pet={BISCUIT} sample chipValue="•••• 6789" />;
}
