"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop unique constraint on "email" if it exists
    await queryInterface.removeConstraint("students", "students_email_key")
      .catch(() => {
        console.log("⚠️ No constraint named students_email_key found, skipping...");
      });
  },

  async down(queryInterface, Sequelize) {
    // Re-add unique constraint if rollback
    await queryInterface.addConstraint("students", {
      fields: ["email"],
      type: "unique",
      name: "students_email_key"
    });
  }
};
