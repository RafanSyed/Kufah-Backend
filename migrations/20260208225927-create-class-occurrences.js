'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('class_occurrences', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },

      class_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'classes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      // "school day" without time, stored as YYYY-MM-DD
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      // exact start timestamp (timezone-aware)
      // NOTE: sequelize-cli doesn't always let you specify TIMESTAMPTZ directly
      // but Sequelize.DATE maps to timestamptz in Postgres by default.
      starts_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      // null until processed (attendance created + push sent)
      processed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    // Prevent duplicates: one occurrence per class per date
    await queryInterface.addConstraint('class_occurrences', {
      fields: ['class_id', 'date'],
      type: 'unique',
      name: 'uniq_class_occurrence_per_day',
    });

    // Helpful indexes for the worker
    await queryInterface.addIndex('class_occurrences', ['starts_at'], {
      name: 'idx_class_occurrences_starts_at',
    });

    await queryInterface.addIndex('class_occurrences', ['processed_at'], {
      name: 'idx_class_occurrences_processed_at',
    });
  },

  async down(queryInterface, Sequelize) {
    // drop indexes/constraints automatically when dropping the table
    await queryInterface.dropTable('class_occurrences');
  },
};
