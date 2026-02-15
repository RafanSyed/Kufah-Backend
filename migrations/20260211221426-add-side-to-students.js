"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // If you're on Postgres, create the ENUM type first (safe if it already exists)
    // We'll try create; if it exists, ignore.
    try {
      await queryInterface.sequelize.query(
        'CREATE TYPE "enum_students_side" AS ENUM (\'brothers\', \'sisters\');'
      );
    } catch (e) {
      // ignore if it already exists
    }

    await queryInterface.addColumn("students", "side", {
      type: Sequelize.ENUM("brothers", "sisters"),
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("students", "side");

    // Drop enum type (Postgres). If it doesn't exist, ignore.
    try {
      await queryInterface.sequelize.query('DROP TYPE "enum_students_side";');
    } catch (e) {
      // ignore if doesn't exist
    }
  },
};