"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("attendance", "email_link", {
      type: Sequelize.STRING,     // link/token URL
      allowNull: true,            // safe for existing rows
      // If you want it unique per attendance record, uncomment:
      // unique: true,
    });

    // Optional: if you will query by email_link (rare), index it
    // await queryInterface.addIndex("attendance", ["email_link"]);
  },

  async down(queryInterface, Sequelize) {
    // Optional: if you added an index above, remove it first
    // await queryInterface.removeIndex("attendance", ["email_link"]);

    await queryInterface.removeColumn("attendance", "email_link");
  },
};
