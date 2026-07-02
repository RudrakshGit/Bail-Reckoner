const { _performEvaluation, _isLifeOrDeathSection } = require("../controllers/bailController");
const LegalSection = require("../models/LegalSection");

// Mock the Mongoose model
jest.mock("../models/LegalSection");

describe("Bail Evaluation Logic", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("isLifeOrDeathSection", () => {
    it("identifies explicit flags", () => {
      expect(_isLifeOrDeathSection({ deathPenaltyPossible: true })).toBe(true);
      expect(_isLifeOrDeathSection({ lifeImprisonmentPossible: true })).toBe(true);
    });

    it("identifies text patterns", () => {
      expect(_isLifeOrDeathSection({ description: "punishable with death" })).toBe(true);
      expect(_isLifeOrDeathSection({ offenceName: "Life imprisonment" })).toBe(true);
      expect(_isLifeOrDeathSection({ description: "imprisonment for life" })).toBe(true);
    });

    it("returns false for regular offences", () => {
      expect(_isLifeOrDeathSection({ 
        offenceName: "Theft", 
        description: "Imprisonment up to 3 years",
        deathPenaltyPossible: false,
        lifeImprisonmentPossible: false
      })).toBe(false);
    });
  });

  describe("performEvaluation", () => {
    it("throws error if no sections match", async () => {
      LegalSection.find.mockResolvedValue([]);
      
      await expect(_performEvaluation({ sections: ["IPC 999"], timeServedYears: 0 }))
        .rejects.toThrow("No matching legal sections found");
    });

    it("returns eligible for bailable sections with low risk", async () => {
      LegalSection.find.mockResolvedValue([
        { sectionNumber: "IPC 420", bailable: true, maxPunishmentYears: 7, requiresSurety: true }
      ]);

      const result = await _performEvaluation({
        sections: ["IPC 420"],
        timeServedYears: 1,
        flightRisk: 1,
        witnessRisk: 1,
        previousCriminalRecords: 0
      });

      expect(result.eligible).toBe(true);
      expect(result.reason).toBe("All offences are bailable");
      expect(result.maxPunishmentYears).toBe(7);
      expect(result.proceduralRequirements.requiresSurety).toBe(true);
    });

    it("returns not eligible for non-bailable sections", async () => {
      LegalSection.find.mockResolvedValue([
        { sectionNumber: "IPC 379", offenceName: "Theft", bailable: false, maxPunishmentYears: 3 }
      ]);

      const result = await _performEvaluation({
        sections: ["IPC 379"],
        timeServedYears: 1
      });

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain("non bailable");
      expect(result.judicialDiscretionRequired).toBe(true);
    });

    it("handles multiple life/death sections by picking the one with highest maxPunishmentYears", async () => {
      LegalSection.find.mockResolvedValue([
        { sectionNumber: "A", bailable: false, maxPunishmentYears: 10, lifeImprisonmentPossible: true },
        { sectionNumber: "B", bailable: false, maxPunishmentYears: 20, lifeImprisonmentPossible: true },
        { sectionNumber: "C", bailable: false, maxPunishmentYears: 15, lifeImprisonmentPossible: true }
      ]);

      const result = await _performEvaluation({
        sections: ["A", "B", "C"],
        timeServedYears: 5
      });

      expect(result.highestPunishmentSection).toBe("B");
      expect(result.highestSectionHasLifeOrDeath).toBe(true);
      expect(result.maxPunishmentYears).toBeNull(); // Because it's life/death
      expect(result.reason).toContain("severe offence gravity");
    });

    it("prioritizes life/death sections over non-life/death sections with higher absolute numbers", async () => {
      LegalSection.find.mockResolvedValue([
        { sectionNumber: "Regular", bailable: false, maxPunishmentYears: 30, lifeImprisonmentPossible: false },
        { sectionNumber: "Life", bailable: false, maxPunishmentYears: 10, lifeImprisonmentPossible: true }
      ]);

      const result = await _performEvaluation({
        sections: ["Regular", "Life"],
        timeServedYears: 5
      });

      expect(result.highestPunishmentSection).toBe("Life");
      expect(result.highestSectionHasLifeOrDeath).toBe(true);
      expect(result.maxPunishmentYears).toBeNull();
    });

    it("returns not eligible if risk score is too high", async () => {
      LegalSection.find.mockResolvedValue([
        { sectionNumber: "IPC 420", bailable: true, maxPunishmentYears: 7 }
      ]);

      const result = await _performEvaluation({
        sections: ["IPC 420"],
        timeServedYears: 1,
        flightRisk: 5,
        witnessRisk: 5, // Total risk: 10 > 7
        previousCriminalRecords: 0
      });

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain("High judicial risk");
    });

    it("returns eligible under Section 436A if time served >= half term", async () => {
      LegalSection.find.mockResolvedValue([
        { sectionNumber: "IPC 420", bailable: true, maxPunishmentYears: 10 }
      ]);

      const result = await _performEvaluation({
        sections: ["IPC 420"],
        timeServedYears: 5, // half of 10
      });

      expect(result.eligible).toBe(true);
      expect(result.reason).toContain("Section 436A CrPC");
      expect(result.halfTerm).toBe(5);
    });

    it("does not apply Section 436A for life/death sections", async () => {
      LegalSection.find.mockResolvedValue([
        { sectionNumber: "IPC 302", bailable: false, maxPunishmentYears: 10, lifeImprisonmentPossible: true }
      ]);

      const result = await _performEvaluation({
        sections: ["IPC 302"],
        timeServedYears: 20, 
      });

      expect(result.eligible).toBe(false);
      expect(result.halfTerm).toBeNull();
      expect(result.reason).not.toContain("Section 436A");
    });
  });
});
