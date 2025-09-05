'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add first_class_of_day column
    await queryInterface.addColumn('students', 'first_class_of_day', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Add takes_saturday_classes column
    await queryInterface.addColumn('students', 'takes_saturday_classes', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove columns on rollback
    await queryInterface.removeColumn('students', 'first_class_of_day');
    await queryInterface.removeColumn('students', 'takes_saturday_classes');
  },
};
