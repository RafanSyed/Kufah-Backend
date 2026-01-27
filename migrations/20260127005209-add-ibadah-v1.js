'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1) Add goal columns to students (v1)
    await queryInterface.addColumn('students', 'salawat_goal_daily', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('students', 'adhkar_goal_daily', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('students', 'istighfar_goal_daily', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    // 2) Create ibadah_daily table (daily progress per student)
    await queryInterface.createTable('ibadah_daily', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'students',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      day: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      salawat_done: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      adhkar_done: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      istighfar_done: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        // Works well in Postgres/MySQL. If you ever hit an issue, we can switch to Sequelize.fn('NOW')
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // 3) Unique constraint so (student_id, day) is one row per day
    await queryInterface.addConstraint('ibadah_daily', {
      fields: ['student_id', 'day'],
      type: 'unique',
      name: 'ibadah_daily_student_day_unique',
    });

    // 4) Helpful indexes
    await queryInterface.addIndex('ibadah_daily', ['day'], {
      name: 'ibadah_daily_day_idx',
    });

    await queryInterface.addIndex('ibadah_daily', ['student_id'], {
      name: 'ibadah_daily_student_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop dependent table first
    await queryInterface.dropTable('ibadah_daily');

    // Remove goal columns
    await queryInterface.removeColumn('students', 'salawat_goal_daily');
    await queryInterface.removeColumn('students', 'adhkar_goal_daily');
    await queryInterface.removeColumn('students', 'istighfar_goal_daily');
  },
};
