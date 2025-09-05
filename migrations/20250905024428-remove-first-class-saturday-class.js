'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove both columns
    await queryInterface.removeColumn('students', 'takes_saturday_classes');
    await queryInterface.removeColumn('students', 'first_class_of_day');
  },

  async down(queryInterface, Sequelize) {
    // Add them back if migration is rolled back
    await queryInterface.addColumn('students', 'takes_saturday_classes', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('students', 'first_class_of_day', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
};
