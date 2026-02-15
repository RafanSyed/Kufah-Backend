"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Postgres: create enum type first (safe if it already exists)
    try {
      await queryInterface.sequelize.query(
        'CREATE TYPE "enum_teachers_side" AS ENUM (\'brothers\', \'sisters\');'
      );
    } catch (e) {
      // ignore if it already exists
    }

    await queryInterface.addColumn("teachers", "side", {
      type: Sequelize.ENUM("brothers", "sisters"),
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("teachers", "side");

    // Postgres: drop enum type (safe if it doesn't exist)
    try {
      await queryInterface.sequelize.query('DROP TYPE "enum_teachers_side";');
    } catch (e) {
      // ignore
    }
  },
};
