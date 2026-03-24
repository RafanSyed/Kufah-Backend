'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_attendance_status" 
      ADD VALUE IF NOT EXISTS 'No Class';
    `);
  },

  async down(queryInterface, Sequelize) {
    console.log('Cannot remove ENUM values in PostgreSQL');
  },
};