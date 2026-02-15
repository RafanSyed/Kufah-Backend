"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ✅ Postgres: create ENUM type first (ignore if already exists)
    try {
      await queryInterface.sequelize.query(
        `CREATE TYPE "enum_classes_type" AS ENUM ('combined', 'segregated');`
      );
    } catch (e) {
      // ignore if it already exists
    }

    // ✅ Add the column (nullable)
    await queryInterface.addColumn("classes", "type", {
      type: Sequelize.ENUM("combined", "segregated"),
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("classes", "type");

    // ✅ Drop ENUM type (ignore if doesn't exist)
    try {
      await queryInterface.sequelize.query(`DROP TYPE "enum_classes_type";`);
    } catch (e) {
      // ignore
    }
  },
};
