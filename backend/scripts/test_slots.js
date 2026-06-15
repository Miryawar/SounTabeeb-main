const {
  generateSlots,
  isValidSlot,
  normalizeDateToDay,
} = require("../utils/slotHelper");

function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exitCode = 2;
  }
}

console.log(
  "generateSlots 30min 09:00-10:30 ->",
  generateSlots("09:00", "10:30", 30),
);
assert(isValidSlot("09:00"), "09:00 should be valid");
assert(!isValidSlot("24:00"), "24:00 invalid");
assert(
  normalizeDateToDay("2026-06-15T12:34:00Z") === "2026-06-15",
  "normalize date",
);

console.log("All slot helper tests completed");
