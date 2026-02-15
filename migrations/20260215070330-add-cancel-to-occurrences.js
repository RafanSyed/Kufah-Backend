'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add cancelled_at column to class_occurrences table
    await queryInterface.addColumn('class_occurrences', 'cancelled_at', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
      comment: 'When this occurrence was cancelled (null = not cancelled)',
    });

    // Add index for faster queries on cancelled_at
    await queryInterface.addIndex('class_occurrences', ['cancelled_at'], {
      name: 'idx_class_occurrences_cancelled_at',
    });

  },

  async down(queryInterface, Sequelize) {
    // Remove the index first
    await queryInterface.removeIndex('class_occurrences', 'idx_class_occurrences_cancelled_at');
    
    // Remove the column
    await queryInterface.removeColumn('class_occurrences', 'cancelled_at');
    
  }
};