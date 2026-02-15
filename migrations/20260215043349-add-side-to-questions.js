"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Postgres: create ENUM type first (ignore if it already exists)
    try {
      await queryInterface.sequelize.query(
        'CREATE TYPE "enum_questions_side" AS ENUM (\'brothers\', \'sisters\');'
      );
    } catch (e) {
      // ignore if it already exists
    }

    await queryInterface.addColumn("questions", "side", {
      type: Sequelize.ENUM("brothers", "sisters"),
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("questions", "side");

    // Postgres: drop ENUM type (ignore if it doesn't exist)
    try {
      await queryInterface.sequelize.query('DROP TYPE "enum_questions_side";');
    } catch (e) {
      // ignore if it doesn't exist
    }
  },
};
